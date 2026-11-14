/**
 * PURPOSE: Inspector panel for the selected objects' material: the material asset they use, or
 * their own layer stack (LayerStack.tsx, top of the stack first) and opacity.
 *
 * Right after the title, the four-circles button opens the Material Assets drawer
 * (MaterialAssetsDrawer.tsx: the scene's reusable materials, the Libre3D library, and the Material
 * Builder; the right sidebar holds it, so it stays open while nothing is selected).
 *
 * Objects with a material of their own: at the right of the title, their opacity and a "+" that
 * adds a Color layer; under it, their layer rows.
 *
 * Objects that use a material asset: a row naming the asset (a click opens it in the Material
 * Builder, where its layers and its opacity are edited, for every object using it), and at the
 * right of the title a detach button, which gives the objects the asset's layers and opacity as
 * their own.
 *
 * A state can set the opacity and the colour (the top Color layer's: layers/ColorSettings.tsx) of
 * an object with a material of its own. While such an object is shown in a state, its opacity here
 * is that state's, with the marker and "Reset to Base" the Transform panel's fields have; every
 * other layer setting belongs to the object in every state. A material asset is the same in every
 * state, its opacity included: detach an object from it to animate its colour or opacity.
 *
 * Several selected objects with the same layers in the same order are edited row by row; with
 * different stacks, their Lighting and top Color layers are.
 */

import { getViewedState } from "../../animation/objectStates";
import { useEditorStore, type Entity, type MaterialAsset } from "../../store/useEditorStore";
import { NumberField } from "../ui/NumberField";
import { PanelSection } from "../ui/PanelSection";
import { LayerStack } from "./LayerStack";
import { AssetBall, FourCirclesIcon, type AssetsView } from "./MaterialAssetsDrawer";
import { assetOf, opacityOf } from "../../scene/materialAssets";
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

  if (selectedEntities.length === 0) return null;

  // The selected objects that use a material asset, and those assets, each once. With any, the
  // panel names them: their layers are edited in the Material Builder.
  const onAssets = selectedEntities.filter((entity) => assetOf(entity, materials));
  const usedAssets = [...new Set(onAssets.map((entity) => assetOf(entity, materials)!))];

  const assetsButton = (
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
  );

  if (usedAssets.length > 0) {
    return (
      <PanelSection
        title="Material"
        defaultOpen={true}
        titleAction={assetsButton}
        action={
          <button
            type="button"
            className="mat-icon-btn"
            title="Detach: give the object the material's layers and opacity as its own (to edit it alone, or to animate its colour or opacity)"
            aria-label="Detach from the material asset"
            disabled={isReadOnly}
            onClick={() => detachMaterialAsset(onAssets.map((entity) => entity.id))}
          >
            <i className="ti ti-unlink"></i>
          </button>
        }
      >
        <div className="material-layer-stack">
          {usedAssets.map((asset) => (
            <UsedAsset key={asset.id} asset={asset} onOpen={() => onAssetsView({ assetId: asset.id })} />
          ))}
          {onAssets.length < selectedEntities.length && <p className="mat-drawer-note">Some of the selected objects have layers of their own: select them alone to edit those.</p>}
        </div>
      </PanelSection>
    );
  }

  const owners = ownersFor(selectedEntities, materials);
  // Each object's opacity as it's shown: the state's it is shown in, over its own.
  const shownStates = selectedEntities.map((entity) => getViewedState(viewedStates, objectStates, entity.id));
  const opacities = selectedEntities.map((entity, i) => shownStates[i]?.values.opacity ?? opacityOf(entity, materials));
  // One object shown in a state: its opacity gets a marker and a "Reset to Base".
  const objectState = selectedEntities.length === 1 ? shownStates[0] : null;
  const opacityMixed = opacities.some((opacity) => opacity !== opacities[0]);

  return (
    <PanelSection
      title="Material"
      defaultOpen={true}
      titleAction={assetsButton}
      action={
        <div className="mat-header-controls">
          <StateValueExtra objectState={objectState} field="opacity" />
          <NumberField
            className="mat-opacity-field"
            label="Object opacity (%)"
            value={opacityMixed ? null : Math.round(opacities[0] * 100)}
            min={0}
            max={100}
            step={1}
            integer
            disabled={isReadOnly}
            onChange={(percent) => updateShownLooks(Object.fromEntries(selectedEntities.map((entity) => [entity.id, { opacity: percent / 100 }])))}
          />
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
        </div>
      }
    >
      <div className="material-layer-stack">
        <LayerStack owners={owners} />
      </div>
    </PanelSection>
  );
}

/** The material asset the selected objects use: its ball and name. A click opens it in the Material Builder. */
function UsedAsset({ asset, onOpen }: { asset: MaterialAsset; onOpen: () => void }) {
  return (
    <button type="button" className="mat-asset-card" title="Edit in the Material Builder: changes every object using this material" onClick={onOpen}>
      <AssetBall asset={asset} />
      <span className="mat-asset-name">{asset.name}</span>
    </button>
  );
}
