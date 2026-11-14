/**
 * PURPOSE: Inspector panel for the selected objects' material: their opacity, the material asset
 * they use (if any), and their layer stack (LayerStack.tsx), top of the stack first.
 *
 * Beside the title: the four-circles button opens the Material Assets drawer (MaterialAssetsDrawer.tsx,
 * the scene's reusable materials and the Material Builder; the right sidebar holds it, so it stays
 * open while nothing is selected), and "+" adds a Color layer.
 *
 * Objects that use a material asset show the asset's stack, under a row naming it with a detach
 * button: their rows edit the asset, so every object using it changes. Detaching gives the objects
 * the layers as their own. Opacity is always each object's own.
 *
 * A state can set an object's opacity, and the colour of an object with layers of its own (its top
 * Color layer's: layers/ColorSettings.tsx). While an object is shown in a state, its Opacity here is
 * that state's, with the marker and "Reset to Base" the Transform panel's fields have; every other
 * layer setting belongs to the object in every state. A material asset is the same in every state:
 * detach an object from it to animate its colour.
 *
 * Several selected objects with the same layers in the same order are edited row by row; with
 * different stacks, their Lighting and top Color layers are.
 */

import { getViewedState } from "../../animation/objectStates";
import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { NumberField } from "../ui/NumberField";
import { PanelSection } from "../ui/PanelSection";
import { LayerStack } from "./LayerStack";
import { AssetBall, FourCirclesIcon, type AssetsView } from "./MaterialAssetsDrawer";
import { asOneUndoStep, ownersFor } from "./materialRows";
import { StateValueExtra } from "./StateValueExtra";

interface MaterialsPanelProps {
  selectedEntities: Entity[];
  /** Whether the Material Assets drawer is open (the right sidebar holds it), and how to show a view of it. */
  assetsOpen: boolean;
  onAssetsView: (view: AssetsView | null) => void;
}

export function MaterialsPanel({ selectedEntities: allSelectedEntities, assetsOpen, onAssetsView }: MaterialsPanelProps) {
  const materials = useEditorStore((state) => state.materials);
  const addMaterialLayer = useEditorStore((state) => state.addMaterialLayer);
  const updateShownLooks = useEditorStore((state) => state.updateShownLooks);
  const viewedStates = useEditorStore((state) => state.viewedStates);
  const objectStates = useEditorStore((state) => state.animation.states);
  const detachMaterialAsset = useEditorStore((state) => state.detachMaterialAsset);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);

  // Imported meshes carry derived materialLayers too: only the stack existing matters. Directional
  // lights (no material) and import nodes still awaiting their layers are left out.
  const selectedEntities = allSelectedEntities.filter((e) => e.type !== "directionalLight" && e.materialLayers);
  const owners = ownersFor(selectedEntities, materials);
  // The asset every selected object uses, when they all use the same one.
  const sharedAsset = owners.length === 1 ? materials[owners[0].id] : undefined;

  if (selectedEntities.length === 0) return null;

  // Each object's opacity as it's shown: the state's it is shown in, over its own.
  const shownStates = selectedEntities.map((entity) => getViewedState(viewedStates, objectStates, entity.id));
  const opacities = selectedEntities.map((entity, i) => shownStates[i]?.values.opacity ?? entity.opacity ?? 1);
  // One object shown in a state: its opacity gets a marker and a "Reset to Base".
  const objectState = selectedEntities.length === 1 ? shownStates[0] : null;
  const opacityMixed = opacities.some((opacity) => opacity !== opacities[0]);

  return (
    <PanelSection
      title="Materials"
      defaultOpen={true}
      action={
        <>
          <button
            type="button"
            className={`mat-icon-btn ${assetsOpen ? "on" : ""}`}
            title="Material assets: materials to reuse on several objects"
            aria-label="Material assets"
            aria-expanded={assetsOpen}
            onClick={() => onAssetsView(assetsOpen ? null : { assetId: null })}
          >
            <FourCirclesIcon />
          </button>
          <button
            type="button"
            className="mat-icon-btn"
            title="Add a Color layer (its type can be changed in its row)"
            aria-label="Add a layer"
            disabled={isReadOnly}
            onClick={() => asOneUndoStep(owners.map((owner) => () => addMaterialLayer(owner.id, "color")))}
          >
            <i className="ti ti-plus"></i>
          </button>
        </>
      }
    >
      <div className="material-layer-stack">
        <div className="prop mat-object-opacity">
          <span className="prop-label">
            Opacity
            <StateValueExtra objectState={objectState} field="opacity" />
          </span>
          <NumberField
            label="Object opacity (%)"
            value={opacityMixed ? null : Math.round(opacities[0] * 100)}
            min={0}
            max={100}
            step={1}
            integer
            onChange={(percent) => updateShownLooks(Object.fromEntries(selectedEntities.map((entity) => [entity.id, { opacity: percent / 100 }])))}
          />
        </div>

        {sharedAsset && (
          <div className="mat-asset-link" title="These layers are a material asset's: editing them changes every object that uses it, in every state. Detach to animate this object's colour.">
            <AssetBall asset={sharedAsset} />
            <button type="button" className="mat-asset-name" title="Open in the Material Builder" onClick={() => onAssetsView({ assetId: sharedAsset.id })}>
              {sharedAsset.name}
            </button>
            <button
              type="button"
              className="mat-icon-btn"
              title="Detach: give the object these layers as its own"
              aria-label="Detach from the material asset"
              disabled={isReadOnly}
              onClick={() => detachMaterialAsset(selectedEntities.map((entity) => entity.id))}
            >
              <i className="ti ti-unlink"></i>
            </button>
          </div>
        )}

        <LayerStack owners={owners} />
      </div>
    </PanelSection>
  );
}
