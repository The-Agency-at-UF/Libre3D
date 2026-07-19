import * as THREE from "three";
import { type Entity, type MaterialLayer, type ColorLayer, type LightingLayer } from "../store/useEditorStore";
import { useEditorStore } from "../store/useEditorStore";
import { loadModelAsset } from "../utils/modelAssetStore";

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

    return material;
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
        this.hydrateImportedModel(group, entity.assetId);
      } else {
        this.showImportedModelError(group);
      }

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

  private async hydrateImportedModel(group: THREE.Group, assetId: string): Promise<void> {
    try {
      const buffer = await loadModelAsset(assetId);
      if (!buffer) {
        console.error(`[Libre3D] Imported model asset "${assetId}" was not found in IndexedDB.`);
        this.showImportedModelError(group);
        return;
      }

      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const loader = new GLTFLoader();

      loader.parse(
        buffer,
        "",
        (gltf) => {
          // Bounding box MUST be computed before the scene is parented to `group` —
          // once parented, world and local space diverge and the box would reflect
          // wherever `group` happens to already be positioned in the scene.
          const boundingBox = new THREE.Box3().setFromObject(gltf.scene);

          group.add(gltf.scene);

          const outline = this.createSelectionOutline(boundingBox);
          group.add(outline);
          group.userData.selectionOutline = outline;
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
              if (texture) texture.dispose();
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

    if (obj instanceof THREE.Mesh) {
      const colorLayer = entity.materialLayers?.find((layer): layer is ColorLayer => layer.type === "color");
      const lightingLayer = entity.materialLayers?.find((layer): layer is LightingLayer => layer.type === "lighting");
      const model = lightingLayer?.model ?? "physical";
      const MaterialClass = materialClassForModel(model);

      if (obj.material.constructor !== MaterialClass) {
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
        this.scene.remove(existingObj);
        this.disposeSceneObject(existingObj);
        this.meshMap.delete(entity.id);
        existingObj = undefined;
      }

      if (!existingObj) {
        const obj = this.createSceneObject(entity);
        obj.userData.entityId = entity.id;
        obj.userData.entityType = entity.type;
        obj.userData.locked = entity.locked;
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
        this.scene.remove(obj);
        this.disposeSceneObject(obj);
        this.meshMap.delete(staleId);
      }
    }

    return staleIds;
  }

  public getObject(id: string): THREE.Object3D | undefined {
    return this.meshMap.get(id);
  }

  public getMeshes(): Map<string, THREE.Object3D> {
    return this.meshMap;
  }
}
