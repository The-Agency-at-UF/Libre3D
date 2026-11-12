/**
 * PURPOSE: Keeps the Three.js scene's objects in step with the scene's entities. It is the
 * reconciler: it owns the map of objects by entity id and decides which to build, update, and
 * remove.
 *
 * INPUT: The entities on each sync (`syncMeshes`), a SceneSource for everything else about the
 * scene (the entities when an imported model lands, the wireframe setting, imported assets), and
 * the renderer the scene is drawn with. `editorHelpers: false` leaves out what only the editor
 * shows (selection outlines, light helpers): the share-link viewer's setting.
 * OUTPUT: One object per entity in the scene, under its parent's object, with its transform,
 * visibility, lock, and material; `getObject` and `getMeshes` for the code that picks, drags, and
 * poses them.
 *
 * Used by the editor's viewport and by the share-link viewer, so it never imports the store.
 *
 * Not here: what a mesh's material looks like (entityMaterials.ts), a primitive's geometry
 * (entityGeometry.ts), an imported model's contents (importedModels.ts), selection outlines
 * (selectionOutline.ts), paths and shapes (paths/PathMesh.ts, paths/ShapeMesh.ts). This file builds
 * the object for each entity type from those pieces and keeps it current.
 */

import * as THREE from "three";
import type { Entity } from "../scene/types";
import { getEntityIndex, isEffectivelyLocked } from "../scene/entityIndex";
import type { SceneRenderer } from "./rendererSettings";
import type { SceneSource } from "./sceneSource";
import { forgetBasePose, rememberBasePose } from "./basePoses";
import type { Pose } from "../animation/objectStates";
import { PathMesh } from "../paths/PathMesh";
import { DEFAULT_STROKE, type PathData } from "../paths/pathGeometry";
import { ShapeMesh } from "../paths/ShapeMesh";
import type { ShapeData, ShapeSolid } from "../paths/shapeGeometry";
import { createPrimitiveGeometry, displaceDetail } from "./entityGeometry";
import { EntityMaterials } from "./entityMaterials";
import { ImportedModels } from "./importedModels";
import { attachSelectionOutline, disposeSelectionOutline, replaceSelectionOutline } from "./selectionOutline";
import { OriginTarget } from "./lightTargets";

// Puts an object where an entity, or a pose, says: its position, rotation, and scale in its
// parent's space.
function applyTransform(object: THREE.Object3D, transform: Pick<Entity, "position" | "rotation" | "scale">): void {
  object.position.set(...transform.position);
  object.rotation.set(...transform.rotation);
  object.scale.set(...transform.scale);
}


// A path entity without its path or stroke (a damaged file) draws nothing rather than failing. One
// object each, so comparing them with the entity's tells PathMesh when to rebuild.
const NO_PATH: PathData = { points: [], closed: false };
const pathOf = (entity: Entity) => entity.path ?? NO_PATH;
const strokeOf = (entity: Entity) => entity.stroke ?? DEFAULT_STROKE;
// Likewise a shape without its outline draws nothing.
const NO_SHAPE: ShapeData = { regions: [] };
const shapeOf = (entity: Entity) => entity.shape ?? NO_SHAPE;
const solidOf = (entity: Entity): ShapeSolid => ({ extrusion: entity.extrusion ?? 0, bevel: entity.bevel ?? 0 });

export interface ObjectManagerOptions {
  /**
   * The renderer the scene is drawn with, asked for when an imported model is parsed (its KTX2
   * textures need one). A function, because the editor builds its renderer after its managers.
   */
  getRenderer: () => SceneRenderer | null;
  /**
   * Whether to build the editor's own objects: each object's selection outline, each light's
   * helper, the red box of a model that failed to load. True unless given; the share-link viewer
   * passes false, so a published scene holds nothing it would have to hide.
   */
  editorHelpers?: boolean;
}

export class ObjectManager {
  private scene: THREE.Scene;
  private meshMap: Map<string, THREE.Object3D>;

  // What lets syncMeshes skip an object: the entity it last applied to it. Store actions never
  // change an entity in place (they replace what they change), so the same entity object means
  // none of the object's own values changed. Kept by object, so one that is built again starts
  // without an entry, and in a WeakMap rather than userData, which the exporter writes into the file.
  private syncedEntities = new WeakMap<THREE.Object3D, Entity>();
  // Objects that must be synced again even if their entity is the same: something other than the
  // sync has moved them since (a pose, see applyPose), or the last sync left them unfinished (the
  // gizmo holds them, or a texture they need hasn't loaded).
  private unsettledObjects = new WeakSet<THREE.Object3D>();
  // The entities of the last sync by id, to tell when a lock or a parent changed anywhere.
  private lastSyncedById: Map<string, Entity> | null = null;

