/**
 * PURPOSE: The Material Assets drawer, beside the right sidebar: the scene's reusable materials
 * (`materials` in the store, scene/materialAssets.ts), and the Material Builder for one of them
 * (MaterialBuilder.tsx).
 *
 * The list: one row per asset (its ball, its name, apply to the selected objects, delete), "+" for a
 * new material, and "from selection" for one made from the selected object's layers. A click on a
 * row, or "+", shows that asset in the builder in place of the list; the builder's arrow goes back.
 * The left sidebar's Assets tab (AssetsBrowser.tsx) lists the same assets with the same rows, and
 * opens this drawer's builder.
 *
 * INPUT: Which view is showing (`AssetsView`, held by the layout: useRightSidebarState). OUTPUT: Edits through the
 * store's asset actions, applied to the selected objects that have a material.
 *
 * Everything that changes the scene is disabled while it's view only; the list and the builder can
 * still be looked at.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditorStore, type Entity, type MaterialAsset } from "../../store/useEditorStore";
import { colorLayerOf } from "../../scene/layers";
import { canUseMaterialAsset, usersOfMaterialAsset } from "../../scene/materialAssets";
import { useShallow } from "zustand/react/shallow";
import { inspectSelection } from "./inspectedSelection";
import { MaterialBuilder } from "./MaterialBuilder";


/** The drawer's view: the list (`assetId` null), or the builder for one asset. */
export interface AssetsView {
  assetId: string | null;
}

/** Four circles in a square: the Material Assets button. */
export function FourCirclesIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="3.6" cy="3.6" r="2.4" />
      <circle cx="10.4" cy="3.6" r="2.4" />
      <circle cx="3.6" cy="10.4" r="2.4" />
      <circle cx="10.4" cy="10.4" r="2.4" />
    </svg>
  );
}

/** An asset's icon: a small ball in its top Color layer's colour (grey when it has none). */
export function AssetBall({ asset }: { asset: MaterialAsset }) {
  return <span className="mat-asset-ball" style={{ ["--ball-color" as string]: colorLayerOf(asset.layers)?.color ?? "#8a8a92" }} aria-hidden="true" />;
}

/**
 * One material asset in a list (this drawer's, and the left sidebar's Assets tab): its ball and name
 * (a click opens it in the Material Builder), how many objects use it, apply to the selected
 * objects, and delete. `open`: it's the one in the builder.
 */
export function AssetRow({ asset, selectedEntities, onOpen, open = false }: { asset: MaterialAsset; selectedEntities: Entity[]; onOpen: () => void; open?: boolean }) {
  const applyMaterialAsset = useEditorStore((state) => state.applyMaterialAsset);
  const removeMaterialAsset = useEditorStore((state) => state.removeMaterialAsset);
  const userCount = useEditorStore((state) => usersOfMaterialAsset(state.entities, asset.id).length);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);

  const targets = selectedEntities.filter(canUseMaterialAsset);
  const applied = targets.length > 0 && targets.every((entity) => entity.materialAssetId === asset.id);

  return (
    <div className={`mat-asset-row ${open ? "open" : ""}`}>
      <button type="button" className="mat-asset-open" title="Open in the Material Builder" onClick={onOpen}>
        <AssetBall asset={asset} />
        <span className="mat-asset-name">{asset.name}</span>
        <span className="mat-asset-count" title={`${userCount} ${userCount === 1 ? "object uses" : "objects use"} this material`}>
          {userCount}
        </span>
      </button>
      <button
        type="button"
        className={`mat-icon-btn ${applied ? "on" : ""}`}
        title={applied ? "The selected objects use this material" : targets.length > 0 ? "Apply to the selected objects (replaces their own layers)" : "Select an object to apply this material to"}
        aria-label={`Apply ${asset.name} to the selected objects`}
        aria-pressed={applied}
        disabled={isReadOnly || targets.length === 0 || applied}
        onClick={() => applyMaterialAsset(asset.id, targets.map((entity) => entity.id))}
      >
        <i className="ti ti-link"></i>
      </button>
      <button
        type="button"
        className="mat-icon-btn"
        title={userCount > 0 ? "Delete the material: the objects using it keep its layers as their own" : "Delete the material"}
        aria-label={`Delete ${asset.name}`}
        disabled={isReadOnly}
        onClick={() => removeMaterialAsset(asset.id)}
      >
        <i className="ti ti-trash"></i>
      </button>
    </div>
  );
}

