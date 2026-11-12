/**
 * PURPOSE: Builds and updates the Three.js material of an object from its entity's material layers
 * (Color, Lighting, Image, Depth) and its opacity.
 *
 * INPUT: An entity's `materialLayers`, and from the SceneSource: the wireframe setting and the
 * textures that Image layers name.
 * OUTPUT: A material for a new mesh (`createMaterialFromLayers`), and an existing mesh's material
 * brought up to date in place, or replaced when the lighting model needs another class
 * (`syncMaterial`).
 *
 * The colour layers are blended as scene/layerStack.ts says. A stack that adds up to one colour sets
 * the material's colour; one with a Depth layer, or a Lighting layer under full opacity, is drawn
 * with TSL nodes that never sit on the material itself (layerNodes.ts). Every material is a node
 * material (three/webgpu) for that. An imported
 * model arrives with GLTFLoader's built-in materials; the first sync swaps each for a node copy with
 * the same values (nodeMaterials.ts), so its textures and glTF extras (transmission, sheen, …) stay.
 *
 * Textures load in the background: a mesh is drawn without one until it arrives, then every mesh
 * that uses it gets it. Loaded textures are kept for the session and shared between meshes.
 *
 * Not here: geometry (entityGeometry.ts), which objects exist and where they are (ObjectManager),
 * and deriving layers from an imported model's own material (utils/materialLayers.ts).
 */

import * as THREE from "three";
import {
  MeshBasicNodeMaterial,
  MeshLambertNodeMaterial,
  MeshPhongNodeMaterial,
  MeshPhysicalNodeMaterial,
  MeshStandardNodeMaterial,
  MeshToonNodeMaterial,
} from "three/webgpu";
import type { Entity, MaterialLayer, LightingLayer, ImageLayer, ImageSlot } from "../scene/types";
import { getEntityIndex } from "../scene/entityIndex";
import { lightingLayerOf, surfaceOf, DEFAULT_METALNESS, DEFAULT_ROUGHNESS, type Surface } from "../scene/layers";
import { lightingStrength, planStack, type StackPlan } from "../scene/layerStack";
import { buildTextureFromLayer } from "../utils/materialLayers";
import { depthPaintKey, depthPaintOf, syncDepthColors } from "../utils/depthColors";
import { syncLayerNodes } from "./layerNodes";
import { PathMesh } from "../paths/PathMesh";
import { toNodeMaterial } from "./nodeMaterials";
import type { SceneSource } from "./sceneSource";

export type LayeredMaterial =
  | MeshBasicNodeMaterial
  | MeshLambertNodeMaterial
  | MeshPhongNodeMaterial
  | MeshStandardNodeMaterial
  | MeshPhysicalNodeMaterial
  | MeshToonNodeMaterial;

// The built-in material flags, which node materials carry too (nodeMaterials.ts): `instanceof` can't
// tell a node material from the built-in one it stands for.
const flag = (material: THREE.Material, name: string): boolean => (material as unknown as Record<string, unknown>)[name] === true;

// Physical builds the cheaper standard material unless the layer asks for a clearcoat.
const wantsClearcoat = (lightingLayer: LightingLayer | undefined): boolean =>
  (lightingLayer?.model ?? "physical") === "physical" && (lightingLayer?.clearcoat ?? 0) > 0;

const materialClassForLayer = (lightingLayer: LightingLayer | undefined) => {
  if (wantsClearcoat(lightingLayer)) return MeshPhysicalNodeMaterial;
  switch (lightingLayer?.model ?? "physical") {
    case "lambert":
      return MeshLambertNodeMaterial;
    case "phong":
      return MeshPhongNodeMaterial;
    case "toon":
      return MeshToonNodeMaterial;
    case "physical":
      return MeshStandardNodeMaterial;
    case "none":
    default:
      return MeshBasicNodeMaterial;
  }
};

/**
 * Draws a material as a wireframe or solid. The renderer draws lines with another pipeline and
 * another index buffer than triangles, and only makes them when it's told the material changed
 * (an object that hasn't changed otherwise would be drawn with buffers that aren't there).
 */
