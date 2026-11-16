/**
 * PURPOSE: The inspector's Effects section: the scene's effects (viewport/postProcessing.ts) and
 * its exposure.
 *
 * OUTPUT: Edits `postProcessing` through `updatePostProcessing`, one undo step per change (a
 *         slider's drag or a visit to a number field is one step).
 *
 * The switch in the header turns every effect and the exposure off without changing their values.
 * Under Exposure, one row per effect the chain draws: its name, a button that opens its values in
 * the drawer beside the sidebar (SideDrawer.tsx), its amount in percent, and its eye. Noise has an
 * amount and nothing else.
 */

import { useEffect, useRef, useState } from "react";
import { useSliderUndoStep } from "../../hooks/useSliderUndoStep";
import type { PostProcessingConfig } from "../../scene/types";
import { useEditorStore } from "../../store/useEditorStore";
import type { EffectName } from "../../viewport/postProcessing";
import { NumberField } from "../ui/NumberField";
import { PanelSection } from "../ui/PanelSection";
import { Slider } from "../ui/Slider";
import { SideDrawer } from "./SideDrawer";

interface EffectValue {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  /** The slider's track is a rainbow, not a fill. */
  rainbow?: boolean;
}

interface EffectRowSpec {
  label: string;
  icon: string;
  values: EffectValue[];
}

// An effect's row, its values checked against the config's own fields.
const effect = <N extends EffectName>(
  label: string,
  icon: string,
  values: (EffectValue & { key: Exclude<keyof PostProcessingConfig[N], "enabled" | "amount"> })[],
): EffectRowSpec => ({ label, icon, values });

// One row per effect the chain draws, in the order they're applied. An effect added to the chain
// needs a row here: the Record makes leaving one out a compile error.
const EFFECT_ROWS: Record<EffectName, EffectRowSpec> = {
  bloom: effect<"bloom">("Bloom", "ti-sparkles", [
    { key: "intensity", label: "Intensity", min: 0, max: 3, step: 0.05 },
    { key: "blurScale", label: "Blur Scale", min: 0, max: 1, step: 0.01 },
    { key: "threshold", label: "Threshold", min: 0, max: 1, step: 0.01 },
    { key: "smoothing", label: "Smoothing", min: 0, max: 1, step: 0.01 },
  ]),
  hue: effect<"hue">("Hue", "ti-color-filter", [
    // Radians: a full turn of the colour wheel.
    { key: "hue", label: "Hue", min: 0, max: 6.28, step: 0.01, rainbow: true },
    { key: "saturation", label: "Saturation", min: -1, max: 1, step: 0.01 },
  ]),
  brightness: effect<"brightness">("Brightness", "ti-brightness-half", [
    { key: "brightness", label: "Brightness", min: -1, max: 1, step: 0.01 },
    { key: "contrast", label: "Contrast", min: -1, max: 1, step: 0.01 },
  ]),
  vignette: effect<"vignette">("Vignette", "ti-circle-dashed", [
    { key: "darkness", label: "Darkness", min: 0, max: 2, step: 0.01 },
    { key: "offset", label: "Offset", min: 0, max: 1, step: 0.01 },
  ]),
  noise: effect<"noise">("Noise", "ti-grain", []),
};
const EFFECT_NAMES = Object.keys(EFFECT_ROWS) as EffectName[];

// One of an effect's values in its drawer: a slider and the number beside it.
function ValueRow({ spec, value, onChange }: { spec: EffectValue; value: number; onChange: (value: number) => void }) {
  const undoStep = useSliderUndoStep();
  const shown = Math.min(spec.max, Math.max(spec.min, value));
  const percent = ((shown - spec.min) / (spec.max - spec.min)) * 100;
  return (
    <div className="prop">
      <span className="prop-label">{spec.label}</span>
      <div className="slider-row">
        <input
          type="range"
          className={spec.rainbow ? "effects-rainbow" : undefined}
          aria-label={spec.label}
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={shown}
          style={{ "--value-percent": `${percent}%` } as React.CSSProperties}
          onChange={(event) => {
            onChange(parseFloat(event.target.value));
            undoStep.changed();
          }}
          {...undoStep.endProps}
        />
        <NumberField className="effects-number" label={spec.label} value={value} min={spec.min} max={spec.max} step={spec.step} onChange={onChange} />
      </div>
    </div>
  );
}

