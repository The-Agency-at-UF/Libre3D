/**
 * PURPOSE: Inspector panel for the selected objects' material: their opacity and their layer stack
 * (scene/layerStack.ts), one row per layer, top of the stack first.
 *
 * A row, left to right: the layer's type (a dropdown switches among the colour types), its icon
 * (opens the layer's settings in a drawer beside the sidebar, LayerSettings.tsx; dragging it moves
 * the layer), its opacity, its blend mode, its eye, and ×. The stack's rules decide what can be
 * removed, switched or moved: Lighting can't be removed, and layers over it are drawn unshaded; a
 * layer that paints goes only while another one stays; a layer in Mask mode (purple, with an arrow
 * to the layer it masks) shows that layer only where it's light; an imported model's Image layer
 * stays at the bottom.
 *
 * Several selected objects with the same layers in the same order are edited row by row; with
 * different stacks, their Lighting and top Color layers are.
 */

import { useState, useEffect, useRef, useLayoutEffect, type DragEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEditorStore, type Entity, type ImageLayer, type MaterialLayer as MaterialLayerData, type MaterialLayerType } from "../../store/useEditorStore";
import type { PaintLayerType } from "../../scene/entityFactories";
import { BLEND_MODES, canSwitchLayerType, maskTarget, movableRange, removeBlockedReason, SWITCHABLE_LAYER_TYPES } from "../../scene/layerStack";
import { NumberField } from "../ui/NumberField";
import { PanelSection } from "../ui/PanelSection";
import { ColorSettings, DepthSettings, FresnelSettings, GradientSettings, ImageSettings, LightingSettings, MatcapSettings, NoiseSettings, NormalSettings } from "./LayerSettings";
import {
  asOneUndoStep,
  BLEND_MODE_ICONS,
  BLEND_MODE_NAMES,
  LAYER_TYPE_ICONS,
  LAYER_TYPE_NAMES,
  liveDepthReach,
  rowsFor,
  rowTitle,
  type LayerRowData,
} from "./materialRows";