export const setWireframe = (material: THREE.Material & { wireframe: boolean }, wireframe: boolean): void => {
  if (material.wireframe === wireframe) return;
  material.wireframe = wireframe;
  material.needsUpdate = true;
};

export class EntityMaterials {
  // The scene's objects by entity id (ObjectManager's map), to give a texture that has just loaded
  // to every mesh that uses it.
  private readonly meshMap: Map<string, THREE.Object3D>;
  // Where the wireframe setting, the entities, and the textures come from (sceneSource.ts).
  private readonly source: SceneSource;

  // Session cache of textures rebuilt from the texture store (downloaded first
  // if this browser doesn't have the image), keyed by ImageLayer.textureAssetId. Loaded lazily (and once) the first time an empty
  // material slot actually needs one — a rebuild after a lighting-model change,
  // or an Image layer re-enabled — never re-decoded per sync. loadingTextures
  // guards against firing a second load for an id already in flight.
  private textureCache = new Map<string, THREE.Texture>();
  private loadingTextures = new Set<string>();

  // Set by applyImageLayers when an Image layer's texture isn't there yet; syncMaterial reports it.
  private textureWasMissing = false;

  constructor(meshMap: Map<string, THREE.Object3D>, source: SceneSource) {
    this.meshMap = meshMap;
    this.source = source;
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
    surface: Surface,
    opacity: number,
  ): { transparent: boolean; alphaTest: number; depthWrite: boolean } {
    if (surface.alphaMode === "BLEND") return { transparent: true, alphaTest: 0, depthWrite: opacity >= 1 };
    if (surface.alphaMode === "MASK") return { transparent: opacity < 1, alphaTest: surface.alphaCutoff, depthWrite: true };
    return { transparent: opacity < 1, alphaTest: 0, depthWrite: true };
  }

  // The material's colour: the stack's, when it adds up to one colour; white under a Depth stack,
  // whose colour comes from its nodes (layerNodes.ts).
  private static setStackColor(material: LayeredMaterial, plan: StackPlan): void {
    if (plan.depth) material.color.setRGB(1, 1, 1);
    else material.color.setRGB(plan.under.rgb[0], plan.under.rgb[1], plan.under.rgb[2], THREE.SRGBColorSpace);
  }

  /** A new material for `layers` on an object `objectOpacity` see-through (1 = solid). */
  public createMaterialFromLayers(layers: MaterialLayer[] | undefined, objectOpacity = 1): LayeredMaterial {
    const lightingLayer = lightingLayerOf(layers);
    const model = lightingLayer?.model ?? "physical";
    const MaterialClass = materialClassForLayer(lightingLayer);
    const plan = planStack(layers);
    const surface = surfaceOf(layers);
    const opacity = objectOpacity * plan.alpha;
    const alphaState = this.computeAlphaBlendState(surface, opacity);

    const material = new MaterialClass({
      opacity,
      transparent: alphaState.transparent,
      alphaTest: alphaState.alphaTest,
      depthWrite: alphaState.depthWrite,
      side: surface.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      wireframe: this.source.isWireframe(),
    });
    EntityMaterials.setStackColor(material, plan);
    syncLayerNodes(material, plan, lightingStrength(lightingLayer));

    this.applyLightingProperties(material, lightingLayer, model);
    this.applyImageLayers(material, layers);

    return material;
  }

