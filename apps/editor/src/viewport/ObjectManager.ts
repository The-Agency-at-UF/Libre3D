import * as THREE from "three";
import {
  type Entity,
  type MaterialLayer,
  type ColorLayer,
  type LightingLayer,
  type ImageLayer,
  type ImageSlot,
} from "../store/useEditorStore";
import { useEditorStore } from "../store/useEditorStore";
import { loadModelAsset } from "../utils/modelAssetStore";
import { loadTextureAsset } from "../utils/textureAssetStore";
import { deriveMaterialLayers, createTextureDedupCache, buildTextureFromLayer } from "../utils/materialLayers";
import { walkGltfScene, nodePathKey } from "../utils/gltfHierarchy";
import { takeParsedModel } from "../utils/importModel";
import { createConfiguredGltfLoader } from "../utils/createGltfLoader";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

type LayeredMaterial =
  | THREE.MeshBasicMaterial
  | THREE.MeshLambertMaterial
  | THREE.MeshPhongMaterial
  | THREE.MeshStandardMaterial
  | THREE.MeshToonMaterial;

const materialClassForModel = (model: LightingLayer["model"]) => {
  switch (model) {
    case "lambert":
      return THREE.MeshLambertMaterial;
    case "phong":
      return THREE.MeshPhongMaterial;
    case "toon":
      return THREE.MeshToonMaterial;
    case "physical":
      return THREE.MeshStandardMaterial;
    case "none":
    default:
      return THREE.MeshBasicMaterial;
  }
};

export class ObjectManager {
  private scene: THREE.Scene;
  private meshMap: Map<string, THREE.Object3D>;

  // Session cache of textures rebuilt from the OPFS texture store, keyed by
  // ImageLayer.textureAssetId. Loaded lazily (and once) the first time an empty
  // material slot actually needs one — a rebuild after a lighting-model change,
  // or an Image layer re-enabled — never re-decoded per sync. loadingTextures
  // guards against firing a second load for an id already in flight.
  private textureCache = new Map<string, THREE.Texture>();
  private loadingTextures = new Set<string>();

  constructor(scene: THREE.Scene, meshMap: Map<string, THREE.Object3D>) {
    this.scene = scene;
    this.meshMap = meshMap;
  }