export function MaterialAssetsDrawer({ view, onView }: { view: AssetsView; onView: (view: AssetsView | null) => void }) {
  const materials = useEditorStore((state) => state.materials);
  // The selected objects, as the inspector's panels see them (inspectedSelection.ts).
  const selectedEntities = useEditorStore(useShallow((state) => inspectSelection(state.entities, state.selectedEntityIds).selected));
  const createMaterialAsset = useEditorStore((state) => state.createMaterialAsset);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const drawer = useRef<HTMLDivElement>(null);
  const [right, setRight] = useState<number | null>(null);

  // Beside the right sidebar, from its top.
  useLayoutEffect(() => {
    const placeIt = () => {
      const sidebar = document.querySelector(".right-sidebar");
      setRight(sidebar ? window.innerWidth - sidebar.getBoundingClientRect().left + 8 : 8);
    };
    placeIt();
    window.addEventListener("resize", placeIt);
    return () => window.removeEventListener("resize", placeIt);
  }, []);

  const asset = view.assetId ? materials[view.assetId] : undefined;

  // The asset in the builder went (deleted, or its creation undone): back to the list.
  useEffect(() => {
    if (view.assetId && !asset) onView({ assetId: null });
  }, [view.assetId, asset, onView]);

  // Escape closes the drawer, unless a layer's settings drawer is open over it (that one closes first).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.querySelector(".mat-drawer:not(.mat-assets)")) return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      onView(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onView]);

  // The one selected object a material can be made from: it has layers of its own.
  const source = selectedEntities.length === 1 && canUseMaterialAsset(selectedEntities[0]) && !selectedEntities[0].materialAssetId ? selectedEntities[0] : null;
  const assets = Object.values(materials);

  const openNew = (fromEntityId?: string) => {
    const assetId = createMaterialAsset(fromEntityId);
    if (assetId) onView({ assetId });
  };

  return createPortal(
    <div
      ref={drawer}
      className={`mat-drawer mat-assets ${asset ? "building" : ""}`}
      role="dialog"
      aria-label={asset ? "Material Builder" : "Material assets"}
      style={right === null ? { visibility: "hidden" } : { right }}
    >
      {asset ? (
        <MaterialBuilder asset={asset} selectedEntities={selectedEntities} onBack={() => onView({ assetId: null })} onClose={() => onView(null)} />
      ) : (
        <>
          <div className="mat-drawer-header">
            <FourCirclesIcon />
            <span>Material Assets</span>
            {source && (
              <button
                type="button"
                className="mat-icon-btn"
                title={`New material from ${source.name}'s layers (it then uses the material)`}
                aria-label="New material from the selected object"
                disabled={isReadOnly}
                onClick={() => openNew(source.id)}
              >
                <i className="ti ti-copy-plus"></i>
              </button>
            )}
            <button type="button" className="mat-icon-btn" title="New material" aria-label="New material" disabled={isReadOnly} onClick={() => openNew()}>
              <i className="ti ti-plus"></i>
            </button>
            <button type="button" className="mat-icon-btn" title="Close" aria-label="Close the material assets" onClick={() => onView(null)}>
              <i className="ti ti-x"></i>
            </button>
          </div>
          <div className="mat-assets-body">
            {assets.length === 0 ? (
              <p className="mat-drawer-note">No materials yet. A material is a layer stack several objects can share: press + to build one.</p>
            ) : (
              assets.map((each) => <AssetRow key={each.id} asset={each} selectedEntities={selectedEntities} onOpen={() => onView({ assetId: each.id })} />)
            )}
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
