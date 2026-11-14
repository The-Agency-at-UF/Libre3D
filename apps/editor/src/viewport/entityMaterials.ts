/**
 * PURPOSE: Builds and updates the Three.js material of an object from its entity's material layers
 * (scene/layerStack.ts) and its opacity.
 *
 * INPUT: An entity's `materialLayers`, and from the SceneSource: the wireframe setting and the
 * pictures that Image layers and Lighting maps name.
 * OUTPUT: A material for a new mesh (`createMaterialFromLayers`), and an existing mesh's material
 * brought up to date in place, or replaced when the lighting model needs another class
 * (`syncMaterial`).
 *
 * The Lighting layer picks the material's class and sets its shading (roughness, maps, sheen, …).
 * The colour layers are blended as scene/layerStack.ts says: a stack of Color layers under Lighting
 * is the material's own colour; anything that paints per pixel, a mask, a layer over Lighting or
 * Lighting under full opacity is drawn with TSL nodes that never sit on the material itself
 * (layerNodes.ts). Every material is a node material (three/webgpu) for that. An imported model
 * arrives with GLTFLoader's built-in materials; the first sync swaps each for a node copy with the
 * same values (nodeMaterials.ts), so its textures and glTF extras (transmission, …) stay.
 *
 * A pose (a state being viewed, or where Play has an object) can show an object in another colour
 * and opacity than its entity's (`showLook`): the colour goes on its top Color layer, over the
 * layers it is drawn with, as values only. The material and its shader stay, so a fade costs a few
 * numbers a frame, and an object on a material asset changes alone (each mesh has its own material
 * and its own values: objectValues.ts). An object a state can fade (`setFadingObjects`) is drawn
 * with the see-through objects for good, solid or not: switching `transparent` mid-fade would
 * rebuild its shader and pop. It still writes depth while it's solid.
 *
 * Pictures load in the background: a mesh is drawn without one until it arrives, then every mesh
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
import type { Entity, MaterialLayer, LightingLayer, LightingMapSlot, TextureRef } from "../scene/types";
import { getEntityIndex } from "../scene/entityIndex";
import type { Look } from "../animation/objectStates";
import { colorLayerOf, lightingLayerOf, surfaceOf, withTopColor, DEFAULT_METALNESS, DEFAULT_ROUGHNESS, type Surface } from "../scene/layers";
import { planStack, type StackPlan } from "../scene/layerStack";
import { buildTexture } from "../utils/materialLayers";
import { displacePictureRef } from "./displaceNodes";
import { syncLayerNodes } from "./layerNodes";
import type { PictureSource } from "./layerSources";
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

// The Lighting values only MeshPhysicalMaterial has, at the values that leave it looking like the
// cheaper standard one.
const PHYSICAL_DEFAULTS = { clearcoat: 0, sheen: 0, iridescence: 0, ior: 1.5, reflectivity: 1 } as const;

// Physical builds the standard material unless the layer asks for something only physical has.
const wantsPhysical = (lightingLayer: LightingLayer | undefined): boolean =>
  (lightingLayer?.model ?? "physical") === "physical" &&
  (Object.keys(PHYSICAL_DEFAULTS) as Array<keyof typeof PHYSICAL_DEFAULTS>).some(
    (key) => lightingLayer?.[key] !== undefined && lightingLayer[key] !== PHYSICAL_DEFAULTS[key],
  );

const materialClassForLayer = (lightingLayer: LightingLayer | undefined) => {
  if (wantsPhysical(lightingLayer)) return MeshPhysicalNodeMaterial;
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

/** The object whose own space Depth and Noise work in, when it isn't the mesh: a path's, for its end caps. */
const spaceOf = (mesh: THREE.Mesh | null): THREE.Object3D | null => (mesh instanceof PathMesh ? mesh : null);

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

// The material property each Lighting map fills, and whether its picture holds colours.
const MAP_PROPS: Record<LightingMapSlot, { prop: string; srgb: boolean }> = {
  roughness: { prop: "roughnessMap", srgb: false },
  metalness: { prop: "metalnessMap", srgb: false },
  normal: { prop: "normalMap", srgb: false },
  ao: { prop: "aoMap", srgb: false },
  emissive: { prop: "emissiveMap", srgb: true },
  bump: { prop: "bumpMap", srgb: false },
};

/** Every material property a picture can fill here. */
const TEXTURE_PROPS = ["map", ...Object.values(MAP_PROPS).map(({ prop }) => prop)];