  // Where the entities, the wireframe setting and imported assets come from, and where what it
  // derives for imported models goes: the editor's store, or a published scene (sceneSource.ts).
  private readonly source: SceneSource;

  // Builds and updates the objects' materials from their entities' layers (entityMaterials.ts).
  private readonly materials: EntityMaterials;

  // Fills in imported models: loads and parses a model, ties its nodes to their entities, and
  // brings back a node that was deleted and restored (importedModels.ts).
  private readonly importedModels: ImportedModels;

  // Whether objects get the editor's outlines and helpers (ObjectManagerOptions.editorHelpers).
  private readonly editorHelpers: boolean;

  constructor(scene: THREE.Scene, meshMap: Map<string, THREE.Object3D>, source: SceneSource, { getRenderer, editorHelpers = true }: ObjectManagerOptions) {
    this.scene = scene;
    this.editorHelpers = editorHelpers;
    this.meshMap = meshMap;
    this.source = source;
    this.materials = new EntityMaterials(meshMap, source);
    this.importedModels = new ImportedModels({
      scene,
      meshMap,
      source,
      getRenderer,
      editorHelpers,
      syncEntity: (object, entity) => {
        this.syncEntityToSceneObject(object, entity, false);
      },
      applyParenting: (entities) => this.applyParenting(entities),
      disposeObject: (object) => this.disposeSceneObject(object),
    });
  }

  private createSceneObject(entity: Entity): THREE.Object3D {
    if (entity.type === "importedModel") {
      const group = new THREE.Group();
      applyTransform(group, entity);
      group.userData.assetId = entity.assetId;

      if (entity.assetId) {
        this.importedModels.hydrateImportedModel(group, entity.assetId, entity.id);
      } else {
        this.importedModels.showImportedModelError(group);
      }

      return group;
    } else if (entity.type === "group") {
      // Pure transform pivot (Blender Empty / Spline Group) — no geometry, no
      // outline. It's selectable from the hierarchy and via its children, and
      // the transform gizmo attaches to it like any other object.
      const group = new THREE.Group();
      applyTransform(group, entity);
      return group;
    } else if (entity.type === "directionalLight") {
      const light = new THREE.DirectionalLight(new THREE.Color(entity.color ?? "#ffffff"), 2.2);
      applyTransform(light, entity);

      // A directional light shines from where it is toward the world origin, as Spline's does: its
      // rotation can be edited but changes nothing. Its target is an OriginTarget, which stays at the
      // origin whatever the light's rotation, so a turn of the rotate gizmo doesn't change the
      // lighting either. The target is still the light's child at (0, 0, -1), the only wiring
      // GLTFExporter takes; an export aims each light at the origin first (aimLightsAtOrigin).
      light.target = new OriginTarget();
      light.add(light.target);
      light.target.position.set(0, 0, -1);
      light.userData.target = light.target;

      // Helper setup
      if (this.editorHelpers) {
        const helper = new THREE.DirectionalLightHelper(light, 1.0, 0xfde047);
        helper.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
        helper.userData.entityId = entity.id;
        this.scene.add(helper);
        light.userData.helper = helper;
      }

      return light;
    } else if (entity.type === "path") {
      // The tube and its caps (paths/PathMesh.ts). The outline is the whole path's box, also while
      // it's trimmed: it doesn't jump while the trim is dragged, and it shows where a hidden path is.
      const mesh = new PathMesh(pathOf(entity), strokeOf(entity), this.materials.createMaterialFromLayers(entity.materialLayers, entity.opacity ?? 1));
      applyTransform(mesh, entity);
      mesh.setTrim(entity.trimStart ?? 0, entity.trimEnd ?? 1);

      if (this.editorHelpers) attachSelectionOutline(mesh, mesh.geometry.boundingBox!);

      return mesh;
    } else if (entity.type === "shape") {
      // A filled outline (paths/ShapeMesh.ts), flat or extruded.
      const mesh = new ShapeMesh(shapeOf(entity), solidOf(entity), this.materials.createMaterialFromLayers(entity.materialLayers, entity.opacity ?? 1));
      applyTransform(mesh, entity);

      if (this.editorHelpers) attachSelectionOutline(mesh, mesh.geometry.boundingBox!);

      return mesh;
    } else {
      const geometry = createPrimitiveGeometry(entity);
      geometry.computeBoundingBox();
      const mesh = new THREE.Mesh(geometry, this.materials.createMaterialFromLayers(entity.materialLayers, entity.opacity ?? 1));
      mesh.userData.displaceDetail = displaceDetail(entity);
      // A displaced surface reaches past the shape it's built from, which is all three's culling knows.
      mesh.frustumCulled = mesh.userData.displaceDetail === null;
      applyTransform(mesh, entity);

      if (this.editorHelpers) attachSelectionOutline(mesh, geometry.boundingBox!);

      return mesh;
    }
  }