// A small menu under a row control: a list of choices, the current one marked. Closes on a choice,
// a click outside it, or Escape.
function RowMenu<T extends string>({
  label,
  trigger,
  triggerClassName,
  title,
  disabled,
  options,
  value,
  onSelect,
}: {
  label: string;
  trigger: ReactNode;
  triggerClassName: string;
  title: string;
  disabled?: boolean;
  options: { value: T; label: string; icon?: string; disabled?: boolean }[];
  value: T | null;
  onSelect: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="mat-row-menu" ref={root}>
      <button
        type="button"
        className={triggerClassName}
        title={title}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((was) => !was)}
      >
        {trigger}
      </button>
      {open && (
        <div className="mat-row-menu-popover" role="menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              className={`mat-row-menu-item ${option.value === value ? "on" : ""}`}
              disabled={option.disabled}
              onClick={() => {
                setOpen(false);
                if (option.value !== value) onSelect(option.value);
              }}
            >
              {option.icon && <i className={`ti ${option.icon}`}></i>}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rows ────────────────────────────────────────────────────────────────────

function LayerRow({
  row,
  drawerOpen,
  onToggleDrawer,
  draggable,
  dropEdge,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  row: LayerRowData;
  drawerOpen: boolean;
  onToggleDrawer: (element: HTMLElement) => void;
  draggable: boolean;
  dropEdge: "above" | "below" | null;
  onDragStart: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const updateMultipleEntityMaterialLayers = useEditorStore((state) => state.updateMultipleEntityMaterialLayers);
  const removeMaterialLayer = useEditorStore((state) => state.removeMaterialLayer);
  const switchMaterialLayerType = useEditorStore((state) => state.switchMaterialLayerType);
  const rowRef = useRef<HTMLDivElement>(null);

  const first = row.pairs[0].layer;
  const isImage = row.type === "image";
  const isLighting = row.type === "lighting";
  const mixed = (read: (layer: MaterialLayerData) => unknown) => row.pairs.some(({ layer }) => read(layer) !== read(first));

  const update = (updates: Partial<MaterialLayerData>) =>
    updateMultipleEntityMaterialLayers(
      Object.fromEntries(row.pairs.map(({ entity, layer }) => [entity.id, { layerId: layer.id, updates }])),
    );

  const blocked = row.pairs.map(({ entity, layer }) => removeBlockedReason(entity.materialLayers!, layer)).find((reason) => reason !== null);
  const canSwitchTo = (type: MaterialLayerType) => row.pairs.every(({ entity, layer }) => canSwitchLayerType(entity.materialLayers!, layer, type));
  const switchable = SWITCHABLE_LAYER_TYPES.includes(row.type);
  const enabled = !mixed((layer) => layer.enabled) ? first.enabled : true;
  const name = rowTitle(row);
  // In Mask mode: it masks the layer under it, or nothing (under it is Lighting, a mask, or nothing).
  const masking = first.mask
    ? row.pairs.every(({ entity, layer }) => maskTarget(entity.materialLayers!, entity.materialLayers!.indexOf(layer)) !== null)
      ? "mask"
      : "mask idle"
    : "";

  return (
    <div
      ref={rowRef}
      className={`mat-row ${masking} ${drawerOpen ? "open" : ""} ${enabled ? "" : "off"} ${dropEdge ? `drop-${dropEdge}` : ""}`}
      title={masking === "mask" ? "Mask: shows the layer under it where it's light" : masking ? "This mask has nothing to mask: put a colour layer right under it" : undefined}
      data-layer-type={row.type}
      onDragOver={onDragOver}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    >
      {switchable ? (
        <RowMenu
          label={`${name} layer type`}
          title="Change the layer's type"
          triggerClassName="mat-row-type"
          trigger={
            <>
              {masking && <i className="ti ti-corner-left-down mat-row-mask-arrow" aria-label="Mask"></i>}
              <span className="mat-row-name">{name}</span>
              <i className="ti ti-chevron-down"></i>
            </>
          }
          value={row.type}
          options={SWITCHABLE_LAYER_TYPES.map((type) => ({
            value: type,
            label: LAYER_TYPE_NAMES[type],
            icon: LAYER_TYPE_ICONS[type],
            disabled: !canSwitchTo(type),
          }))}
          onSelect={(type) =>
            asOneUndoStep(
              row.pairs.map(({ entity, layer }) => () =>
                switchMaterialLayerType(entity.id, layer.id, type as PaintLayerType, type === "depth" ? liveDepthReach(entity.id) : undefined),
              ),
            )
          }
        />
      ) : (
        <span className="mat-row-type static" title={isImage ? "Comes with the imported model" : undefined}>
          <span className="mat-row-name">{name}</span>
        </span>
      )}

      <button
        type="button"
        className={`mat-icon-btn mat-row-icon ${drawerOpen ? "on" : ""}`}
        title={draggable ? `${name} settings (drag to move the layer)` : `${name} settings`}
        aria-label={`${name} settings`}
        aria-expanded={drawerOpen}
        draggable={draggable}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", first.id);
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        onClick={() => rowRef.current && onToggleDrawer(rowRef.current)}
      >
        <i className={`ti ${LAYER_TYPE_ICONS[row.type]}`}></i>
      </button>

      <NumberField
        className="mat-row-opacity"
        label={`${name} opacity (%)`}
        value={isImage ? 100 : mixed((layer) => layer.opacity) ? null : Math.round(first.opacity * 100)}
        min={0}
        max={100}
        step={1}
        integer
        disabled={isImage}
        onChange={(percent) => update({ opacity: percent / 100 })}
      />

      <RowMenu
        label={`${name} blend mode`}
        title={isLighting ? "Lighting shades the layers under it; the ones over it are drawn as they are" : isImage ? "Comes with the imported model" : `Blend mode: ${mixed((layer) => layer.blendMode) ? "mixed" : BLEND_MODE_NAMES[first.blendMode]}`}
        triggerClassName="mat-icon-btn"
        trigger={<i className={`ti ${mixed((layer) => layer.blendMode) ? "ti-blend-mode" : BLEND_MODE_ICONS[first.blendMode]}`}></i>}
        disabled={isLighting || isImage}
        value={mixed((layer) => layer.blendMode) ? null : first.blendMode}
        options={BLEND_MODES.map((mode) => ({ value: mode, label: BLEND_MODE_NAMES[mode], icon: BLEND_MODE_ICONS[mode] }))}
        onSelect={(blendMode) => update({ blendMode })}
      />

      <button
        type="button"
        className="mat-icon-btn"
        title={enabled ? `Hide the ${name} layer` : `Show the ${name} layer`}
        aria-label={`${name} layer visible`}
        aria-pressed={enabled}
        onClick={() => update({ enabled: !enabled })}
      >
        <i className={`ti ${enabled ? "ti-eye" : "ti-eye-off"}`}></i>
      </button>

      <button
        type="button"
        className="mat-icon-btn"
        disabled={!!blocked}
        title={blocked ?? `Remove the ${name} layer`}
        aria-label={`Remove the ${name} layer`}
        onClick={() => asOneUndoStep(row.pairs.map(({ entity, layer }) => () => removeMaterialLayer(entity.id, layer.id)))}
      >
        <i className="ti ti-x"></i>
      </button>
    </div>
  );
}

/**
 * A layer's settings, in a drawer beside the right sidebar at its row's height. It stays open while
 * the viewport is used (a Depth layer is edited there too) and closes from its icon, its ×, Escape,
 * or when its layer goes.
 */
function LayerDrawer({ row, anchor, onClose }: { row: LayerRowData; anchor: HTMLElement; onClose: () => void }) {
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const drawer = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; right: number } | null>(null);

  useLayoutEffect(() => {
    const placeIt = () => {
      const sidebar = anchor.closest(".right-sidebar") ?? anchor;
      const sidebarRect = sidebar.getBoundingClientRect();
      const rowRect = anchor.getBoundingClientRect();
      const height = drawer.current?.offsetHeight ?? 0;
      const top = Math.max(8, Math.min(rowRect.top, window.innerHeight - height - 8));
      setPlace({ top, right: window.innerWidth - sidebarRect.left + 8 });
    };
    placeIt();
    window.addEventListener("resize", placeIt);
    const scroller = anchor.closest(".panel-body");
    scroller?.addEventListener("scroll", placeIt);
    return () => {
      window.removeEventListener("resize", placeIt);
      scroller?.removeEventListener("scroll", placeIt);
    };
  }, [anchor, row.key, row.type]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const name = rowTitle(row);

  return createPortal(
    <div
      ref={drawer}
      className="mat-drawer"
      role="dialog"
      aria-label={`${name} settings`}
      style={place ? { top: place.top, right: place.right } : { visibility: "hidden" }}
    >
      <div className="mat-drawer-header">
        <i className={`ti ${LAYER_TYPE_ICONS[row.type]}`}></i>
        <span>{name}</span>
        <button type="button" className="mat-icon-btn" title="Close" aria-label="Close the layer settings" onClick={onClose}>
          <i className="ti ti-x"></i>
        </button>
      </div>
      <fieldset className="mat-drawer-body inspector-fieldset" disabled={isReadOnly}>
        {row.type === "color" && <ColorSettings row={row} />}
        {row.type === "lighting" && <LightingSettings row={row} />}
        {row.type === "depth" && <DepthSettings row={row} />}
        {row.type === "gradient" && <GradientSettings row={row} />}
        {row.type === "noise" && <NoiseSettings row={row} />}
        {row.type === "fresnel" && <FresnelSettings row={row} />}
        {row.type === "normal" && <NormalSettings row={row} />}
        {row.type === "matcap" && <MatcapSettings row={row} />}
        {row.type === "image" && <ImageSettings row={row} />}
      </fieldset>
    </div>,
    document.body,
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

interface MaterialsPanelProps {
  selectedEntities: Entity[];
}

export function MaterialsPanel({ selectedEntities: allSelectedEntities }: MaterialsPanelProps) {
  const addMaterialLayer = useEditorStore((state) => state.addMaterialLayer);
  const moveMaterialLayer = useEditorStore((state) => state.moveMaterialLayer);
  const setEntityOpacity = useEditorStore((state) => state.setEntityOpacity);
  const isReadOnly = useEditorStore((state) => state.readOnlyReason !== null);
  const [drawer, setDrawer] = useState<{ key: string; anchor: HTMLElement } | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<{ index: number; edge: "above" | "below" } | null>(null);

  // Imported meshes carry derived materialLayers too: only the stack existing matters. Directional
  // lights (no material) and import nodes still awaiting their layers are left out.
  const selectedEntities = allSelectedEntities.filter((e) => e.type !== "directionalLight" && e.materialLayers);
  const rows = selectedEntities.length > 0 ? rowsFor(selectedEntities) : [];
  const openRow = drawer ? rows.find((row) => row.key === drawer.key) : undefined;

  // A drawer whose layer went (removed, undone, another selection) closes.
  useEffect(() => {
    if (drawer && !openRow) setDrawer(null);
  }, [drawer, openRow]);

  if (selectedEntities.length === 0) return null;

  // Rows move one object's stack (or several identical ones, as one undo step).
  const [min, max] = movableRange(selectedEntities[0].materialLayers!);
  const canMove = (row: LayerRowData) => !isReadOnly && row.index !== null && row.index >= min && row.index <= max;

  const opacities = selectedEntities.map((entity) => entity.opacity ?? 1);
  const opacityMixed = opacities.some((opacity) => opacity !== opacities[0]);

  const finishDrag = () => {
    setDragging(null);
    setDropAt(null);
  };

  const drop = () => {
    if (dragging === null || !dropAt) return finishDrag();
    // Where the dragged layer lands in the stack once it's taken out of its old place.
    let to = dropAt.edge === "above" ? dropAt.index : dropAt.index + 1;
    if (dragging < to) to -= 1;
    const moves = selectedEntities.map((entity) => () => moveMaterialLayer(entity.id, entity.materialLayers![dragging].id, to));
    finishDrag();
    asOneUndoStep(moves);
  };

  return (
    <PanelSection
      title="Materials"
      defaultOpen={true}
      action={
        <button
          type="button"
          className="mat-icon-btn"
          title="Add a Color layer (its type can be changed in its row)"
          aria-label="Add a layer"
          disabled={isReadOnly}
          onClick={() => asOneUndoStep(selectedEntities.map((entity) => () => addMaterialLayer(entity.id, "color")))}
        >
          <i className="ti ti-plus"></i>
        </button>
      }
    >
      <div className="material-layer-stack">
        <div className="prop mat-object-opacity">
          <span className="prop-label">Opacity</span>
          <NumberField
            label="Object opacity (%)"
            value={opacityMixed ? null : Math.round(opacities[0] * 100)}
            min={0}
            max={100}
            step={1}
            integer
            onChange={(percent) => setEntityOpacity(Object.fromEntries(selectedEntities.map((entity) => [entity.id, percent / 100])))}
          />
        </div>

        <div className="mat-rows" onDragLeave={(event) => !event.currentTarget.contains(event.relatedTarget as Node) && setDropAt(null)}>
          {rows.map((row) => (
            <LayerRow
              key={row.key}
              row={row}
              drawerOpen={drawer?.key === row.key}
              onToggleDrawer={(anchor) => setDrawer((open) => (open?.key === row.key ? null : { key: row.key, anchor }))}
              draggable={canMove(row)}
              dropEdge={dragging !== null && dropAt?.index === row.index ? dropAt.edge : null}
              onDragStart={() => setDragging(row.index)}
              onDragOver={(event) => {
                if (dragging === null || row.index === null) return;
                const rect = event.currentTarget.getBoundingClientRect();
                let edge: "above" | "below" = event.clientY < rect.top + rect.height / 2 ? "above" : "below";
                // Nothing lands above Lighting or below the Image layers.
                if (row.index < min) edge = "below";
                if (row.index > max) edge = "above";
                if (row.index < min - 1 || row.index > max + 1) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (dropAt?.index !== row.index || dropAt.edge !== edge) setDropAt({ index: row.index, edge });
              }}
              onDrop={drop}
              onDragEnd={finishDrag}
            />
          ))}
        </div>
      </div>

      {drawer && openRow && <LayerDrawer key={openRow.key} row={openRow} anchor={drawer.anchor} onClose={() => setDrawer(null)} />}
    </PanelSection>
  );
}