export function EffectsPanel() {
  const postProcessing = useEditorStore((state) => state.postProcessing);
  const updatePostProcessing = useEditorStore((state) => state.updatePostProcessing);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  // The effect whose values are open in the drawer.
  const [open, setOpen] = useState<EffectName | null>(null);
  const rows = useRef<Partial<Record<EffectName, HTMLDivElement | null>>>({});

  // Play hides the sidebar, and the drawer with it.
  useEffect(() => {
    if (isPreviewMode) setOpen(null);
  }, [isPreviewMode]);

  const openRow = open ? rows.current[open] : null;

  return (
    <PanelSection
      title="Effects"
      defaultOpen={true}
      action={
        <label className="toggle" title={postProcessing.enabled ? "Turn every effect off" : "Turn the effects on"}>
          <input type="checkbox" aria-label="Effects" checked={postProcessing.enabled} onChange={(event) => updatePostProcessing({ enabled: event.target.checked })} />
          <span className="toggle-track" />
        </label>
      }
    >
      <div className={`effects ${postProcessing.enabled ? "" : "off"}`}>
        <Slider label="Exposure" min={-3} max={3} step={0.1} value={postProcessing.exposure} onChange={(exposure) => updatePostProcessing({ exposure })} />

        <div className="mat-rows">
          {EFFECT_NAMES.map((name) => {
            const { label, icon, values } = EFFECT_ROWS[name];
            const config = postProcessing[name];
            return (
              <div
                key={name}
                ref={(element) => {
                  rows.current[name] = element;
                }}
                className={`mat-row ${open === name ? "open" : ""} ${config.enabled ? "" : "off"}`}
              >
                <span className="mat-row-type static">
                  <span className="mat-row-name">{label}</span>
                </span>
                {values.length > 0 && (
                  <button
                    type="button"
                    className={`mat-icon-btn mat-row-icon ${open === name ? "on" : ""}`}
                    title={`${label} settings`}
                    aria-label={`${label} settings`}
                    aria-expanded={open === name}
                    onClick={() => setOpen(open === name ? null : name)}
                  >
                    <i className={`ti ${icon}`}></i>
                  </button>
                )}
                <NumberField
                  className="mat-row-opacity"
                  label={`${label} amount (%)`}
                  value={config.amount}
                  min={0}
                  max={100}
                  step={1}
                  integer
                  onChange={(amount) => updatePostProcessing({ [name]: { amount } })}
                />
                <button
                  type="button"
                  className="mat-icon-btn"
                  title={config.enabled ? `Turn ${label} off` : `Turn ${label} on`}
                  aria-label={`${label} on`}
                  aria-pressed={config.enabled}
                  onClick={() => updatePostProcessing({ [name]: { enabled: !config.enabled } })}
                >
                  <i className={`ti ${config.enabled ? "ti-eye" : "ti-eye-off"}`}></i>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {open && openRow && (
        <SideDrawer key={open} anchor={openRow} title={EFFECT_ROWS[open].label} icon={EFFECT_ROWS[open].icon} onClose={() => setOpen(null)}>
          {EFFECT_ROWS[open].values.map((spec) => (
            <ValueRow
              key={spec.key}
              spec={spec}
              value={(postProcessing[open] as unknown as Record<string, number>)[spec.key]}
              onChange={(value) => updatePostProcessing({ [open]: { [spec.key]: value } })}
            />
          ))}
        </SideDrawer>
      )}
    </PanelSection>
  );
}