  private createGeometry(entity: Entity): THREE.BufferGeometry {
    switch (entity.type) {
      case "sphere":
        return new THREE.SphereGeometry(0.5, 32, 16);
      case "torus":
        return new THREE.TorusGeometry(0.55, 0.2, 16, 48);
      case "cube":
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  private createMaterialFromLayers(layers: MaterialLayer[] | undefined): LayeredMaterial {
    const colorLayer = layers?.find((layer): layer is ColorLayer => layer.type === "color");
    const lightingLayer = layers?.find((layer): layer is LightingLayer => layer.type === "lighting");
    const model = lightingLayer?.model ?? "physical";
    const MaterialClass = materialClassForModel(model);

    const material = new MaterialClass({
      color: colorLayer?.color ?? "#ffffff",
      opacity: colorLayer?.opacity ?? 1,
      transparent: (colorLayer?.opacity ?? 1) < 1,
      wireframe: useEditorStore.getState().sceneSettings.wireframe,
    });

    this.applyLightingProperties(material, lightingLayer, model);
    this.applyImageLayers(material, layers);

    return material;
  }

  // The material property (or properties) each ImageLayer slot feeds. The glTF
  // metallic-roughness map is one packed texture Three assigns to both
  // roughnessMap and metalnessMap, so that slot returns two properties.
  private static readonly SLOT_PROPS: Record<ImageSlot, Array<keyof THREE.MeshStandardMaterial>> = {
    color: ["map"],
    normal: ["normalMap"],
    metallicRoughness: ["roughnessMap", "metalnessMap"],
    emissive: ["emissiveMap"],
    ao: ["aoMap"],
  };

  // True when the material actually has this slot's property (materials differ —
  // MeshPhongMaterial has no roughnessMap) and it's currently unset. Used to skip
  // loading/assigning a texture when the slot is already filled (e.g. the parsed
  // glTF material still carries its original map on the common reload path), which
  // both avoids needless work and leaves the untouched parsed textures in place.
  private slotNeedsTexture(material: THREE.Material, slot: ImageSlot): boolean {
    const mat = material as unknown as Record<string, unknown>;
    return ObjectManager.SLOT_PROPS[slot].some((prop) => prop in material && !mat[prop as string]);
  }

  // Assigns the texture to every empty property of the slot the material has,
  // never overwriting a map that's already present. Returns whether anything changed.
  private assignTextureToSlot(material: THREE.Material, slot: ImageSlot, texture: THREE.Texture): boolean {
    const mat = material as unknown as Record<string, unknown>;
    let changed = false;
    for (const prop of ObjectManager.SLOT_PROPS[slot]) {
      if (prop in material && !mat[prop as string]) {
        mat[prop as string] = texture;
        changed = true;
      }
    }
    return changed;
  }

  private clearTextureSlot(material: THREE.Material, slot: ImageSlot): boolean {
    const mat = material as unknown as Record<string, unknown>;
    let changed = false;
    for (const prop of ObjectManager.SLOT_PROPS[slot]) {
      if (prop in material && mat[prop as string]) {
        mat[prop as string] = null;
        changed = true;
      }
    }
    return changed;
  }

  // Returns the cached texture for a layer, or null while kicking off a one-shot
  // async load. When the load lands, assignLoadedTextureToMeshes fills the slot on
  // every mesh using that id; the continuous RAF loop renders it the next frame.
  private getTextureForLayer(layer: ImageLayer): THREE.Texture | null {
    const cached = this.textureCache.get(layer.textureAssetId);
    if (cached) return cached;

    const id = layer.textureAssetId;
    if (!this.loadingTextures.has(id)) {
      this.loadingTextures.add(id);
      loadTextureAsset(id)
        .then(async (blob) => {
          if (!blob) return;
          const texture = await buildTextureFromLayer(blob, layer);
          this.textureCache.set(id, texture);
          this.assignLoadedTextureToMeshes(id);
        })
        .catch((error) => console.error(`[Libre3D] Failed to load texture asset "${id}":`, error))
        .finally(() => this.loadingTextures.delete(id));
    }
    return null;
  }

  // After a texture finishes loading, fill it into any mesh whose entity has an
  // enabled Image layer pointing at this id and an empty slot for it.
  private assignLoadedTextureToMeshes(textureAssetId: string): void {
    const texture = this.textureCache.get(textureAssetId);
    if (!texture) return;
    const entities = useEditorStore.getState().entities;
    for (const [entityId, obj] of this.meshMap) {
      if (!(obj instanceof THREE.Mesh)) continue;
      const layers = entities.find((entity) => entity.id === entityId)?.materialLayers;
      if (!layers) continue;
      const material = obj.material as THREE.Material;
      let changed = false;
      for (const layer of layers) {
        if (layer.type === "image" && layer.enabled && layer.textureAssetId === textureAssetId) {
          if (this.assignTextureToSlot(material, layer.slot, texture)) changed = true;
        }
      }
      if (changed) material.needsUpdate = true;
    }
  }

  // Reconciles a material's texture slots with the entity's Image layers: fills
  // empty slots for enabled layers (loading the texture on demand) and clears
  // slots for disabled ones. Deliberately does NOT replace a map that's already
  // present, so imported meshes keep their untouched parsed glTF textures on the
  // common path and only the rebuild/re-enable cases pull from the OPFS store.
  private applyImageLayers(material: THREE.Material, layers: MaterialLayer[] | undefined): void {
    if (!layers) return;
    let changed = false;
    for (const layer of layers) {
      if (layer.type !== "image") continue;
      if (layer.enabled) {
        if (!this.slotNeedsTexture(material, layer.slot)) continue;
        const texture = this.getTextureForLayer(layer);
        if (texture && this.assignTextureToSlot(material, layer.slot, texture)) changed = true;
      } else if (this.clearTextureSlot(material, layer.slot)) {
        changed = true;
      }
    }
    if (changed) material.needsUpdate = true;
  }

  // Derives editable Color/Lighting/Image layers from the parsed glTF material of
  // any resolved import mesh that has none yet, and writes them back to the store.
  // This is where both fresh imports (nodes created without materialLayers) and
  // pre-upgrade imports (materialLayers: undefined in old persisted state) get a
  // real layer stack — it can't happen at migrate() time, which has no parsed glTF.
  private async backfillMaterialLayers(
    resolved: Array<{ entityId: string; object: THREE.Object3D }>,
  ): Promise<void> {
    const entities = useEditorStore.getState().entities;
    const pending = resolved.filter(({ entityId, object }) => {
      if (!(object instanceof THREE.Mesh)) return false;
      return !entities.find((entity) => entity.id === entityId)?.materialLayers;
    });
    if (pending.length === 0) return;

    // One cache across the whole import so images reused between meshes (a shared
    // packed metallic-roughness map, say) are extracted and stored exactly once.
    const cache = createTextureDedupCache();
    for (const { entityId, object } of pending) {
      const mesh = object as THREE.Mesh;
      const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (!material) continue;
      try {
        const layers = await deriveMaterialLayers(material, cache);
        // Re-read the store: this runs async, after the hydrate's initial set(),
        // and setEntityMaterialLayers no-ops if the entity was removed meanwhile.
        useEditorStore.getState().setEntityMaterialLayers(entityId, layers);
      } catch (error) {
        console.error(`[Libre3D] Failed to derive material layers for imported node "${entityId}":`, error);
      }
    }
  }

  private applyLightingProperties(
    material: LayeredMaterial,
    lightingLayer: LightingLayer | undefined,
    model: LightingLayer["model"]
  ): void {
    if (model === "physical" && material instanceof THREE.MeshStandardMaterial) {
      material.roughness = lightingLayer?.roughness ?? 0.45;
      material.metalness = lightingLayer?.metalness ?? 0.08;
    }
    if (model === "phong" && material instanceof THREE.MeshPhongMaterial) {
      material.shininess = lightingLayer?.shininess ?? 30;
    }
    if (model !== "none" && "emissive" in material) {
      (material as THREE.MeshStandardMaterial).emissive.set(lightingLayer?.emissive ?? "#000000");
      (material as THREE.MeshStandardMaterial).emissiveIntensity = lightingLayer?.emissiveIntensity ?? 1;
    }
  }

  // A thin wireframe box parented directly to the mesh, sized from the mesh's own
  // geometry bounding box. Parenting it (rather than recomputing a world-space AABB
  // every frame, e.g. THREE.BoxHelper) means it inherits the mesh's full transform for
  // free — it stays a tight, correctly oriented box even when the object is rotated,
  // matching Spline's selection indicator instead of a looser world-axis-aligned box.
  private createSelectionOutline(boundingBox: THREE.Box3, color = 0xffffff): THREE.LineSegments {
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    boxGeometry.translate(center.x, center.y, center.z);
    const edges = new THREE.EdgesGeometry(boxGeometry);
    boxGeometry.dispose();

    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      depthTest: false, // always render on top, same convention TransformControls uses
    });

    const outline = new THREE.LineSegments(edges, material);
    outline.visible = false;
    outline.renderOrder = 999;
    outline.raycast = () => {}; // never an independent click/box-select target —
                                 // Raycaster doesn't check .visible, so this guards
                                 // against it being hit while hidden (see gizmo picker fix)
    return outline;
  }

