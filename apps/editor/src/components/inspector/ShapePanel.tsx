import { useEditorStore, type Entity } from "../../store/useEditorStore";
import { PanelSection } from "../ui/PanelSection";
import { PathField, RangeRow } from "./PathPanel";

interface ShapePanelProps {
  shapes: Entity[]; // the selected shapes and the shapes inside selected groups, at least one
  selectedIds: string[];
}

/**
 * The selected shapes' extrusion and bevel, and Convert to Path (like Spline's Shape panel). An
 * imported SVG selects its group, so the panel acts on the shapes inside selected groups too: one
 * slider extrudes every letter. Several shapes are changed together, in one undo step; a value they
 * don't share reads "Mixed" and the slider shows the first shape's.
 *
 * Convert to Path replaces each shape with a path along the middle of its strokes (one undo step);
 * the path keeps the shape's name, place, material, states and events.
 */
export function ShapePanel({ shapes, selectedIds }: ShapePanelProps) {
  const updateShapeSolids = useEditorStore((state) => state.updateShapeSolids);
  const convertShapesToPaths = useEditorStore((state) => state.convertShapesToPaths);
  const isPlaying = useEditorStore((state) => state.isPreviewMode);

  const ids = shapes.map((shape) => shape.id);
  const extrusions = shapes.map((shape) => shape.extrusion ?? 0);
  const bevels = shapes.map((shape) => shape.bevel ?? 0);
  const isMixed = (values: number[]) => values.some((value) => Math.abs(value - values[0]) > 1e-6);

  const convert = () => {
    if (convertShapesToPaths(selectedIds) === 0) {
      window.alert("No strokes found to convert: the shape is too small or has no area.");
    }
  };

  return (
    <PanelSection title="Shape">
      <PathField label="Extrusion">
        <RangeRow
          label="Extrusion"
          min={0}
          max={1}
          step={0.01}
          value={extrusions[0]}
          mixed={isMixed(extrusions)}
          format={(value) => value.toFixed(2)}
          onChange={(extrusion) => updateShapeSolids(ids, { extrusion })}
        />
      </PathField>
      <PathField label="Bevel">
        <RangeRow
          label="Bevel"
          min={0}
          max={0.1}
          step={0.001}
          value={bevels[0]}
          mixed={isMixed(bevels)}
          format={(value) => value.toFixed(3)}
          onChange={(bevel) => updateShapeSolids(ids, { bevel })}
        />
      </PathField>
      <button
        type="button"
        className="mat-add-btn"
        disabled={isPlaying}
        title="Replace with a tube along the middle of each stroke"
        onClick={convert}
      >
        <i className="ti ti-vector-spline"></i>
        <span>Convert to Path</span>
      </button>
    </PanelSection>
  );
}
