/**
 * PURPOSE: The Material Assets drawer, beside the right sidebar: the materials to pick from, and
 * the Material Builder for one of the scene's (MaterialBuilder.tsx).
 *
 * The list, top to bottom: "+" for a new material (and, with one object selected, one made from
 * that object's layers) beside a search box; a filter for which libraries are shown; "My
 * Materials", the scene's own (`materials` in the store, scene/materialAssets.ts); and the Libre3D
 * library (utils/materialLibrary.ts), the same for every scene, with a filter for its categories.
 *
 * A row of "My Materials": its ball and name (a click opens it in the builder in place of the
 * list; the builder's × comes back), how many objects use it, apply to the selected objects, and
 * delete. A row of the library: a click adds a copy to the scene's materials and applies it to the
 * selected objects.
 *
 * Only signed-in Libre3D developers change the library (the server checks: awsLibraryHandler.ts).
 * They get two more buttons: on a material of the scene, "add to the library" (it asks for a
 * category), and on a library material, remove.
 *
 * The left sidebar's Assets tab (AssetsBrowser.tsx) lists the scene's materials with the same rows,
 * and opens this drawer's builder.
 *
 * INPUT: Which view is showing (`AssetsView`, held by the layout: useRightSidebarState). OUTPUT: Edits through the
 * store's asset actions, applied to the selected objects that have a material.
 *
 * Everything that changes the scene is disabled while it's view only; the list and the builder can
 * still be looked at.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEditorStore, type Entity, type MaterialAsset } from "../../store/useEditorStore";
import { useAuthSession } from "../../hooks/useAuthSession";
import { colorLayerOf } from "../../scene/layers";
import { assetOpacity, canUseMaterialAsset, usersOfMaterialAsset } from "../../scene/materialAssets";
import {
  addLibraryMaterial,
  canEditMaterialLibrary,
  libraryCategories,
  listLibraryMaterials,
  removeLibraryMaterial,
  type LibraryMaterial,
} from "../../utils/materialLibrary";
import { DEFAULT_LIBRARY_CATEGORY, MAX_LIBRARY_CATEGORY_LENGTH } from "../../utils/materialLibraryShared";
import { useShallow } from "zustand/react/shallow";
import { inspectSelection } from "./inspectedSelection";
import { MaterialBuilder } from "./MaterialBuilder";
import { asOneUndoStep } from "./materialRows";

/** The drawer's view: the list (`assetId` null), or the builder for one asset. */
export interface AssetsView {
  assetId: string | null;
}

/** Which materials the list shows. */
type LibraryScope = "all" | "mine" | "library";

const LIBRARY_NAME = "Libre3D Library";

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

/** A material's icon: a small ball in its top Color layer's colour (grey when it has none). */
export function AssetBall({ asset }: { asset: Pick<MaterialAsset, "layers"> }) {
  return <span className="mat-asset-ball" style={{ ["--ball-color" as string]: colorLayerOf(asset.layers)?.color ?? "#8a8a92" }} aria-hidden="true" />;
}

/**
 * One material asset in a list (this drawer's, and the left sidebar's Assets tab): its ball and name
 * (a click opens it in the Material Builder), how many objects use it, apply to the selected
 * objects, and delete. `open`: it's the one in the builder. `extra`: more buttons, before those.
 */
