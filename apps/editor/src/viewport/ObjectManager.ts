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
import { walkGltfScene, nodePathKey, collectSkinnedBones } from "../utils/gltfHierarchy";
import { pruneImportNodes, type PrunableNode } from "../utils/pruneImportHierarchy";
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

  // Root entity ids currently mid-hydrateImportedModel. Guards the forced
  // re-hydrate below from tearing down a root whose async parse hasn't
  // resolved yet.
  private hydratingRootIds = new Set<string>();

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

  // Derives the actual transparent/alphaTest/depthWrite a material needs from
  // the layer's captured alphaMode -- not scalar opacity alone. BLEND keeps
  // transparent:true so per-pixel texture alpha still blends, but only disables
  // depthWrite when the material is actually translucent (opacity < 1) -- the
  // standard depthWrite:false convention lets multiple see-through objects sort
  // against each other, but on a fully-opaque BLEND mesh (a solid model whose
  // exporter, e.g. Blender, flags it BLEND spuriously) it destroys the mesh's
  // OWN depth sorting, so a large double-sided mesh renders with chunks missing.
  // Writing depth when opacity is 1 restores that self-occlusion without losing
  // edge alpha. MASK is a binary cutout via alphaTest, not blending, though a
  // manually-reduced opacity on top of it still enables blending. OPAQUE (and
  // legacy layers with no alphaMode recorded -- primitives, or layers derived
  // before this shipped) fall back to the original opacity-only heuristic.
  private computeAlphaBlendState(
    colorLayer: ColorLayer | undefined,
    opacity: number,
  ): { transparent: boolean; alphaTest: number; depthWrite: boolean } {
    const alphaMode = colorLayer?.alphaMode ?? "OPAQUE";
    if (alphaMode === "BLEND") return { transparent: true, alphaTest: 0, depthWrite: opacity >= 1 };
    if (alphaMode === "MASK") return { transparent: opacity < 1, alphaTest: colorLayer?.alphaCutoff ?? 0.5, depthWrite: true };
    return { transparent: opacity < 1, alphaTest: 0, depthWrite: true };
  }

  private createMaterialFromLayers(layers: MaterialLayer[] | undefined): LayeredMaterial {
    const colorLayer = layers?.find((layer): layer is ColorLayer => layer.type === "color");
    const lightingLayer = layers?.find((layer): layer is LightingLayer => layer.type === "lighting");
    const model = lightingLayer?.model ?? "physical";
    const MaterialClass = materialClassForModel(model);
    const opacity = colorLayer?.opacity ?? 1;
    const alphaState = this.computeAlphaBlendState(colorLayer, opacity);

    const material = new MaterialClass({
      color: colorLayer?.color ?? "#ffffff",
      opacity,
      transparent: alphaState.transparent,
      alphaTest: alphaState.alphaTest,
      depthWrite: alphaState.depthWrite,
      side: colorLayer?.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
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

  // Retroactively collapses/drops any prunable node still present on an import
  // created before this shipped. Reuses the exact pruneImportNodes algorithm
  // extraction runs on new imports, fed from entities already in the store
  // instead of a fresh ImportNodeSpec[] -- hasMesh/isProtected are derived from
  // the same parsed gltf every hydrate already has in hand, no extra parse
  // needed. A no-op (removedIds empty) for any import already pruned, whether
  // at extraction time or a previous hydrate's backfill.
  private backfillPruneHierarchy(gltf: GLTF, rootEntityId: string): void {
    const entities = useEditorStore.getState().entities;
    const rootEntity = entities.find((entity) => entity.id === rootEntityId);
    if (!rootEntity) return;

    const boneSet = collectSkinnedBones(gltf.scene);
    const nodeByPath = new Map<string, THREE.Object3D>();
    walkGltfScene(gltf.scene, (object, nodePath) => {
      nodeByPath.set(nodePathKey(nodePath), object);
    });

    const nodeEntities = entities.filter(
      (entity) => entity.rootEntityId === rootEntityId && entity.id !== rootEntityId,
    );

    const prunable: PrunableNode[] = [
      {
        id: rootEntityId,
        parentId: null,
        hasMesh: false,
        isProtected: true,
        position: rootEntity.position,
        rotation: rootEntity.rotation,
        scale: rootEntity.scale,
      },
      ...nodeEntities.map((entity) => {
        const object = entity.nodePath ? nodeByPath.get(nodePathKey(entity.nodePath)) : undefined;
        return {
          id: entity.id,
          parentId: entity.parentId ?? rootEntityId,
          hasMesh: object instanceof THREE.Mesh,
          // A node whose object can't be found (shouldn't happen) is protected
          // defensively rather than risking an incorrect prune.
          isProtected: object ? boneSet.has(object) : true,
          position: entity.position,
          rotation: entity.rotation,
          scale: entity.scale,
        };
      }),
    ];

    const { keptById, removedIds } = pruneImportNodes(prunable);
    if (removedIds.size === 0) return;

    const updates = new Map<
      string,
      { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number]; parentId: string | null }
    >();
    for (const [id, node] of keptById) {
      if (id === rootEntityId) continue;
      updates.set(id, { position: node.position, rotation: node.rotation, scale: node.scale, parentId: node.parentId });
    }

    useEditorStore.getState().applyHierarchyPrune(removedIds, updates);
  }

  // Resets every parsed Object3D that has no surviving store entity (i.e. was
  // pruned) to an identity local transform. Its transform was already baked
  // into its kept child by pruneImportNodes, so the physical node must now
  // contribute nothing; see the call site in attachHydratedModel for why.
  private neutralizePrunedObjects(
    nodeByPath: Map<string, THREE.Object3D>,
    nodeEntities: Entity[],
  ): void {
    const keptPaths = new Set(
      nodeEntities
        .filter((entity) => entity.nodePath)
        .map((entity) => nodePathKey(entity.nodePath!)),
    );
    for (const [pathKey, object] of nodeByPath) {
      if (keptPaths.has(pathKey)) continue;
      object.position.set(0, 0, 0);
      object.quaternion.identity();
      object.scale.set(1, 1, 1);
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
    outline.raycast = () => { }; // never an independent click/box-select target —
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
    this.hydratingRootIds.add(rootEntityId);
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
        this.hydratingRootIds.delete(rootEntityId);
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
          this.hydratingRootIds.delete(rootEntityId);
        },
      );
    } catch (error) {
      console.error(`[Libre3D] Failed to load imported model asset "${assetId}":`, error);
      this.showImportedModelError(group);
      this.hydratingRootIds.delete(rootEntityId);
    }
  }

  // Everything hydration does once a parsed glTF is in hand, regardless of
  // whether it came from the import-time cache or a parse of the stored buffer.
  private attachHydratedModel(group: THREE.Group, gltf: GLTF, rootEntityId: string): void {
    // Bounding box MUST be computed before the scene is parented to `group` —
    // once parented, world and local space diverge and the box would reflect
    // wherever `group` happens to already be positioned in the scene.
    const boundingBox = new THREE.Box3().setFromObject(gltf.scene);

    // Retroactively prune any already-persisted import created before this
    // shipped -- a no-op for anything extracted after (already pruned at
    // extraction time), real work only for pre-upgrade imports, mirroring how
    // backfillMaterialLayers below backfills materialLayers.
    this.backfillPruneHierarchy(gltf, rootEntityId);

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

    // Neutralize the transforms of pruned wrapper/leaf objects. Pruning removed
    // their *store* entities and baked each wrapper's transform into its
    // surviving child, but the actual Object3Ds are still physically nested in
    // gltf.scene between kept nodes. Left as-is they'd re-apply their original
    // transform on top of the already-baked child transform (a double-apply,
    // e.g. a child of a scale-2 wrapper rendering at scale 4). Zeroing them to
    // identity makes them inert pass-throughs so the baked child transform is
    // the only one that counts. Bones and meshes are never pruned, so this only
    // ever touches genuine empties.
    this.neutralizePrunedObjects(nodeByPath, nodeEntities);

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
    this.hydratingRootIds.delete(rootEntityId);
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
        const alphaState = this.computeAlphaBlendState(colorLayer, opacity);
        material.opacity = opacity;
        material.transparent = alphaState.transparent;
        material.alphaTest = alphaState.alphaTest;
        material.depthWrite = alphaState.depthWrite;
        material.side = colorLayer?.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
        material.wireframe = useEditorStore.getState().sceneSettings.wireframe;
        material.needsUpdate = true; // alphaTest/transparent changes need a shader recompile
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

    // An imported-model *node* (non-root: no assetId) only gets its Object3D back
    // via its root's hydrateImportedModel -> attachHydratedModel pass, which only
    // runs when the root's own Object3D is (re)created. If a node was deleted and
    // disposed on its own (root untouched -- e.g. undo restoring just that node)
    // there's otherwise no path back into the scene for it. Group any such
    // missing nodes by root and patch each root's subtree in place (see
    // reattachMissingImportNodes) rather than tearing the whole import down --
    // this only rebuilds the node(s) that actually need it, leaves every
    // surviving sibling untouched, and gives the reattached node a brief fade-in
    // instead of a hard pop back into place. Skip roots already mid-patch
    // (hydratingRootIds) so overlapping delete/undo cycles can't race.
    const missingByRoot = new Map<string, string[]>();
    for (const entity of entities) {
      if (entity.type !== "importedModel" || entity.assetId || !entity.rootEntityId) continue;
      if (
        !this.meshMap.has(entity.id) &&
        this.meshMap.has(entity.rootEntityId) &&
        !this.hydratingRootIds.has(entity.rootEntityId)
      ) {
        const list = missingByRoot.get(entity.rootEntityId) ?? [];
        list.push(entity.id);
        missingByRoot.set(entity.rootEntityId, list);
      }
    }
    for (const [rootId, missingIds] of missingByRoot) {
      void this.reattachMissingImportNodes(rootId, missingIds);
    }

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

  // Patches a resolved import's subtree in place to bring back node(s) whose
  // Object3D was disposed independently of the root (see syncMeshes) — reparses
  // the import's buffer (there's no partial-parse API), but only splices the
  // missing node(s) back into the *existing* live scene graph rather than
  // rebuilding the whole import, so every untouched sibling keeps its original
  // Object3D. Falls back to forceFullRehydrate if a missing node's parent can't
  // be cleanly resolved, so correctness never depends on this optimization.
  private async reattachMissingImportNodes(rootEntityId: string, missingIds: string[]): Promise<void> {
    this.hydratingRootIds.add(rootEntityId);
    try {
      const entities = useEditorStore.getState().entities;
      const rootEntity = entities.find((entity) => entity.id === rootEntityId);
      const rootObj = this.meshMap.get(rootEntityId);
      if (!rootEntity?.assetId || !rootObj) return;

      let gltf: GLTF | null | undefined = takeParsedModel(rootEntity.assetId);
      if (!gltf) {
        const buffer = await loadModelAsset(rootEntity.assetId);
        if (!buffer) {
          console.error(`[Libre3D] Imported model asset "${rootEntity.assetId}" was not found in storage.`);
          return;
        }
        const loader = await createConfiguredGltfLoader();
        gltf = await new Promise<GLTF | null>((resolve) => {
          loader.parse(
            buffer,
            "",
            (result) => resolve(result),
            (error) => {
              console.error(`[Libre3D] Failed to parse imported model asset "${rootEntity.assetId}":`, error);
              resolve(null);
            },
          );
        });
      }
      if (!gltf) {
        this.forceFullRehydrate(rootEntityId);
        return;
      }

      const nodeByPath = new Map<string, THREE.Object3D>();
      walkGltfScene(gltf.scene, (object, nodePath) => {
        nodeByPath.set(nodePathKey(nodePath), object);
      });

      // Shallow-to-deep order guarantees a missing parent is spliced in (and
      // registered in meshMap) before any of its missing children are processed,
      // so a whole missing subtree — not just a single leaf — resolves correctly.
      const pending = missingIds
        .map((id) => entities.find((entity) => entity.id === id))
        .filter((entity): entity is Entity => !!entity?.nodePath)
        .sort((a, b) => a.nodePath!.length - b.nodePath!.length);

      const resolvedObjects: Array<{ entityId: string; object: THREE.Object3D }> = [];

      for (const entity of pending) {
        const freshObject = nodeByPath.get(nodePathKey(entity.nodePath!));
        if (!freshObject) continue;

        // A node's structural parent is just its own nodePath minus the last
        // index (the same convention walkGltfScene/nodePathKey define); an
        // empty parent path means it's a direct child of gltf.scene, i.e. the
        // root itself.
        const parentPath = entity.nodePath!.slice(0, -1);
        const parentEntityId =
          parentPath.length === 0
            ? rootEntityId
            : entities.find(
              (candidate) =>
                candidate.rootEntityId === rootEntityId &&
                nodePathKey(candidate.nodePath ?? []) === nodePathKey(parentPath),
            )?.id;
        const parentObj = parentEntityId ? this.meshMap.get(parentEntityId) : undefined;
        if (!parentObj) continue;

        parentObj.add(freshObject);
        freshObject.userData.entityId = entity.id;
        freshObject.userData.entityType = "importedModel";
        freshObject.userData.parentEntityId = parentEntityId;
        this.meshMap.set(entity.id, freshObject);
        resolvedObjects.push({ entityId: entity.id, object: freshObject });
      }

      if (resolvedObjects.length !== pending.length) {
        // Something didn't resolve cleanly (an unresolvable parent) — don't
        // leave the scene half-patched, fall back to the known-correct
        // full-recreate path for this root instead.
        this.forceFullRehydrate(rootEntityId);
        return;
      }

      for (const { entityId, object } of resolvedObjects) {
        const entity = entities.find((candidate) => candidate.id === entityId)!;
        this.syncEntityToSceneObject(object, entity, false);
        if (object instanceof THREE.Mesh) {
          const material = Array.isArray(object.material) ? object.material[0] : object.material;
          if (material) this.fadeInMesh(object, material.opacity);
        }
      }

      this.applyParenting(useEditorStore.getState().entities);
      void this.backfillMaterialLayers(resolvedObjects);
    } finally {
      this.hydratingRootIds.delete(rootEntityId);
    }
  }

  // Tears down and rebuilds an entire import's subtree from a fresh parse.
  // This was syncMeshes' original (pre-fade) fix for a node coming back with no
  // live object — kept now as reattachMissingImportNodes' fallback for the rare
  // case it can't cleanly resolve a missing node's parent on its own. Leaves
  // rootEntityId out of meshMap so the next syncMeshes pass's normal
  // !existingObj branch recreates it via createSceneObject/hydrateImportedModel.
  private forceFullRehydrate(rootEntityId: string): void {
    const rootObj = this.meshMap.get(rootEntityId);
    if (!rootObj) return;
    (rootObj.parent ?? this.scene).remove(rootObj);
    this.disposeSceneObject(rootObj);
    const entities = useEditorStore.getState().entities;
    for (const entity of entities) {
      if (entity.rootEntityId === rootEntityId) this.meshMap.delete(entity.id);
    }
    this.meshMap.delete(rootEntityId);
  }

  // Fades a freshly reattached node's material in from transparent to its real
  // opacity over a short duration, mirroring Spline's brief fade-in when a
  // deleted node is undone, instead of a hard pop back into place. Runs its own
  // rAF chain independent of the main render loop — useViewportRenderer already
  // renders every frame unconditionally, so mutating opacity here is picked up
  // automatically with no signal back to React needed.
  private fadeInMesh(mesh: THREE.Mesh, targetOpacity: number, durationMs = 300): void {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const wasTransparent = materials.map((material) => material.transparent);
    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0;
      material.needsUpdate = true;
    });

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      materials.forEach((material) => {
        material.opacity = eased * targetOpacity;
      });
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        materials.forEach((material, index) => {
          material.opacity = targetOpacity;
          material.transparent = targetOpacity < 1 ? true : wasTransparent[index];
          material.needsUpdate = true;
        });
      }
    };
    requestAnimationFrame(step);
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