  private createSceneObject(entity: Entity): THREE.Object3D {
    if (entity.type === "importedModel") {
      const group = new THREE.Group();
      group.position.set(...entity.position);
      group.rotation.set(...entity.rotation);
      group.scale.set(...entity.scale);
      group.userData.assetId = entity.assetId;

      if (entity.assetId) {
        this.hydrateImportedModel(group, entity.assetId, entity.id);
      } else {
        this.showImportedModelError(group);
      }

      return group;
    } else if (entity.type === "group") {
      // Pure transform pivot (Blender Empty / Spline Group) — no geometry, no
      // outline. It's selectable from the hierarchy and via its children, and
      // the transform gizmo attaches to it like any other object.
      const group = new THREE.Group();
      group.position.set(...entity.position);
      group.rotation.set(...entity.rotation);
      group.scale.set(...entity.scale);
      return group;
    } else if (entity.type === "directionalLight") {
      const light = new THREE.DirectionalLight(new THREE.Color(entity.color ?? "#ffffff"), 2.2);
      light.position.set(...entity.position);
      light.rotation.set(...entity.rotation);
      light.scale.set(...entity.scale);

      // Target setup
      light.target.position.set(0, 0, 0);
      this.scene.add(light.target);
      light.userData.target = light.target;

      // Helper setup
      const helper = new THREE.DirectionalLightHelper(light, 1.0, 0xfde047);
      helper.userData.entityId = entity.id;
      this.scene.add(helper);
      light.userData.helper = helper;

      return light;
    } else {
      const geometry = this.createGeometry(entity);
      geometry.computeBoundingBox();
      const mesh = new THREE.Mesh(geometry, this.createMaterialFromLayers(entity.materialLayers));
      mesh.position.set(...entity.position);
      mesh.rotation.set(...entity.rotation);
      mesh.scale.set(...entity.scale);

      const outline = this.createSelectionOutline(geometry.boundingBox!);
      mesh.add(outline);
      mesh.userData.selectionOutline = outline;

      return mesh;
    }
  }