/** A picture a material property (or an Image layer) should have. `nearest`: drawn with sharp pixels. */
interface TextureBinding {
  ref: TextureRef;
  srgb: boolean;
  nearest?: boolean;
}

// What a stored picture is turned into: the same bytes made two ways (a colour map and a normal
// map, say) are two textures.
const textureKey = (binding: TextureBinding): string =>
  `${binding.ref.textureAssetId}|${binding.ref.wrapS}|${binding.ref.wrapT}|${binding.ref.flipY ? 1 : 0}|${binding.srgb ? 1 : 0}|${binding.nearest ? 1 : 0}`;

/** The pictures the Lighting layer's maps put on a material, by property. (Image layers are drawn by their nodes: layerSources.ts.) */
const textureBindings = (layers: MaterialLayer[] | undefined): Map<string, TextureBinding> => {
  const bindings = new Map<string, TextureBinding>();
  for (const layer of layers ?? []) {
    if (layer.type === "lighting" && layer.maps) {
      for (const [slot, ref] of Object.entries(layer.maps) as Array<[LightingMapSlot, TextureRef | undefined]>) {
        if (ref) bindings.set(MAP_PROPS[slot].prop, { ref, srgb: MAP_PROPS[slot].srgb });
      }
    }
  }
  return bindings;
};

const NO_OBJECTS: ReadonlySet<string> = new Set();

// `entity` as it is drawn in `look`: its top Color layer in the look's colour, and the look's opacity.
const drawnIn = (entity: Entity, look: Look | undefined): Entity => {
  if (!look || !entity.materialLayers) return entity;
  const layers = look.color !== undefined ? withTopColor(entity.materialLayers, look.color) : entity.materialLayers;
  const opacity = look.opacity ?? entity.opacity ?? 1;
  return layers === entity.materialLayers && opacity === (entity.opacity ?? 1) ? entity : { ...entity, materialLayers: layers, opacity };
};

export class EntityMaterials {
  // The scene's objects by entity id (ObjectManager's map), to give a texture that has just loaded
  // to every mesh that uses it.
  private readonly meshMap: Map<string, THREE.Object3D>;
  // Where the wireframe setting, the entities, and the textures come from (sceneSource.ts).
  private readonly source: SceneSource;

  // Session cache of textures rebuilt from the texture store (downloaded first if this browser
  // doesn't have the picture), by textureKey. Loaded lazily (and once) the first time a material
  // property needs one, never re-decoded per sync. loadingTextures guards against a second load of a
  // key already in flight.
  private textureCache = new Map<string, THREE.Texture>();
  private loadingTextures = new Set<string>();

  // Set by applyTextures when a picture isn't there yet; syncMaterial reports it.
  private textureWasMissing = false;

  // The objects (by entity id) a state can fade: drawn as see-through objects for good.
  private fading: ReadonlySet<string> = NO_OBJECTS;
  // The colour and opacity each posed mesh is shown in, while they aren't its entity's (showLook).
  private looks = new WeakMap<THREE.Object3D, Look>();

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
  // `seeThrough`: the layer stack leaves parts see-through (a mask, a Fresnel at the bottom, …).
  // `glass`: a Glass layer paints what's behind the object, so it's drawn with the see-through
  // objects, after every solid one (still writing depth while it's solid). `fades`: a state can
  // change the object's opacity, so it's drawn with them too, whatever its opacity now.
  private computeAlphaBlendState(
    surface: Surface,
    opacity: number,
    seeThrough: boolean,
    glass = false,
    fades = false,
  ): { transparent: boolean; alphaTest: number; depthWrite: boolean } {
    const translucent = opacity < 1 || seeThrough;
    const blended = translucent || glass || fades;
    if (surface.alphaMode === "BLEND") return { transparent: true, alphaTest: 0, depthWrite: !translucent };
    if (surface.alphaMode === "MASK") return { transparent: blended, alphaTest: surface.alphaCutoff, depthWrite: true };
    return { transparent: blended, alphaTest: 0, depthWrite: true };
  }

  /**
   * Says which objects (entity ids) a state can fade (animation/objectStates.ts, `fadingObjects`).
   * It takes effect on each object's next sync; ObjectManager sees to that.
   */
  public setFadingObjects(ids: ReadonlySet<string>): void {
    this.fading = ids;
  }

  /** Whether a state can fade this object. */
  public fades(entityId: string): boolean {
    return this.fading.has(entityId);
  }

