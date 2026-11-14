/**
 * PURPOSE: The Material Builder ("Edit Material Asset"): one material asset, edited in the Material
 * Assets drawer (MaterialAssetsDrawer.tsx). Top to bottom: its name; the shaderball (drag to turn
 * it), with "Select objects using this material" in its corner; then a "Material" heading with the
 * material's opacity (every object using it is that see-through) and a "+" that adds a Color layer;
 * and its layer stack (LayerStack.tsx, the rows the Materials panel uses). The × goes back to the
 * list, where a material is applied to the selected objects.
 *
 * INPUT: The asset. OUTPUT: Edits through the store's asset and layer actions; the selection, from
 * "Select objects using this material".
 *
 * The shaderball (viewport/materialPreview.ts) is made when the builder opens, draws only when the
 * material or the view changes, and is disposed when the builder closes.
 */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import { useEditorStore, type MaterialAsset, type MaterialLayer } from "../../store/useEditorStore";
import { assetOpacity, usersOfMaterialAsset } from "../../scene/materialAssets";
import { NumberField } from "../ui/NumberField";
import { MaterialPreview } from "../../viewport/materialPreview";
import { LayerStack } from "./LayerStack";
import { assetOwner } from "./materialRows";

// The shaderball's canvas, in device pixels at up to twice the size it's shown.
const BALL_CSS_SIZE = 124;

function Shaderball({ layers, opacity }: { layers: MaterialLayer[]; opacity: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const preview = useRef<MaterialPreview | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    const made = new MaterialPreview(canvas.current, layers, opacity);
    preview.current = made;
    return () => {
      made.dispose();
      preview.current = null;
    };
    // Made once per builder; later stacks go through setLayers below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    preview.current?.setLayers(layers, opacity);
  }, [layers, opacity]);

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

export function MaterialBuilder({ asset, onBack }: { asset: MaterialAsset; onBack: () => void }) {
  const renameMaterialAsset = useEditorStore((state) => state.renameMaterialAsset);
  const setMaterialAssetOpacity = useEditorStore((state) => state.setMaterialAssetOpacity);
  const addMaterialLayer = useEditorStore((state) => state.addMaterialLayer);
  const selectEntities = useEditorStore((state) => state.selectEntities);
  const userIds = useEditorStore(useShallow((state) => usersOfMaterialAsset(state.entities, asset.id).map((entity) => entity.id)));
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const [name, setName] = useState(asset.name);

  // The name follows the asset (an undo, another asset in the same builder) while it isn't being typed.
  useEffect(() => setName(asset.name), [asset.id, asset.name]);

  return (
    <>
      <div className="mat-drawer-header">
        <span>Edit Material Asset</span>
        <button type="button" className="mat-icon-btn" title="Back to the material assets" aria-label="Close the Material Builder" onClick={onBack}>
          <i className="ti ti-x"></i>
        </button>
      </div>

      <div className="mat-assets-body">
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

        <div className="mat-preview">
          <Shaderball layers={asset.layers} opacity={assetOpacity(asset)} />
          <button
            type="button"
            className="mat-icon-btn mat-preview-select"
            disabled={userIds.length === 0}
            title={userIds.length === 0 ? "No object uses this material yet" : `Select the ${userIds.length === 1 ? "object" : `${userIds.length} objects`} using this material`}
            aria-label="Select objects using this material"
            onClick={() => selectEntities(userIds)}
          >
            <i className="ti ti-drag-drop"></i>
          </button>
        </div>

        <div className="mat-builder-heading">
          <span>Material</span>
          <NumberField
            className="mat-opacity-field"
            label="Material opacity (%)"
            value={Math.round(assetOpacity(asset) * 100)}
            min={0}
            max={100}
            step={1}
            integer
            disabled={isReadOnly}
            onChange={(percent) => setMaterialAssetOpacity(asset.id, percent / 100)}
          />
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