  // A Depth layer (utils/depthColors.ts) is the mesh's vertex colours: its ramp, which the stack's
  // nodes blend with the layers around it. Whether the material used vertex colours before (an
  // imported model's own) comes back when the layer goes.
  public applyDepthLayer(mesh: THREE.Mesh, entity: Entity): void {
    const paint = depthPaintOf(entity.materialLayers);
    const key = depthPaintKey(paint);
    if (mesh instanceof PathMesh) {
      mesh.setDepthPaint(paint, key);
    } else {
      // An imported mesh's geometry can be shared with other copies of the model: paint its own.
      if (paint && entity.type === "importedModel" && !mesh.geometry.userData.depthOwned) {
        mesh.geometry = mesh.geometry.clone();
        mesh.geometry.userData.depthOwned = true;
      }
      syncDepthColors(mesh.geometry, paint, key);
    }

    const material = mesh.material as LayeredMaterial;
    if (paint) material.userData.vertexColorsBeforeDepth ??= material.vertexColors;
    const vertexColors: boolean = paint ? true : (material.userData.vertexColorsBeforeDepth ?? material.vertexColors);
    if (!paint) delete material.userData.vertexColorsBeforeDepth;
    if (material.vertexColors !== vertexColors) {
      material.vertexColors = vertexColors;
      material.needsUpdate = true;
    }
  }

  // The material property (or properties) each ImageLayer slot feeds. The glTF
  // metallic-roughness map is one packed texture Three assigns to both
  // roughnessMap and metalnessMap, so that slot returns two properties.
  private static readonly SLOT_PROPS: Record<ImageSlot, Array<keyof MeshStandardNodeMaterial>> = {
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
    return EntityMaterials.SLOT_PROPS[slot].some((prop) => prop in material && !mat[prop as string]);
  }