  // The material's colour and opacity: the stack's, when its layers under Lighting add up to one
  // colour; white and the object's opacity when they're drawn per pixel (layerNodes.ts).
  private static stackColor(material: LayeredMaterial, plan: StackPlan, objectOpacity: number): number {
    if (!plan.folded) {
      material.color.setRGB(1, 1, 1);
      return objectOpacity;
    }
    material.color.setRGB(plan.folded.rgb[0], plan.folded.rgb[1], plan.folded.rgb[2], THREE.SRGBColorSpace);
    return objectOpacity * plan.folded.alpha;
  }

  /**
   * A new material for `layers` on an object `objectOpacity` see-through (1 = solid). `fades`: a
   * state can change that opacity (see `setFadingObjects`).
   */
  public createMaterialFromLayers(layers: MaterialLayer[] | undefined, objectOpacity = 1, fades = false): LayeredMaterial {
    const lightingLayer = lightingLayerOf(layers);
    const model = lightingLayer?.model ?? "physical";
    const MaterialClass = materialClassForLayer(lightingLayer);
    const plan = planStack(layers);
    const surface = surfaceOf(layers);

    const material = new MaterialClass({
      side: surface.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      wireframe: this.source.isWireframe(),
    });
    const opacity = EntityMaterials.stackColor(material, plan, objectOpacity);
    const alphaState = this.computeAlphaBlendState(surface, opacity, !plan.opaque, plan.glass, fades);
    material.opacity = opacity;
    material.transparent = alphaState.transparent;
    material.alphaTest = alphaState.alphaTest;
    material.depthWrite = alphaState.depthWrite;
    syncLayerNodes(material, plan, null, this.pictures);

    this.applyLightingProperties(material, lightingLayer, model);
    this.applyTextures(material, layers);

    return material;
  }

  /**
   * Ties a new mesh's material to the mesh: a path's Depth and Noise layers work in the path's own
   * space, which its end caps (meshes of their own) share.
   */
  public bindMesh(mesh: THREE.Mesh, entity: Entity): void {
    const space = spaceOf(mesh);
    if (space && syncLayerNodes(mesh.material as THREE.Material, planStack(entity.materialLayers), space, this.pictures)) {
      (mesh.material as THREE.Material).needsUpdate = true;
    }
  }

  // A material property's picture: the texture when it's loaded, or null while it's loaded in the
  // background (then every mesh that wants it gets it: assignLoadedTexture).
  private getTexture(binding: TextureBinding): THREE.Texture | null {
    const key = textureKey(binding);
    const cached = this.textureCache.get(key);
    if (cached) return cached;

    if (!this.loadingTextures.has(key)) {
      this.loadingTextures.add(key);
      const id = binding.ref.textureAssetId;
      this.source
        .loadTexture(id)
        .then(async (blob) => {
          if (!blob) return;
          this.textureCache.set(key, await buildTexture(blob, { ...binding.ref, srgb: binding.srgb, nearest: binding.nearest }));
          this.assignLoadedTexture(key);
        })
        .catch((error) => console.error(`[Libre3D] Failed to load texture asset "${id}":`, error))
        .finally(() => this.loadingTextures.delete(key));
    }
    return null;
  }

  // An Image layer's picture (layerSources.ts): the texture, or null while it loads in the background.
  private readonly pictures: PictureSource = (ref, { nearest }) => {
    const texture = this.getTexture({ ref, srgb: true, nearest });
    if (!texture) this.textureWasMissing = true;
    return texture;
  };

  // After a picture finishes loading, every mesh whose layers want it gets it: Lighting's maps on
  // the material, an Image layer's in its nodes.
  private assignLoadedTexture(key: string): void {
    const { byId } = getEntityIndex(this.source.getEntities());
    for (const [entityId, obj] of this.meshMap) {
      if (!(obj instanceof THREE.Mesh)) continue;
      const entity = byId.get(entityId);
      // As the mesh is shown: in its pose's colour, if it has one.
      const layers = entity && drawnIn(entity, this.looks.get(obj)).materialLayers;
      if (!layers) continue;
      const material = obj.material as THREE.Material;
      if ([...textureBindings(layers).values()].some((binding) => textureKey(binding) === key)) this.applyTextures(material, layers);
      const usesPicture = layers.some(
        (layer) =>
          (layer.type === "image" && textureKey({ ref: layer, srgb: true, nearest: layer.sharpness === "pixelated" }) === key) ||
          (layer.type === "matcap" &&
            !!layer.textureAssetId &&
            textureKey({ ref: { textureAssetId: layer.textureAssetId, wrapS: 1001, wrapT: 1001, flipY: true }, srgb: true, nearest: false }) === key) ||
          (layer.type === "displace" &&
            !!layer.textureAssetId &&
            textureKey({ ref: displacePictureRef(layer), srgb: true, nearest: false }) === key),
      );
      if (usesPicture && syncLayerNodes(material, planStack(layers), spaceOf(obj), this.pictures)) material.needsUpdate = true;
    }
  }

