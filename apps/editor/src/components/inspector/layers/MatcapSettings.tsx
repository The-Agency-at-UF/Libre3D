import { useState } from "react";
import type { MatcapLayer } from "../../../store/useEditorStore";
import { MATCAP_PRESETS, matcapPixels } from "../../../viewport/matcaps";
import { useRowUpdate, type LayerRowData } from "../materialRows";
import { PictureFrame } from "./pictures";
import { DrawerTabs, ModeRow, NumberRow } from "./rows";

// Each matcap preset's thumbnail, drawn once (viewport/matcaps.ts gives its pixels bottom row first).
const matcapThumbnails = new Map<string, string>();
const matcapThumbnail = (id: string): string => {
  let url = matcapThumbnails.get(id);
  if (!url) {
    const size = 96;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const pixels = matcapPixels(id, size);
    const image = new ImageData(size, size);
    for (let row = 0; row < size; row++) image.data.set(pixels.subarray(row * size * 4, (row + 1) * size * 4), (size - 1 - row) * size * 4);
    canvas.getContext("2d")?.putImageData(image, 0, 0);
    url = canvas.toDataURL();
    matcapThumbnails.set(id, url);
  }
  return url;
};

// A Matcap layer, as Spline's drawer: Assets (Libre3D's own matcaps) or Custom (a picture of the
// person's own, uploaded; on /try it stays in the browser), Rotation, and Mode.
export function MatcapSettings({ row }: { row: LayerRowData }) {
  const update = useRowUpdate(row);
  const layer = row.pairs[0].layer as MatcapLayer;
  const [tab, setTab] = useState<"custom" | "assets">(layer.textureAssetId ? "custom" : "assets");
  return (
    <>
      <DrawerTabs
        tabs={[
          { value: "custom", label: "Custom" },
          { value: "assets", label: "Assets" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <NumberRow label="Rotation" value={layer.rotation} step={1} onChange={(rotation) => update({ rotation })} />
      <ModeRow row={row} />
      {tab === "custom" ? (
        <PictureFrame
          textureAssetId={layer.textureAssetId ?? ""}
          label="Upload Image"
          onUpload={(picture) => update({ textureAssetId: picture.textureAssetId, name: picture.name } as Partial<MatcapLayer>)}
        />
      ) : (
        <div className="mat-picture-grid">
          {Object.entries(MATCAP_PRESETS).map(([id, look]) => {
            const on = !layer.textureAssetId && layer.preset === id;
            return (
              <button
                key={id}
                type="button"
                className={`mat-picture-choice round ${on ? "on" : ""}`}
                title={look.name}
                aria-label={look.name}
                aria-pressed={on}
                style={{ backgroundImage: `url(${matcapThumbnail(id)})` }}
                onClick={() => update({ preset: id, textureAssetId: undefined, name: undefined } as Partial<MatcapLayer>)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
