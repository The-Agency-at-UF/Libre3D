/**
 * PURPOSE: Fills in imported models (.glb). An imported model is a root entity that names the
 * asset, plus one entity per node of the file that the user can select; this ties each node's
 * parsed Three.js object to its entity.
 *
 * INPUT: The root's empty group (ObjectManager makes it), the asset's bytes from the SceneSource or
 * a parse the importer just did, and the entities.
 * OUTPUT: The parsed scene under the group, with every node that has an entity registered in the
 * object map under that entity's id.
 *
 * It also derives material layers for meshes that have none yet, shows a red box for a model that
 * can't be loaded, and brings back a node whose object was removed while its root stayed (delete,
 * then undo).
 *
 * Loading and parsing are asynchronous: a model's nodes appear some time after the sync that made
 * its root, so this asks the source for the entities again when they land.
 *
 * Not here: what a node shows once it exists (its transform, visibility, lock, and material are
 * ObjectManager's and EntityMaterials', reached through the host), and importing a file into the
 * scene in the first place (utils/importModel.ts).
 */

import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Entity } from "../scene/types";
import { getEntityIndex } from "../scene/entityIndex";
import { deriveMaterialLayers, createTextureDedupCache } from "../utils/materialLayers";
import { indexNodesByPath, nodePathKey } from "../utils/gltfHierarchy";
import { takeParsedModel } from "../utils/parsedModelCache";
import { createConfiguredGltfLoader } from "../utils/createGltfLoader";
import type { SceneRenderer } from "./rendererSettings";
import type { SceneSource } from "./sceneSource";
import { attachSelectionOutline, replaceSelectionOutline } from "./selectionOutline";

/** What imported models need from the reconciler that owns the scene's objects (ObjectManager). */
export interface ImportedModelHost {
  scene: THREE.Scene;
  /** The scene's objects by entity id. A model's nodes are added to it as they resolve. */
  meshMap: Map<string, THREE.Object3D>;
  source: SceneSource;
  /** The renderer the scene is drawn with, for decoding a model's KTX2 textures; null before there is one. */
  getRenderer(): SceneRenderer | null;
  /** Whether models get a selection outline, and a failed one its red box (the editor's; not the viewer's). */
  editorHelpers: boolean;
  /** Applies an entity to its object: transform, visibility, lock, material. */
  syncEntity(object: THREE.Object3D, entity: Entity): void;
  /** Moves every object under the parent its entity names. */
  applyParenting(entities: Entity[]): void;
  /** Frees an object's geometry, materials, and textures. */
  disposeObject(object: THREE.Object3D): void;
}

export class ImportedModels {
  private readonly host: ImportedModelHost;

  // Root entity ids currently mid-hydrateImportedModel. Guards the forced
  // re-hydrate below from tearing down a root whose async parse hasn't
  // resolved yet.
  private hydratingRootIds = new Set<string>();

  constructor(host: ImportedModelHost) {
    this.host = host;
  }