  // Recolors/rebuilds the group's outline as a red box so a failed import stays visible,
  // selectable, and obviously broken instead of silently vanishing from the scene.
  private showImportedModelError(group: THREE.Group): void {
    const existingOutline = group.userData.selectionOutline as THREE.LineSegments | undefined;
    if (existingOutline) {
      group.remove(existingOutline);
      existingOutline.geometry.dispose();
      (existingOutline.material as THREE.Material).dispose();
    }

    const errorBox = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));
    const outline = this.createSelectionOutline(errorBox, 0xff3b30);
    group.add(outline);
    group.userData.selectionOutline = outline;
    group.userData.loadError = true;
  }

  private async hydrateImportedModel(group: THREE.Group, assetId: string, rootEntityId: string): Promise<void> {
    try {
      // A fresh import parsed this exact buffer moments ago and left the result
      // behind for us (see importModel.ts) — claim it instead of reading the
      // same bytes back out of storage and parsing them again. On reload
      // there is no cached parse, so we take the buffer path below, which is
      // the only path that ever runs for persisted models.
      const cachedGltf = takeParsedModel(assetId);
      if (cachedGltf) {
        this.attachHydratedModel(group, cachedGltf, rootEntityId);
        return;
      }

      const buffer = await loadModelAsset(assetId);
      if (!buffer) {
        console.error(`[Libre3D] Imported model asset "${assetId}" was not found in storage.`);
        this.showImportedModelError(group);
        return;
      }

      const loader = await createConfiguredGltfLoader();

      loader.parse(
        buffer,
        "",
        (gltf) => {
          this.attachHydratedModel(group, gltf, rootEntityId);
        },
        (error) => {
          console.error(`[Libre3D] Failed to parse imported model asset "${assetId}":`, error);
          this.showImportedModelError(group);
        },
      );
    } catch (error) {
      console.error(`[Libre3D] Failed to load imported model asset "${assetId}":`, error);
      this.showImportedModelError(group);
    }
  }

  // Everything hydration does once a parsed glTF is in hand, regardless of
  // whether it came from the import-time cache or a parse of the stored buffer.
  private attachHydratedModel(group: THREE.Group, gltf: GLTF, rootEntityId: string): void {
    // Bounding box MUST be computed before the scene is parented to `group` —
    // once parented, world and local space diverge and the box would reflect
    // wherever `group` happens to already be positioned in the scene.
    const boundingBox = new THREE.Box3().setFromObject(gltf.scene);

    // Map every glTF node to its nodePath so the flat node entities created
    // by prepareModelImport can be resolved back to the actual parsed
    // Object3D without re-parsing. walkGltfScene is the shared definition of
    // that path convention — extraction and hydration must use the same one.
    const nodeByPath = new Map<string, THREE.Object3D>();
    walkGltfScene(gltf.scene, (object, nodePath) => {
      nodeByPath.set(nodePathKey(nodePath), object);
    });

    const nodeEntities = useEditorStore
      .getState()
      .entities.filter((entity) => entity.rootEntityId === rootEntityId && entity.id !== rootEntityId);

    const resolvedObjects: Array<{ entityId: string; object: THREE.Object3D }> = [];
    for (const entity of nodeEntities) {
      if (!entity.nodePath) continue;
      const object = nodeByPath.get(nodePathKey(entity.nodePath));
      if (!object) continue;
      object.userData.entityId = entity.id;
      object.userData.entityType = "importedModel";
      this.meshMap.set(entity.id, object);
      resolvedObjects.push({ entityId: entity.id, object });
    }

    // Record each node's *structural* (file-order) parent entity as its
    // tracked parent — in a second pass, so every object already carries
    // its entityId regardless of entity array order. applyParenting then
    // reattaches exactly the nodes whose store parentId diverges from the
    // file structure (i.e. nodes the user reparented in a past session).
    // Direct children of gltf.scene structurally belong to the root group.
    for (const { object } of resolvedObjects) {
      object.userData.parentEntityId = object.parent?.userData?.entityId ?? rootEntityId;
    }

    // The parsed objects carry the *file's* transforms, but the store is
    // the source of truth — the user may have moved/hidden nodes in a
    // past session (gizmo edits update the store, and syncMeshes skipped
    // these entities while hydration was pending, never to re-run
    // unprompted). Re-apply the stored local TRS and flags to every
    // registered node so a reload doesn't silently revert edits.
    for (const entity of nodeEntities) {
      const object = this.meshMap.get(entity.id);
      if (object) this.syncEntityToSceneObject(object, entity, false);
    }

    // gltf.scene's internal node nesting is already correct — no manual
    // reparenting needed once every node object is tagged and registered.
    group.add(gltf.scene);

    const outline = this.createSelectionOutline(boundingBox);
    group.add(outline);
    group.userData.selectionOutline = outline;

    // Now that the nodes exist, apply any store-level hierarchy that
    // diverges from the file structure, and attach any entities that were
    // waiting for one of these nodes as their parent.
    this.applyParenting(useEditorStore.getState().entities);

    // Fire-and-forget: derive editable material layers for any resolved mesh
    // that doesn't have them yet (fresh imports and pre-upgrade imports alike).
    // Writing them back re-triggers a sync, which reconciles the material — the
    // parsed glTF material and its textures stay untouched on that pass.
    void this.backfillMaterialLayers(resolvedObjects);
  }

  public disposeSceneObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      const material = obj.material;
      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose());
      } else {
        material.dispose();
      }
      const outline = obj.userData.selectionOutline as THREE.LineSegments | undefined;
      if (outline) {
        outline.geometry.dispose();
        (outline.material as THREE.Material).dispose();
      }
    } else if (obj instanceof THREE.DirectionalLight) {
      if (obj.userData.helper) {
        this.scene.remove(obj.userData.helper);
        obj.userData.helper.dispose();
      }
      if (obj.userData.target) {
        this.scene.remove(obj.userData.target);
      }
    } else if (obj instanceof THREE.Group) {
      const outline = obj.userData.selectionOutline as THREE.LineSegments | undefined;
      if (outline) {
        outline.geometry.dispose();
        (outline.material as THREE.Material).dispose();
      }

      const textureSlots = [
        "map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap",
        "aoMap", "alphaMap", "bumpMap", "displacementMap", "envMap",
        "lightMap", "clearcoatMap", "clearcoatNormalMap", "clearcoatRoughnessMap",
        "sheenColorMap", "sheenRoughnessMap", "transmissionMap", "thicknessMap",
      ] as const;

      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            textureSlots.forEach((slot) => {
              const texture = (material as any)[slot] as THREE.Texture | undefined;
              // Skip textures owned by the ObjectManager session cache — they're
              // shared across meshes by textureAssetId, so freeing one here would
              // break every other mesh still using it. The cache outlives the mesh.
              if (texture && !texture.userData?.libre3dManaged) texture.dispose();
            });
            material.dispose();
          });
        }
      });
    }
  }

  private syncEntityToSceneObject(obj: THREE.Object3D, entity: Entity, isBeingDragged: boolean): void {
    if (!isBeingDragged) {
      obj.position.set(...entity.position);
      obj.rotation.set(...entity.rotation);
      obj.scale.set(...entity.scale);
    }
    obj.visible = entity.visible;
    obj.userData.locked = entity.locked;

    // Imported meshes are THREE.Mesh instances too, and now carry derived
    // materialLayers (see backfillMaterialLayers) — so this drives their material
    // the same as a primitive. Meshes still awaiting their backfill (materialLayers
    // undefined) skip this and keep their parsed glTF material untouched.
    if (obj instanceof THREE.Mesh && entity.materialLayers) {
      const colorLayer = entity.materialLayers?.find((layer): layer is ColorLayer => layer.type === "color");
      const lightingLayer = entity.materialLayers?.find((layer): layer is LightingLayer => layer.type === "lighting");
      const model = lightingLayer?.model ?? "physical";
      const MaterialClass = materialClassForModel(model);

      // A parsed glTF PBR material is often MeshPhysicalMaterial (a subclass of
      // MeshStandardMaterial). Treat that as already matching "physical" so we take
      // the in-place branch and keep its textures/advanced features, rather than
      // rebuilding it into a plain textureless MeshStandardMaterial on first sync.
      const materialMatches =
        model === "physical"
          ? obj.material instanceof THREE.MeshStandardMaterial
          : obj.material.constructor === MaterialClass;

      if (!materialMatches) {
        const oldMaterial = obj.material as THREE.Material;
        obj.material = this.createMaterialFromLayers(entity.materialLayers);
        oldMaterial.dispose();
      } else {
        const material = obj.material as LayeredMaterial;
        material.color.set(colorLayer?.color ?? "#ffffff");
        const opacity = colorLayer?.opacity ?? 1;
        material.opacity = opacity;
        material.transparent = opacity < 1;
        material.wireframe = useEditorStore.getState().sceneSettings.wireframe;
        this.applyLightingProperties(material, lightingLayer, model);
        this.applyImageLayers(material, entity.materialLayers);
      }
    } else if (obj instanceof THREE.DirectionalLight) {
      obj.color.set(entity.color ?? "#ffffff");
      if (obj.userData.helper) {
        obj.userData.helper.visible = entity.visible;
        obj.userData.helper.update();
      }
    }
  }

  public syncMeshes(entities: Entity[], transformTarget: THREE.Object3D | null, isDragging: boolean): Set<string> {
    const nextIds = new Set(entities.map((entity) => entity.id));
    const processedIds = new Set<string>();

    for (const entity of entities) {
      processedIds.add(entity.id);
      let existingObj = this.meshMap.get(entity.id);
      const isBeingDragged = existingObj && transformTarget === existingObj && isDragging;

      if (existingObj && existingObj.userData.entityType !== entity.type) {
        (existingObj.parent ?? this.scene).remove(existingObj);
        this.disposeSceneObject(existingObj);
        this.meshMap.delete(entity.id);
        existingObj = undefined;
      }

      if (!existingObj) {
        // Imported model nodes (no assetId, but nodePath set) are resolved from
        // the root's async hydrate — don't spawn a generic placeholder for them,
        // just wait until hydrateImportedModel populates meshMap.
        const isPendingImportNode = entity.type === "importedModel" && !entity.assetId;
        if (isPendingImportNode) continue;

        const obj = this.createSceneObject(entity);
        obj.userData.entityId = entity.id;
        obj.userData.entityType = entity.type;
        obj.userData.locked = entity.locked;
        // Created flat on the scene; the applyParenting pass below moves it
        // under its store parent once every sibling object exists (parents can
        // appear later in the entities array than their children).
        obj.userData.parentEntityId = null;
        obj.visible = entity.visible;
        this.scene.add(obj);
        this.meshMap.set(entity.id, obj);
        continue;
      }

      const skipSync = !!isBeingDragged;
      this.syncEntityToSceneObject(existingObj, entity, skipSync);
    }

    // Identify stale objects
    const staleIds = new Set<string>();
    for (const entityId of this.meshMap.keys()) {
      if (!nextIds.has(entityId)) {
        staleIds.add(entityId);
      }
    }

    for (const staleId of staleIds) {
      const obj = this.meshMap.get(staleId);
      if (obj) {
        // Imported model node objects are nested inside gltf.scene, not direct
        // children of `this.scene` — detach from their actual parent so deleting
        // a single node doesn't leave it stuck (and re-rendered) inside the group.
        (obj.parent ?? this.scene).remove(obj);
        this.disposeSceneObject(obj);
        this.meshMap.delete(staleId);
      }
    }

    this.applyParenting(entities);

    return staleIds;
  }

  // Makes the THREE graph agree with store-level parentId. Each object tracks
  // the parent entity it is currently attached under (userData.parentEntityId);
  // only a diff triggers a reattach, so glTF-internal nesting (gltf.scene
  // wrappers, file-order parents) is left untouched for entities the user never
  // reparented. Local TRS is re-applied from the store after a reattach — the
  // store already solved it against the new parent, so no .attach() world-math
  // is needed here. A missing parent object (async glTF hydration still in
  // flight) is skipped; hydrateImportedModel re-runs this pass when it finishes.
  private applyParenting(entities: Entity[]): void {
    for (const entity of entities) {
      const obj = this.meshMap.get(entity.id);
      if (!obj) continue;

      const desiredParentId = entity.parentId ?? null;
      const trackedParentId = (obj.userData.parentEntityId ?? null) as string | null;
      if (desiredParentId === trackedParentId) continue;

      const parentObj = desiredParentId ? this.meshMap.get(desiredParentId) : this.scene;
      if (!parentObj) continue;

      parentObj.add(obj);
      obj.userData.parentEntityId = desiredParentId;
      obj.position.set(...entity.position);
      obj.rotation.set(...entity.rotation);
      obj.scale.set(...entity.scale);
    }
  }

  public getObject(id: string): THREE.Object3D | undefined {
    return this.meshMap.get(id);
  }

  public getMeshes(): Map<string, THREE.Object3D> {
    return this.meshMap;
  }
}