  // A path's tube is rebuilt when its path, radius or caps change (never for a trim). The selection
  // outline is sized from the geometry's bounds when it's made, so it's made again too.
  private rebuildPath(mesh: PathMesh, entity: Entity): void {
    mesh.rebuild(pathOf(entity), strokeOf(entity));
    if (this.editorHelpers) replaceSelectionOutline(mesh, mesh.geometry.boundingBox!, { keepVisibility: true });
  }

  // A shape's geometry is rebuilt when its outline, extrusion or bevel changes, and its outline with it.
  private rebuildShape(mesh: ShapeMesh, entity: Entity): void {
    mesh.rebuild(shapeOf(entity), solidOf(entity));
    if (this.editorHelpers) replaceSelectionOutline(mesh, mesh.geometry.boundingBox!, { keepVisibility: true });
  }

  public disposeSceneObject(obj: THREE.Object3D): void {
    if (obj instanceof THREE.Mesh) {
      if (obj instanceof PathMesh) obj.disposeGeometry();
      else obj.geometry.dispose();
      const material = obj.material;
      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose());
      } else {
        material.dispose();
      }
      disposeSelectionOutline(obj);
    } else if (obj instanceof THREE.DirectionalLight) {
      if (obj.userData.helper) {
        this.scene.remove(obj.userData.helper);
        obj.userData.helper.dispose();
      }
      // The target is a child of the light now, so it goes with it — nothing to
      // detach from the scene.
    } else if (obj instanceof THREE.Group) {
      disposeSelectionOutline(obj);

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

  // `entities` resolves inherited locks (a locked ancestor locks this object
  // too); callers outside syncMeshes read it fresh from the source. Returns whether a texture the
  // object needs isn't there yet (see EntityMaterials.syncMaterial).
  private syncEntityToSceneObject(
    obj: THREE.Object3D,
    entity: Entity,
    isBeingDragged: boolean,
    entities: Entity[] = this.source.getEntities(),
  ): boolean {
    if (obj instanceof PathMesh && (obj.path !== pathOf(entity) || obj.stroke !== strokeOf(entity))) {
      this.rebuildPath(obj, entity);
    }
    if (obj instanceof ShapeMesh && !obj.isBuiltFrom(shapeOf(entity), solidOf(entity))) {
      this.rebuildShape(obj, entity);
    }
    // A primitive is built finer while it has a Displace layer (entityGeometry.ts). Its bounds
    // don't change, so its selection outline stays.
    if (obj instanceof THREE.Mesh && "displaceDetail" in obj.userData && obj.userData.displaceDetail !== displaceDetail(entity)) {
      obj.geometry.dispose();
      obj.geometry = createPrimitiveGeometry(entity);
      obj.geometry.computeBoundingBox();
      obj.userData.displaceDetail = displaceDetail(entity);
      obj.frustumCulled = obj.userData.displaceDetail === null;
    }

    if (!isBeingDragged) {
      applyTransform(obj, entity);
      if (obj instanceof PathMesh) obj.setTrim(entity.trimStart ?? 0, entity.trimEnd ?? 1);
      forgetBasePose(obj);
    }
    obj.visible = entity.visible;
    obj.userData.locked = isEffectivelyLocked(entities, entity.id);

    // Imported meshes are THREE.Mesh instances too, and now carry derived
    // materialLayers (see ImportedModels.backfillMaterialLayers) — so this drives their material
    // the same as a primitive. Meshes still awaiting their backfill (materialLayers
    // undefined) skip this and keep their parsed glTF material untouched.
    let textureMissing = false;
    if (obj instanceof THREE.Mesh && entity.materialLayers) {
      textureMissing = this.materials.syncMaterial(obj, entity);
    } else if (obj instanceof THREE.DirectionalLight) {
      obj.color.set(entity.color ?? "#ffffff");
      if (obj.userData.helper) {
        obj.userData.helper.visible = entity.visible;
        obj.userData.helper.update();
      }
    }
    return textureMissing;
  }

  /**
   * Makes the scene's objects match `entities`: builds the missing ones, removes the ones whose
   * entity is gone, and applies each entity to its object.
   *
   * An object is skipped when its entity is the same one applied to it last time and nothing else
   * has touched it since, so an edit to one object doesn't re-apply every other one. What an object
   * shows that doesn't come from its own entity is handled apart from that:
   * - a pose (applyPose), the gizmo's object, and an object waiting for a texture are synced again
   *   whatever their entity (`unsettledObjects`);
   * - an inherited lock is worked out again for every object when a lock or a parent changed
   *   anywhere, or an entity came or went;
   * - a light is aimed at the origin from where its parents put it, so lights are never skipped;
   * - wireframe is a scene setting, applied to every object by ViewportCanvas when it changes.
   *
   * @param transformTarget The object the transform gizmo is attached to, if any.
   * @param isDragging True while the gizmo is being dragged: its object keeps the transform the
   *   drag gave it.
   * @returns The ids of the entities whose objects were removed.
   */
  public syncMeshes(entities: Entity[], transformTarget: THREE.Object3D | null, isDragging: boolean): Set<string> {
    const { byId } = getEntityIndex(entities);
    let locksMayHaveChanged = this.lastSyncedById !== null && this.lastSyncedById.size !== byId.size;

    this.importedModels.restoreMissingNodes(entities);

    for (const entity of entities) {
      const before = this.lastSyncedById?.get(entity.id);
      if (before !== entity && (!before || !!before.locked !== !!entity.locked || (before.parentId ?? null) !== (entity.parentId ?? null))) {
        locksMayHaveChanged = true;
      }

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
        // just wait until ImportedModels.hydrateImportedModel puts them in meshMap.
        const isPendingImportNode = entity.type === "importedModel" && !entity.assetId;
        if (isPendingImportNode) continue;

        const obj = this.createSceneObject(entity);
        if (obj instanceof THREE.Mesh && entity.materialLayers) this.materials.bindMesh(obj, entity);
        obj.userData.entityId = entity.id;
        obj.userData.entityType = entity.type;
        obj.userData.locked = isEffectivelyLocked(entities, entity.id);
        // Created flat on the scene; the applyParenting pass below moves it
        // under its store parent once every sibling object exists (parents can
        // appear later in the entities array than their children).
        obj.userData.parentEntityId = null;
        obj.visible = entity.visible;
        this.scene.add(obj);
        this.meshMap.set(entity.id, obj);
        continue;
      }

      // The gizmo's object is never skipped, dragging or not: a drag moves the object itself, and the
      // sync after the drag is what puts it where its entity says.
      const isTransformTarget = transformTarget === existingObj;
      if (
        this.syncedEntities.get(existingObj) === entity &&
        !isTransformTarget &&
        !this.unsettledObjects.has(existingObj) &&
        !(existingObj instanceof THREE.DirectionalLight)
      ) {
        continue;
      }

      const skipSync = !!isBeingDragged;
      const textureMissing = this.syncEntityToSceneObject(existingObj, entity, skipSync, entities);
      this.syncedEntities.set(existingObj, entity);
      if (isTransformTarget || textureMissing) this.unsettledObjects.add(existingObj);
      else this.unsettledObjects.delete(existingObj);
    }

    // Identify stale objects
    const staleIds = new Set<string>();
    for (const entityId of this.meshMap.keys()) {
      if (!byId.has(entityId)) {
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

    // A lock is inherited from an ancestor's entity, so it can change for an object that was
    // skipped above.
    if (locksMayHaveChanged) {
      for (const [entityId, obj] of this.meshMap) {
        obj.userData.locked = isEffectivelyLocked(entities, entityId);
      }
    }
    this.lastSyncedById = byId;

    return staleIds;
  }

  // Makes the THREE graph agree with store-level parentId. Each object tracks
  // the parent entity it is currently attached under (userData.parentEntityId);
  // only a diff triggers a reattach, so glTF-internal nesting (gltf.scene
  // wrappers, file-order parents) is left untouched for entities the user never
  // reparented. Local TRS is re-applied from the store after a reattach — the
  // store already solved it against the new parent, so no .attach() world-math
  // is needed here. A missing parent object (async glTF hydration still in
  // flight) is skipped; ImportedModels runs this pass again when the model lands.
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
      applyTransform(obj, entity);
    }
  }

  // Shows an object in a pose other than its own values (the state being viewed, or where Play has
  // moved it) without touching the store, so clicks, the outline, and the gizmo follow it. A path's
  // pose includes its trim. syncMeshes puts every object back in Base, so the caller applies the
  // pose again after each sync (except in Play, which shows Base). Exports and thumbnails still see
  // Base (showBasePoses).
  public applyPose(entityId: string, pose: Pose): void {
    const obj = this.meshMap.get(entityId);
    if (!obj) return;

    // No longer where its entity says: the next sync puts it back, though its entity is the same.
    this.unsettledObjects.add(obj);
    rememberBasePose(obj);
    applyTransform(obj, pose);
    if (obj instanceof PathMesh && (pose.trimStart !== undefined || pose.trimEnd !== undefined)) {
      obj.setTrim(pose.trimStart ?? 0, pose.trimEnd ?? 1);
    }
  }

  public getObject(id: string): THREE.Object3D | undefined {
    return this.meshMap.get(id);
  }

  public getMeshes(): Map<string, THREE.Object3D> {
    return this.meshMap;
  }
}