  // Assigns the texture to every empty property of the slot the material has,
  // never overwriting a map that's already present. Returns whether anything changed.
  private assignTextureToSlot(material: THREE.Material, slot: ImageSlot, texture: THREE.Texture): boolean {
    const mat = material as unknown as Record<string, unknown>;
    let changed = false;
    for (const prop of EntityMaterials.SLOT_PROPS[slot]) {
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
    for (const prop of EntityMaterials.SLOT_PROPS[slot]) {
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
      this.source.loadTexture(id)
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
    const { byId } = getEntityIndex(this.source.getEntities());
    for (const [entityId, obj] of this.meshMap) {
      if (!(obj instanceof THREE.Mesh)) continue;
      const layers = byId.get(entityId)?.materialLayers;
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
        // Still loading, or it couldn't be had: the object is tried again on the next sync.
        if (!texture) this.textureWasMissing = true;
        if (texture && this.assignTextureToSlot(material, layer.slot, texture)) changed = true;
      } else if (this.clearTextureSlot(material, layer.slot)) {
        changed = true;
      }
    }
    if (changed) material.needsUpdate = true;
  }

  private applyLightingProperties(
    material: LayeredMaterial,
    lightingLayer: LightingLayer | undefined,
    model: LightingLayer["model"]
  ): void {
    if (model === "physical" && flag(material, "isMeshStandardMaterial")) {
      const standard = material as MeshStandardNodeMaterial;
      standard.roughness = lightingLayer?.roughness ?? DEFAULT_ROUGHNESS;
      standard.metalness = lightingLayer?.metalness ?? DEFAULT_METALNESS;
    }
    // Left alone when the layer has no value, so an imported glTF clearcoat survives layers made
    // before clearcoat was one. Turning it back to 0 keeps the physical material: three compiles it
    // without the coat, and swapping materials mid-drag would recompile anyway.
    if (model === "physical" && flag(material, "isMeshPhysicalMaterial") && lightingLayer?.clearcoat !== undefined) {
      const physical = material as MeshPhysicalNodeMaterial;
      physical.clearcoat = lightingLayer.clearcoat;
      physical.clearcoatRoughness = lightingLayer.clearcoatRoughness ?? 0;
    }
    if (model === "phong" && flag(material, "isMeshPhongMaterial")) {
      (material as MeshPhongNodeMaterial).shininess = lightingLayer?.shininess ?? 30;
    }
    if (model !== "none" && "emissive" in material) {
      (material as MeshStandardNodeMaterial).emissive.set(lightingLayer?.emissive ?? "#000000");
      (material as MeshStandardNodeMaterial).emissiveIntensity = lightingLayer?.emissiveIntensity ?? 1;
    }
  }

  /**
   * Brings a mesh's material up to date with its entity's layers: in place when the material is
   * already the class the lighting model needs, otherwise by replacing it.
   *
   * For a mesh whose entity has layers. An imported mesh still waiting for its layers to be derived
   * keeps its own material untouched: the caller skips it.
   *
   * @returns True when an Image layer's texture isn't there yet (still loading, or it couldn't be
   *   had), so the caller knows to sync this mesh again.
   */
  public syncMaterial(obj: THREE.Mesh, entity: Entity): boolean {
    this.textureWasMissing = false;
    const lightingLayer = lightingLayerOf(entity.materialLayers);
    const model = lightingLayer?.model ?? "physical";
    const MaterialClass = materialClassForLayer(lightingLayer);

    // An imported mesh still has GLTFLoader's built-in material: swap it for a node copy with the
    // same values, once. (glTF meshes can share a material; each gets its own copy, so a layer
    // edit on one can't show on another.)
    const builtIn = obj.material as THREE.Material;
    if (!Array.isArray(obj.material) && !flag(builtIn, "isNodeMaterial")) {
      const nodeMaterial = toNodeMaterial(builtIn);
      if (nodeMaterial) {
        obj.material = nodeMaterial;
        if (obj instanceof PathMesh) obj.shareMaterialWithCaps();
        // Frees what the renderer made for it. Its textures are the copy's now, so they stay.
        builtIn.dispose();
      }
    }

    // A parsed glTF PBR material is often physical (a subclass of standard). Treat that as already
    // matching "physical" so we take the in-place branch and keep its textures/advanced features,
    // rather than rebuilding it into a plain textureless standard material on first sync. A
    // clearcoat needs the physical one, so a standard material is rebuilt when one is added.
    const materialMatches =
      model === "physical"
        ? obj.material instanceof (wantsClearcoat(lightingLayer) ? MeshPhysicalNodeMaterial : MeshStandardNodeMaterial)
        : obj.material.constructor === MaterialClass;

    if (!materialMatches) {
      const oldMaterial = obj.material as THREE.Material;
      obj.material = this.createMaterialFromLayers(entity.materialLayers, entity.opacity ?? 1);
      if (obj instanceof PathMesh) obj.shareMaterialWithCaps();
      oldMaterial.dispose();
    } else {
      const material = obj.material as LayeredMaterial;
      const plan = planStack(entity.materialLayers);
      const surface = surfaceOf(entity.materialLayers);
      EntityMaterials.setStackColor(material, plan);
      const opacity = (entity.opacity ?? 1) * plan.alpha;
      const alphaState = this.computeAlphaBlendState(surface, opacity);
      const newSide = surface.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
      // A change to the stack's shape (a blend mode, an eye, the order) builds another shader.
      const stackReshaped = syncLayerNodes(material, plan, lightingStrength(lightingLayer));
      // Only transparent/alphaTest/side changes force a shader recompile; color,
      // opacity, roughness, etc. do not. This runs for the gizmo's object on every
      // frame of a drag (and ran for every entity on every store change before
      // syncMeshes skipped the unchanged ones), so unconditionally setting
      // needsUpdate recompiled every imported child mesh's shader each frame, which
      // is what made dragging a hydrated model jitter. Set it only when a
      // program-affecting value actually changed.
      const needsRecompile =
        material.transparent !== alphaState.transparent ||
        material.alphaTest !== alphaState.alphaTest ||
        material.side !== newSide ||
        stackReshaped;
      material.opacity = opacity;
      material.transparent = alphaState.transparent;
      material.alphaTest = alphaState.alphaTest;
      material.depthWrite = alphaState.depthWrite;
      material.side = newSide;
      setWireframe(material, this.source.isWireframe());
      if (needsRecompile) material.needsUpdate = true;
      this.applyLightingProperties(material, lightingLayer, model);
      this.applyImageLayers(material, entity.materialLayers);
    }
    this.applyDepthLayer(obj, entity);
    return this.textureWasMissing;
  }
}
