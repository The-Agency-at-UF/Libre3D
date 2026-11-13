/**
 * PURPOSE: What the layer drawers share for pictures: the pictures the scene already uses, a
 * picture's thumbnail from the texture store, the frame with its Upload button, and the grid to
 * pick one of the scene's pictures from.
 */

import { useEffect, useRef, useState } from "react";
import { useEditorStore, type Entity, type TextureRef } from "../../../store/useEditorStore";
import { loadTextureForScene } from "../../../utils/assetTransfers";
import { importMapFile } from "../../../utils/importImage";

// The pictures objects in the scene use (Image layers and Lighting maps), each once, named for the
// map dropdowns: by its own name (an upload's file name), else the object it's on.
export const scenePictures = (entities: Entity[]): Array<TextureRef & { name: string }> => {
  const pictures = new Map<string, TextureRef & { name: string }>();
  for (const entity of entities) {
    for (const layer of entity.materialLayers ?? []) {
      if (layer.type === "image" && !pictures.has(layer.textureAssetId)) {
        pictures.set(layer.textureAssetId, { textureAssetId: layer.textureAssetId, wrapS: layer.wrapS, wrapT: layer.wrapT, flipY: layer.flipY, name: layer.name ?? entity.name });
      }
      if (layer.type !== "lighting") continue;
      for (const [slot, ref] of Object.entries(layer.maps ?? {})) {
        if (ref && !pictures.has(ref.textureAssetId)) pictures.set(ref.textureAssetId, { ...ref, name: ref.name ?? `${entity.name} (${slot})` });
      }
    }
  }
  return [...pictures.values()];
};

// A picture from the texture store as an object URL, for a thumbnail, while it shows; null while it
// loads (or when it can't be had).
function usePictureUrl(textureAssetId: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    setUrl(null);
    if (!textureAssetId) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    loadTextureForScene(textureAssetId)
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        /* a thumbnail is best-effort; a missing picture just shows the empty frame */
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [textureAssetId]);
  return url;
}

/** A picture's frame: its thumbnail, with an Upload button over it (a PNG or JPEG from the computer). */
export function PictureFrame({ textureAssetId, label, onUpload }: { textureAssetId: string; label: string; onUpload: (ref: TextureRef) => void }) {
  const url = usePictureUrl(textureAssetId);
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="mat-picture-frame" style={{ backgroundImage: url ? `url(${url})` : undefined }}>
      <button type="button" className="mat-picture-upload" onClick={() => file.current?.click()}>
        {label}
      </button>
      <input
        ref={file}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        hidden
        aria-label={label}
        onChange={(event) => {
          const picked = event.target.files?.[0];
          event.target.value = "";
          if (picked) void importMapFile(picked).then((ref) => ref && onUpload(ref));
        }}
      />
    </div>
  );
}

/** The scene's pictures as thumbnails to pick from (a picture drawer's Assets tab). */
export function PictureGrid({ current, onPick }: { current: string; onPick: (picture: TextureRef & { name: string }) => void }) {
  const entities = useEditorStore((state) => state.entities);
  const pictures = scenePictures(entities);
  if (pictures.length === 0) return <p className="mat-drawer-note">No pictures in the scene yet: upload one under Custom.</p>;
  return (
    <div className="mat-picture-grid">
      {pictures.map((picture) => (
        <PictureChoice key={picture.textureAssetId} picture={picture} on={picture.textureAssetId === current} onPick={() => onPick(picture)} />
      ))}
    </div>
  );
}

function PictureChoice({ picture, on, onPick }: { picture: TextureRef & { name: string }; on: boolean; onPick: () => void }) {
  const url = usePictureUrl(picture.textureAssetId);
  return (
    <button
      type="button"
      className={`mat-picture-choice ${on ? "on" : ""}`}
      title={picture.name}
      aria-label={picture.name}
      aria-pressed={on}
      style={{ backgroundImage: url ? `url(${url})` : undefined }}
      onClick={onPick}
    />
  );
}