export function AssetRow({
  asset,
  selectedEntities,
  onOpen,
  open = false,
  extra,
}: {
  asset: MaterialAsset;
  selectedEntities: Entity[];
  onOpen: () => void;
  open?: boolean;
  extra?: ReactNode;
}) {
  const applyMaterialAsset = useEditorStore((state) => state.applyMaterialAsset);
  const removeMaterialAsset = useEditorStore((state) => state.removeMaterialAsset);
  const userCount = useEditorStore((state) => usersOfMaterialAsset(state.entities, asset.id).length);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);

  const targets = selectedEntities.filter(canUseMaterialAsset);
  const applied = targets.length > 0 && targets.every((entity) => entity.materialAssetId === asset.id);

  return (
    <div className={`mat-asset-row ${open ? "open" : ""}`}>
      <button type="button" className="mat-asset-open" title="Edit in the Material Builder" onClick={onOpen}>
        <AssetBall asset={asset} />
        <span className="mat-asset-name">{asset.name}</span>
        <span className="mat-asset-count" title={`${userCount} ${userCount === 1 ? "object uses" : "objects use"} this material`}>
          {userCount}
        </span>
      </button>
      {extra}
      <button
        type="button"
        className={`mat-icon-btn ${applied ? "on" : ""}`}
        title={applied ? "The selected objects use this material" : targets.length > 0 ? "Apply to the selected objects (replaces their own layers and opacity)" : "Select an object to apply this material to"}
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

// The Libre3D library, loaded when the drawer opens.
type LibraryState = { status: "loading" | "ready" | "failed"; materials: LibraryMaterial[] };

export function MaterialAssetsDrawer({ view, onView }: { view: AssetsView; onView: (view: AssetsView | null) => void }) {
  const materials = useEditorStore((state) => state.materials);
  // The selected objects, as the inspector's panels see them (inspectedSelection.ts).
  const selectedEntities = useEditorStore(useShallow((state) => inspectSelection(state.entities, state.selectedEntityIds).selected));
  const createMaterialAsset = useEditorStore((state) => state.createMaterialAsset);
  const addMaterialAsset = useEditorStore((state) => state.addMaterialAsset);
  const applyMaterialAsset = useEditorStore((state) => state.applyMaterialAsset);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const canEditLibrary = canEditMaterialLibrary(useAuthSession());
  const drawer = useRef<HTMLDivElement>(null);
  const [right, setRight] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<LibraryScope>("all");
  // "" is every category.
  const [category, setCategory] = useState("");
  const [library, setLibrary] = useState<LibraryState>({ status: "loading", materials: [] });
  // The scene's material a developer is adding to the library, and the category typed for it.
  const [adding, setAdding] = useState<{ assetId: string; category: string; busy: boolean } | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);

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

  useEffect(() => {
    let gone = false;
    listLibraryMaterials().then(
      (loaded) => {
        if (!gone) setLibrary({ status: "ready", materials: loaded });
      },
      () => {
        if (!gone) setLibrary({ status: "failed", materials: [] });
      },
    );
    return () => {
      gone = true;
    };
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
  const targets = selectedEntities.filter(canUseMaterialAsset);

  const matches = (name: string) => name.toLowerCase().includes(query.trim().toLowerCase());
  const assets = Object.values(materials);
  const shownAssets = assets.filter((each) => matches(each.name));
  const categories = libraryCategories(library.materials);
  // A category that went with its last material shows everything again.
  const shownCategory = categories.includes(category) ? category : "";
  const shownLibrary = library.materials.filter((each) => matches(each.name) && (!shownCategory || each.category === shownCategory));

  const openNew = (fromEntityId?: string) => {
    const assetId = createMaterialAsset(fromEntityId);
    if (assetId) onView({ assetId });
  };

  // A library material becomes one of the scene's, used by the selected objects: one undo step.
  const takeFromLibrary = (material: LibraryMaterial) => {
    let assetId = "";
    asOneUndoStep([
      () => {
        assetId = addMaterialAsset(material);
      },
      () => {
        if (assetId && targets.length > 0) applyMaterialAsset(assetId, targets.map((entity) => entity.id));
      },
    ]);
  };

  const addToLibrary = async () => {
    const from = adding && materials[adding.assetId];
    if (!adding || !from || adding.busy) return;
    setAdding({ ...adding, busy: true });
    setLibraryError(null);
    try {
      const opacity = assetOpacity(from);
      const added = await addLibraryMaterial({
        name: from.name,
        category: adding.category.trim() || DEFAULT_LIBRARY_CATEGORY,
        layers: from.layers,
        ...(opacity < 1 ? { opacity } : null),
      });
      setLibrary((was) => ({ status: "ready", materials: [...was.materials, added] }));
      setAdding(null);
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : "Could not add the material to the library.");
      setAdding((was) => was && { ...was, busy: false });
    }
  };

  const removeFromLibrary = async (material: LibraryMaterial) => {
    if (!window.confirm(`Remove "${material.name}" from the ${LIBRARY_NAME}? Scenes that already use it keep their copy.`)) return;
    setLibraryError(null);
    try {
      await removeLibraryMaterial(material.id);
      setLibrary((was) => ({ ...was, materials: was.materials.filter((each) => each.id !== material.id) }));
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : "Could not remove the material from the library.");
    }
  };

  return createPortal(
    <div
      ref={drawer}
      className={`mat-drawer mat-assets ${asset ? "building" : ""}`}
      role="dialog"
      aria-label={asset ? "Edit material asset" : "Material assets"}
      style={right === null ? { visibility: "hidden" } : { right }}
    >
      {asset ? (
        <MaterialBuilder asset={asset} onBack={() => onView({ assetId: null })} />
      ) : (
        <>
          <div className="mat-drawer-header">
            <span>Material Assets</span>
            <button type="button" className="mat-icon-btn" title="Close" aria-label="Close the material assets" onClick={() => onView(null)}>
              <i className="ti ti-x"></i>
            </button>
          </div>
          <div className="mat-assets-body">
            <div className="mat-assets-toolbar">
              <button type="button" className="mat-assets-new" title="New material" aria-label="New material" disabled={isReadOnly} onClick={() => openNew()}>
                <i className="ti ti-plus"></i>
              </button>
              {source && (
                <button
                  type="button"
                  className="mat-assets-new"
                  title={`New material from ${source.name}'s layers (it then uses the material)`}
                  aria-label="New material from the selected object"
                  disabled={isReadOnly}
                  onClick={() => openNew(source.id)}
                >
                  <i className="ti ti-copy-plus"></i>
                </button>
              )}
              <label className="mat-assets-search">
                <i className="ti ti-search" aria-hidden="true"></i>
                <input type="search" placeholder="Search" aria-label="Search the materials" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
            </div>

            <div className="select-wrap mat-assets-select">
              <select aria-label="Which materials to show" value={scope} onChange={(event) => setScope(event.target.value as LibraryScope)}>
                <option value="all">All Libraries</option>
                <option value="mine">My Materials</option>
                <option value="library">{LIBRARY_NAME}</option>
              </select>
            </div>

            {scope !== "library" && (
              <section className="mat-assets-section" aria-label="My Materials">
                <div className="mat-assets-heading">
                  <span>My Materials</span>
                </div>
                {shownAssets.length === 0 ? (
                  <p className="mat-drawer-note">
                    {assets.length === 0 ? "No materials yet. A material is a layer stack several objects can share: press + to build one." : "No material matches the search."}
                  </p>
                ) : (
                  shownAssets.map((each) => (
                    <div key={each.id} className="mat-assets-item">
                      <AssetRow
                        asset={each}
                        selectedEntities={selectedEntities}
                        onOpen={() => onView({ assetId: each.id })}
                        extra={
                          canEditLibrary && (
                            <button
                              type="button"
                              className={`mat-icon-btn ${adding?.assetId === each.id ? "on" : ""}`}
                              title={`Add to the ${LIBRARY_NAME}, for every scene (developers only)`}
                              aria-label={`Add ${each.name} to the ${LIBRARY_NAME}`}
                              aria-expanded={adding?.assetId === each.id}
                              onClick={() => setAdding(adding?.assetId === each.id ? null : { assetId: each.id, category: shownCategory, busy: false })}
                            >
                              <i className="ti ti-library-plus"></i>
                            </button>
                          )
                        }
                      />
                      {adding?.assetId === each.id && (
                        <form
                          className="mat-library-add"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void addToLibrary();
                          }}
                        >
                          <input
                            type="text"
                            list="mat-library-categories"
                            placeholder={`Category (${DEFAULT_LIBRARY_CATEGORY})`}
                            aria-label="Library category"
                            maxLength={MAX_LIBRARY_CATEGORY_LENGTH}
                            value={adding.category}
                            autoFocus
                            onChange={(event) => setAdding({ ...adding, category: event.target.value })}
                          />
                          <datalist id="mat-library-categories">
                            {categories.map((name) => (
                              <option key={name} value={name} />
                            ))}
                          </datalist>
                          <button type="submit" className="mat-drawer-btn" disabled={adding.busy}>
                            {adding.busy ? "Adding…" : "Add to library"}
                          </button>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </section>
            )}

            {scope !== "mine" && (
              <section className="mat-assets-section" aria-label={LIBRARY_NAME}>
                <div className="mat-assets-heading">
                  <span>{LIBRARY_NAME}</span>
                  <div className="select-wrap mat-assets-select">
                    <select aria-label="Library category" value={shownCategory} onChange={(event) => setCategory(event.target.value)}>
                      <option value="">All</option>
                      {categories.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {libraryError && (
                  <p className="mat-drawer-note mat-assets-error" role="alert">
                    {libraryError}
                  </p>
                )}
                {shownLibrary.length === 0 ? (
                  <p className="mat-drawer-note">
                    {library.status === "loading"
                      ? "Loading the library…"
                      : library.status === "failed"
                        ? "The library couldn't be loaded."
                        : library.materials.length === 0
                          ? "Nothing in the library yet."
                          : "No library material matches."}
                  </p>
                ) : (
                  shownLibrary.map((each) => (
                    <div key={each.id} className="mat-asset-row">
                      <button
                        type="button"
                        className="mat-asset-open"
                        title={targets.length > 0 ? "Add to this scene's materials and apply to the selected objects" : "Add to this scene's materials"}
                        disabled={isReadOnly}
                        onClick={() => takeFromLibrary(each)}
                      >
                        <AssetBall asset={each} />
                        <span className="mat-asset-name">{each.name}</span>
                      </button>
                      {canEditLibrary && (
                        <button
                          type="button"
                          className="mat-icon-btn"
                          title={`Remove from the ${LIBRARY_NAME} (developers only)`}
                          aria-label={`Remove ${each.name} from the ${LIBRARY_NAME}`}
                          onClick={() => void removeFromLibrary(each)}
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </section>
            )}
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
