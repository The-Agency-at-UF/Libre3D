/**
 * PURPOSE: The Material Builder: one material asset, edited in the Material Assets drawer
 * (MaterialAssetsDrawer.tsx). Top to bottom: its name, the shaderball (drag to turn it), "Select
 * objects using this material", "Apply to selection", and its layer stack under a "Material"
 * heading with a "+" that adds a Color layer (LayerStack.tsx, the rows the Materials panel uses).
 *
 * INPUT: The asset and the selected objects that have a material. OUTPUT: Edits through the store's
 * asset and layer actions; the selection, from "Select objects using this material".
 *
 * The shaderball (viewport/materialPreview.ts) is made when the builder opens, draws only when the
 * material or the view changes, and is disposed when the builder closes.
 */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import { useEditorStore, type Entity, type MaterialAsset, type MaterialLayer } from "../../store/useEditorStore";
import { canUseMaterialAsset, usersOfMaterialAsset } from "../../scene/materialAssets";
import { MaterialPreview } from "../../viewport/materialPreview";
import { LayerStack } from "./LayerStack";
import { assetOwner } from "./materialRows";

// The shaderball's canvas, in device pixels at up to twice the size it's shown.
const BALL_CSS_SIZE = 148;

function Shaderball({ layers }: { layers: MaterialLayer[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const preview = useRef<MaterialPreview | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    const made = new MaterialPreview(canvas.current, layers);
    preview.current = made;
    return () => {
      made.dispose();
      preview.current = null;
    };
    // Made once per builder; later stacks go through setLayers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    preview.current?.setLayers(layers);
  }, [layers]);

  const size = Math.round(BALL_CSS_SIZE * Math.min(2, window.devicePixelRatio || 1));

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    preview.current?.orbit(event.clientX - drag.current.x, event.clientY - drag.current.y);
    drag.current = { x: event.clientX, y: event.clientY };
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <canvas
      ref={canvas}
      className="mat-shaderball"
      width={size}
      height={size}
      role="img"
      aria-label="Preview of the material on a sphere"
      title="Drag to turn"
      onPointerDown={(event) => {
        drag.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    />
  );
}

export function MaterialBuilder({
  asset,
  selectedEntities,
  onBack,
  onClose,
}: {
  asset: MaterialAsset;
  selectedEntities: Entity[];
  onBack: () => void;
  onClose: () => void;
}) {
  const renameMaterialAsset = useEditorStore((state) => state.renameMaterialAsset);
  const applyMaterialAsset = useEditorStore((state) => state.applyMaterialAsset);
  const addMaterialLayer = useEditorStore((state) => state.addMaterialLayer);
  const selectEntities = useEditorStore((state) => state.selectEntities);
  const userIds = useEditorStore(useShallow((state) => usersOfMaterialAsset(state.entities, asset.id).map((entity) => entity.id)));
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const [name, setName] = useState(asset.name);

  // The name follows the asset (an undo, another asset in the same builder) while it isn't being typed.
  useEffect(() => setName(asset.name), [asset.id, asset.name]);

  const targets = selectedEntities.filter(canUseMaterialAsset);
  const applied = targets.length > 0 && targets.every((entity) => entity.materialAssetId === asset.id);

  return (
    <>
      <div className="mat-drawer-header">
        <button type="button" className="mat-icon-btn" title="All materials" aria-label="Back to the material assets" onClick={onBack}>
          <i className="ti ti-arrow-left"></i>
        </button>
        <input
          className="mat-asset-rename"
          type="text"
          value={name}
          aria-label="Material name"
          disabled={isReadOnly}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => {
            renameMaterialAsset(asset.id, name);
            // An empty name isn't taken: show the one it keeps.
            if (!name.trim()) setName(asset.name);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              setName(asset.name);
              event.currentTarget.blur();
            }
          }}
        />
        <button type="button" className="mat-icon-btn" title="Close" aria-label="Close the Material Builder" onClick={onClose}>
          <i className="ti ti-x"></i>
        </button>
      </div>

      <div className="mat-assets-body">
        <Shaderball layers={asset.layers} />

        <button
          type="button"
          className="mat-drawer-btn mat-builder-btn"
          disabled={userIds.length === 0}
          title={userIds.length === 0 ? "No object uses this material yet" : undefined}
          onClick={() => selectEntities(userIds)}
        >
          <i className="ti ti-click"></i>
          Select objects using this material ({userIds.length})
        </button>
        <button
          type="button"
          className="mat-drawer-btn mat-builder-btn"
          disabled={isReadOnly || targets.length === 0 || applied}
          title={applied ? "The selected objects use this material" : targets.length === 0 ? "Select an object to apply this material to" : "Replaces the selected objects' own layers"}
          onClick={() => applyMaterialAsset(asset.id, targets.map((entity) => entity.id))}
        >
          <i className="ti ti-link"></i>
          {applied ? "Applied to the selection" : "Apply to the selected objects"}
        </button>

        <div className="mat-builder-heading">
          <span>Material</span>
          <button
            type="button"
            className="mat-icon-btn"
            title="Add a Color layer (its type can be changed in its row)"
            aria-label="Add a layer"
            disabled={isReadOnly}
            onClick={() => addMaterialLayer(asset.id, "color")}
          >
            <i className="ti ti-plus"></i>
          </button>
        </div>
        <fieldset className="inspector-fieldset" disabled={isReadOnly}>
          <LayerStack owners={[assetOwner(asset)]} />
        </fieldset>
      </div>
    </>
  );
}
