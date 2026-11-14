/**
 * PURPOSE: The left sidebar's Assets tab: what the scene holds to reuse. For now its material
 * assets (`materials` in the store, scene/materialAssets.ts), as one section; colour, image and
 * audio assets get their own sections when they exist.
 *
 * It is the same list as the Material Assets drawer beside the right sidebar
 * (inspector/MaterialAssetsDrawer.tsx), with the same rows: a click on a material, or "+", opens it
 * in that drawer's Material Builder, where its shaderball and layers are. The row of the material
 * open there is marked.
 *
 * INPUT: The search box's text, and the drawer's view with how to change it (useRightSidebarState).
 * OUTPUT: Edits through the store's asset actions. Everything that changes the scene is disabled
 * while it's view only.
 */

import { useShallow } from "zustand/react/shallow";
import { useEditorStore } from "../store/useEditorStore";
import { inspectSelection } from "./inspector/inspectedSelection";
import { AssetRow, type AssetsView } from "./inspector/MaterialAssetsDrawer";

interface AssetsBrowserProps {
  searchQuery: string;
  assetsView: AssetsView | null;
  onAssetsView: (view: AssetsView | null) => void;
}

export function AssetsBrowser({ searchQuery, assetsView, onAssetsView }: AssetsBrowserProps) {
  const materials = useEditorStore((state) => state.materials);
  // The selected objects, as the inspector's panels see them: what a row's "apply" applies to.
  const selectedEntities = useEditorStore(useShallow((state) => inspectSelection(state.entities, state.selectedEntityIds).selected));
  const createMaterialAsset = useEditorStore((state) => state.createMaterialAsset);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);

  const query = searchQuery.trim().toLowerCase();
  const assets = Object.values(materials);
  const shown = query ? assets.filter((asset) => asset.name.toLowerCase().includes(query)) : assets;

  return (
    <section className="assets-section" aria-label="Material assets">
      <div className="assets-section-header">
        <span>Material Assets</span>
        <button
          type="button"
          className="mat-icon-btn"
          title="New material"
          aria-label="New material"
          disabled={isReadOnly}
          onClick={() => {
            const assetId = createMaterialAsset();
            if (assetId) onAssetsView({ assetId });
          }}
        >
          <i className="ti ti-plus"></i>
        </button>
      </div>
      {shown.length === 0 ? (
        <p className="assets-section-note">{assets.length === 0 ? "No materials yet. A material is a layer stack several objects can share: press + to build one." : "No material matches the search."}</p>
      ) : (
        shown.map((asset) => (
          <AssetRow key={asset.id} asset={asset} selectedEntities={selectedEntities} open={assetsView?.assetId === asset.id} onOpen={() => onAssetsView({ assetId: asset.id })} />
        ))
      )}
    </section>
  );
}