  // Recolors/rebuilds the group's outline as a red box so a failed import stays visible,
  // selectable, and obviously broken instead of silently vanishing from the scene. The box is the
  // editor's, like every outline: a published scene shows nothing for a model it can't load.
  public showImportedModelError(group: THREE.Group): void {
    if (this.host.editorHelpers) {
      const errorBox = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));
      replaceSelectionOutline(group, errorBox, { color: 0xff3b30 });
    }
    group.userData.loadError = true;
  }

  public async hydrateImportedModel(group: THREE.Group, assetId: string, rootEntityId: string): Promise<void> {
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

      const buffer = await this.host.source.loadModel(assetId);
      if (!buffer) {
        console.error(`[Libre3D] Imported model asset "${assetId}" was found neither in this browser nor in the cloud.`);
        this.showImportedModelError(group);
        this.hydratingRootIds.delete(rootEntityId);
        return;
      }

      const loader = await createConfiguredGltfLoader(this.host.getRenderer());

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

    // Map every glTF node to its nodePath so the flat node entities created
    // by prepareModelImport can be resolved back to the actual parsed
    // Object3D without re-parsing. walkGltfScene is the shared definition of
    // that path convention — extraction and hydration must use the same one.
    const nodeByPath = indexNodesByPath(gltf.scene);

    const nodeEntities = this.host.source.getEntities().filter((entity) => entity.rootEntityId === rootEntityId && entity.id !== rootEntityId);

    const resolvedObjects: Array<{ entityId: string; object: THREE.Object3D }> = [];
    for (const entity of nodeEntities) {
      if (!entity.nodePath) continue;
      const object = nodeByPath.get(nodePathKey(entity.nodePath));
      if (!object) continue;
      object.userData.entityId = entity.id;
      object.userData.entityType = "importedModel";
      this.host.meshMap.set(entity.id, object);
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
      const object = this.host.meshMap.get(entity.id);
      if (object) this.host.syncEntity(object, entity);
    }

    // gltf.scene's internal node nesting is already correct — no manual
    // reparenting needed once every node object is tagged and registered.
    group.add(gltf.scene);

    if (this.host.editorHelpers) attachSelectionOutline(group, boundingBox);

    // Now that the nodes exist, apply any store-level hierarchy that
    // diverges from the file structure, and attach any entities that were
    // waiting for one of these nodes as their parent.
    this.host.applyParenting(this.host.source.getEntities());

    // Fire-and-forget: derive editable material layers for any resolved mesh
    // that doesn't have them yet.
    // Writing them back re-triggers a sync, which reconciles the material — the
    // parsed glTF material and its textures stay untouched on that pass.
    void this.backfillMaterialLayers(resolvedObjects);
    this.hydratingRootIds.delete(rootEntityId);
  }

  // Derives editable Color/Lighting/Image layers from the parsed glTF material of
  // any resolved import mesh that has none yet, and writes them back to the store.
  // An import's nodes are created without materialLayers; this is where they get a real layer
  // stack, because it takes the parsed glTF, which exists only here.
  private async backfillMaterialLayers(
    resolved: Array<{ entityId: string; object: THREE.Object3D }>,
  ): Promise<void> {
    const { byId } = getEntityIndex(this.host.source.getEntities());
    const pending = resolved.filter(({ entityId, object }) => {
      if (!(object instanceof THREE.Mesh)) return false;
      return !byId.get(entityId)?.materialLayers;
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
        const layers = await deriveMaterialLayers(material, cache, this.host.source.saveTexture);
        // Written through the source at the time: this runs async, after the
        // hydrate's initial set(), and the editor's setEntityMaterialLayers
        // no-ops if the entity was removed meanwhile.
        this.host.source.setMaterialLayers(entityId, layers);
      } catch (error) {
        console.error(`[Libre3D] Failed to derive material layers for imported node "${entityId}":`, error);
      }
    }
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

  /**
   * Called at the start of every sync: starts bringing back any node that has an entity but no
   * object, while its model's root does have one.
   */
  public restoreMissingNodes(entities: Entity[]): void {
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
        !this.host.meshMap.has(entity.id) &&
        this.host.meshMap.has(entity.rootEntityId) &&
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
  }

  // Patches a resolved import's subtree in place to bring back node(s) whose
  // Object3D was disposed independently of the root (see restoreMissingNodes) — reparses
  // the import's buffer (there's no partial-parse API), but only splices the
  // missing node(s) back into the *existing* live scene graph rather than
  // rebuilding the whole import, so every untouched sibling keeps its original
  // Object3D. Falls back to forceFullRehydrate if a missing node's parent can't
  // be cleanly resolved, so correctness never depends on this optimization.
  private async reattachMissingImportNodes(rootEntityId: string, missingIds: string[]): Promise<void> {
    this.hydratingRootIds.add(rootEntityId);
    try {
      // The entities as they are now, before the model loads: the rest of this pass reads this
      // snapshot (and its index), as it did when it searched the array.
      const entities = this.host.source.getEntities();
      const { byId } = getEntityIndex(entities);
      const rootEntity = byId.get(rootEntityId);
      const rootObj = this.host.meshMap.get(rootEntityId);
      if (!rootEntity?.assetId || !rootObj) return;

      let gltf: GLTF | null | undefined = takeParsedModel(rootEntity.assetId);
      if (!gltf) {
        const buffer = await this.host.source.loadModel(rootEntity.assetId);
        if (!buffer) {
          console.error(`[Libre3D] Imported model asset "${rootEntity.assetId}" was found neither in this browser nor in the cloud.`);
          return;
        }
        const loader = await createConfiguredGltfLoader(this.host.getRenderer());
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

      const nodeByPath = indexNodesByPath(gltf.scene);

      // Shallow-to-deep order guarantees a missing parent is spliced in (and
      // registered in meshMap) before any of its missing children are processed,
      // so a whole missing subtree — not just a single leaf — resolves correctly.
      const pending = missingIds
        .map((id) => byId.get(id))
        .filter((entity): entity is Entity => !!entity?.nodePath)
        .sort((a, b) => a.nodePath!.length - b.nodePath!.length);

      // This import's entities by node path (the first one, where two share a path), to find each
      // missing node's parent without searching every entity per node.
      const entityIdByNodePath = new Map<string, string>();
      for (const candidate of entities) {
        if (candidate.rootEntityId !== rootEntityId) continue;
        const pathKey = nodePathKey(candidate.nodePath ?? []);
        if (!entityIdByNodePath.has(pathKey)) entityIdByNodePath.set(pathKey, candidate.id);
      }

      const resolvedObjects: Array<{ entityId: string; object: THREE.Object3D }> = [];

      for (const entity of pending) {
        const freshObject = nodeByPath.get(nodePathKey(entity.nodePath!));
        if (!freshObject) continue;

        // A node's structural parent is just its own nodePath minus the last
        // index (the same convention walkGltfScene/nodePathKey define); an
        // empty parent path means it's a direct child of gltf.scene, i.e. the
        // root itself.
        const parentPath = entity.nodePath!.slice(0, -1);
        const parentEntityId = parentPath.length === 0 ? rootEntityId : entityIdByNodePath.get(nodePathKey(parentPath));
        const parentObj = parentEntityId ? this.host.meshMap.get(parentEntityId) : undefined;
        if (!parentObj) continue;

        parentObj.add(freshObject);
        freshObject.userData.entityId = entity.id;
        freshObject.userData.entityType = "importedModel";
        freshObject.userData.parentEntityId = parentEntityId;
        this.host.meshMap.set(entity.id, freshObject);
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
        const entity = byId.get(entityId)!;
        this.host.syncEntity(object, entity);
        if (object instanceof THREE.Mesh) {
          const material = Array.isArray(object.material) ? object.material[0] : object.material;
          if (material) this.fadeInMesh(object, material.opacity);
        }
      }

      this.host.applyParenting(this.host.source.getEntities());
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
    const rootObj = this.host.meshMap.get(rootEntityId);
    if (!rootObj) return;
    (rootObj.parent ?? this.host.scene).remove(rootObj);
    this.host.disposeObject(rootObj);
    const entities = this.host.source.getEntities();
    for (const entity of entities) {
      if (entity.rootEntityId === rootEntityId) this.host.meshMap.delete(entity.id);
    }
    this.host.meshMap.delete(rootEntityId);
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
}
