/**
 * PURPOSE: Which settings each kind of material layer shows in the Materials panel's drawer
 * (MaterialsPanel.tsx, LayerDrawer): one component per layer type, each in its own file here.
 *
 * A new layer type needs an entry: the Record makes leaving one out a compile error, where a
 * chain of conditions would open an empty drawer.
 */

import type { ComponentType } from "react";
import type { MaterialLayerType } from "../../../store/useEditorStore";
import type { LayerRowData } from "../materialRows";
import { ColorSettings } from "./ColorSettings";
import { DepthSettings } from "./DepthSettings";
import { DisplaceSettings } from "./DisplaceSettings";
import { FresnelSettings } from "./FresnelSettings";
import { GlassSettings } from "./GlassSettings";
import { GradientSettings } from "./GradientSettings";
import { ImageSettings } from "./ImageSettings";
import { LightingSettings } from "./LightingSettings";
import { MatcapSettings } from "./MatcapSettings";
import { NoiseSettings } from "./NoiseSettings";
import { NormalSettings } from "./NormalSettings";
import { RainbowSettings } from "./RainbowSettings";

export const LAYER_DRAWERS: Record<MaterialLayerType, ComponentType<{ row: LayerRowData }>> = {
  color: ColorSettings,
  lighting: LightingSettings,
  image: ImageSettings,
  depth: DepthSettings,
  gradient: GradientSettings,
  noise: NoiseSettings,
  fresnel: FresnelSettings,
  normal: NormalSettings,
  matcap: MatcapSettings,
  rainbow: RainbowSettings,
  glass: GlassSettings,
  displace: DisplaceSettings,
};
