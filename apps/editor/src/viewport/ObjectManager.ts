import * as THREE from "three";
import { type Entity } from "../store/useEditorStore";
import { useEditorStore } from "../store/useEditorStore";

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

  private createMaterial(entity: Entity): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: entity.color,
      emissive: new THREE.Color(0x000000),
      roughness: 0.45,
      metalness: 0.08,
      wireframe: useEditorStore.getState().sceneSettings.wireframe,
    });
  }

  private createSceneObject(entity: Entity): THREE.Object3D {
    if (entity.type === "directionalLight") {
      const light = new THREE.DirectionalLight(new THREE.Color(entity.color), 2.2);
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
      const mesh = new THREE.Mesh(this.createGeometry(entity), this.createMaterial(entity));
      mesh.position.set(...entity.position);
      mesh.rotation.set(...entity.rotation);
      mesh.scale.set(...entity.scale);
      return mesh;
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
    } else if (obj instanceof THREE.DirectionalLight) {
      if (obj.userData.helper) {
        this.scene.remove(obj.userData.helper);
        obj.userData.helper.dispose();
      }
      if (obj.userData.target) {
        this.scene.remove(obj.userData.target);
      }
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
      if (obj.material instanceof THREE.MeshStandardMaterial) {
        obj.material.color.set(entity.color);
      }
    } else if (obj instanceof THREE.DirectionalLight) {
      obj.color.set(entity.color);
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