  // Brings a material's pictures in line with its layers (textureBindings). Which picture each
  // property holds is kept in the material's userData (`textureKeys`). A picture an imported model's
  // material already holds is kept on the first sync (it's the one its layers name: they were
  // derived from it), so the parsed glTF textures stay; one the layers no longer name is taken off
  // only when it was put on here, so a picture the import couldn't keep isn't lost. Properties the
  // material's class doesn't have (Phong has no roughnessMap) are skipped.
  private applyTextures(material: THREE.Material, layers: MaterialLayer[] | undefined): void {
    const target = material as unknown as Record<string, unknown>;
    const keys: Record<string, string> = (material.userData.textureKeys ??= {});
    const bindings = textureBindings(layers);
    let changed = false;
    // An imported model's parsed colour map is its Image layer now, drawn by the stack's nodes:
    // three mustn't multiply it in as well.
    if (target.map && layers?.some((layer) => layer.type === "image")) {
      target.map = null;
      changed = true;
    }
    for (const prop of TEXTURE_PROPS) {
      if (!(prop in material)) continue;
      const binding = bindings.get(prop);
      if (!binding) {
        if (keys[prop] !== undefined) {
          delete keys[prop];
          if (target[prop]) {
            target[prop] = null;
            changed = true;
          }
        }
        continue;
      }
      const key = textureKey(binding);
      if (keys[prop] === key) {
        if (target[prop]) continue;
      } else if (keys[prop] === undefined && target[prop]) {
        keys[prop] = key;
        continue;
      }
      const texture = this.getTexture(binding);
      if (!texture) {
        this.textureWasMissing = true;
        continue;
      }
      if (target[prop] !== texture) {
        target[prop] = texture;
        changed = true;
      }
      keys[prop] = key;
    }
    if (changed) material.needsUpdate = true;
  }

  private applyLightingProperties(material: LayeredMaterial, lightingLayer: LightingLayer | undefined, model: LightingLayer["model"]): void {
    if (model === "physical" && flag(material, "isMeshStandardMaterial")) {
      const standard = material as MeshStandardNodeMaterial;
      standard.roughness = lightingLayer?.roughness ?? DEFAULT_ROUGHNESS;
      standard.metalness = lightingLayer?.metalness ?? DEFAULT_METALNESS;
    }
    // Each is left alone when the layer has no value, so an imported glTF clearcoat (or sheen, …)
    // survives layers made before it was one. Turning one back to its default keeps the physical
    // material: three compiles it without it, and swapping materials mid-drag would recompile anyway.
    if (model === "physical" && flag(material, "isMeshPhysicalMaterial") && lightingLayer) {
      const physical = material as MeshPhysicalNodeMaterial;
      if (lightingLayer.clearcoat !== undefined) {
        physical.clearcoat = lightingLayer.clearcoat;
        physical.clearcoatRoughness = lightingLayer.clearcoatRoughness ?? 0;
      }
      if (lightingLayer.sheen !== undefined) {
        physical.sheen = lightingLayer.sheen;
        physical.sheenColor.set(0xffffff);
      }
      if (lightingLayer.iridescence !== undefined) physical.iridescence = lightingLayer.iridescence;
      if (lightingLayer.ior !== undefined) physical.ior = lightingLayer.ior;
      if (lightingLayer.reflectivity !== undefined) physical.specularIntensity = lightingLayer.reflectivity;
    }
    if (model === "phong" && flag(material, "isMeshPhongMaterial")) {
      const phong = material as MeshPhongNodeMaterial;
      phong.shininess = lightingLayer?.shininess ?? 30;
      phong.specular.set(lightingLayer?.specular ?? "#111111");
    }
    if (model !== "none" && "emissive" in material) {
      (material as MeshStandardNodeMaterial).emissive.set(lightingLayer?.emissive ?? "#000000");
      (material as MeshStandardNodeMaterial).emissiveIntensity = lightingLayer?.emissiveIntensity ?? 1;
    }
    if ("bumpScale" in material) (material as MeshStandardNodeMaterial).bumpScale = lightingLayer?.bumpScale ?? 1;
  }

  /**
   * Brings a mesh's material up to date with its entity's layers: in place when the material is
   * already the class the lighting model needs, otherwise by replacing it.
   *
   * For a mesh whose entity has layers. An imported mesh still waiting for its layers to be derived
   * keeps its own material untouched: the caller skips it.
   *
   * @param keepLook Keep the colour and opacity a pose gave the mesh (`showLook`) over the entity's:
   *   for an object the gizmo is dragging, which stays in the state it's shown in. Otherwise the
   *   mesh is back in its entity's own.
   * @returns True when a picture isn't there yet (still loading, or it couldn't be had), so the
   *   caller knows to sync this mesh again.
   */
  public syncMaterial(obj: THREE.Mesh, entity: Entity, keepLook = false): boolean {
    if (!keepLook) this.looks.delete(obj);
    return this.applyMaterial(obj, drawnIn(entity, this.looks.get(obj)));
  }

  /**
   * Shows a mesh in a pose's colour and opacity instead of its entity's, by values alone: the
   * material and its shader stay. Nothing happens when it already shows them, so a pose applied
   * every frame costs nothing once it stops changing. `syncMaterial` puts the entity's own back.
   */
  public showLook(obj: THREE.Mesh, entity: Entity, look: Look): void {
    if (!entity.materialLayers) return;
    const shown = this.looks.get(obj);
    const color = look.color ?? shown?.color ?? colorLayerOf(entity.materialLayers)?.color;
    const opacity = look.opacity ?? shown?.opacity ?? entity.opacity ?? 1;
    const current = shown ?? { color: colorLayerOf(entity.materialLayers)?.color, opacity: entity.opacity ?? 1 };
    if (current.color === color && current.opacity === opacity) return;
    const next: Look = { opacity, ...(color !== undefined ? { color } : null) };
    this.looks.set(obj, next);
    this.applyMaterial(obj, drawnIn(entity, next));
  }

  /**
   * Shows a posed mesh in its entity's own colour and opacity for a moment (an export, a thumbnail)
   * and returns what puts the pose's back. Nothing to do, and nothing to undo, for a mesh `showLook`
   * hasn't changed.
   */
  public showBaseLook(obj: THREE.Mesh, entity: Entity): () => void {
    const shown = this.looks.get(obj);
    if (!shown) return () => {};
    this.applyMaterial(obj, entity);
    return () => {
      // Unless a sync put the mesh back in its entity's own meanwhile.
      if (this.looks.get(obj) === shown) this.applyMaterial(obj, drawnIn(entity, shown));
    };
  }

  // syncMaterial's work, for an entity as it is drawn (see drawnIn).
  private applyMaterial(obj: THREE.Mesh, entity: Entity): boolean {
    this.textureWasMissing = false;
    const fades = this.fading.has(entity.id);
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
    // rather than rebuilding it into a plain textureless standard material on first sync. Something
    // only physical has needs the physical one, so a standard material is rebuilt when one is set.
    const materialMatches =
      model === "physical"
        ? obj.material instanceof (wantsPhysical(lightingLayer) ? MeshPhysicalNodeMaterial : MeshStandardNodeMaterial)
        : obj.material.constructor === MaterialClass;

    if (!materialMatches) {
      const oldMaterial = obj.material as THREE.Material;
      obj.material = this.createMaterialFromLayers(entity.materialLayers, entity.opacity ?? 1, fades);
      if (obj instanceof PathMesh) obj.shareMaterialWithCaps();
      this.bindMesh(obj, entity);
      oldMaterial.dispose();
    } else {
      const material = obj.material as LayeredMaterial;
      const plan = planStack(entity.materialLayers);
      const surface = surfaceOf(entity.materialLayers);
      const opacity = EntityMaterials.stackColor(material, plan, entity.opacity ?? 1);
      const alphaState = this.computeAlphaBlendState(surface, opacity, !plan.opaque, plan.glass, fades);
      const newSide = surface.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
      // A change to the stack's shape (a type, a blend mode, an eye, the order) builds another shader.
      const stackReshaped = syncLayerNodes(material, plan, spaceOf(obj), this.pictures);
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
      this.applyTextures(material, entity.materialLayers);
    }
    return this.textureWasMissing;
  }
}
