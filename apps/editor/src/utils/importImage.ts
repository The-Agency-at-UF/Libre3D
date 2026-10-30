import { showAlert } from "../components/ui/Dialog";
import { useEditorStore } from "../store/useEditorStore";
import { hasTransparentPixels } from "./imagePlane";
import { MAX_ASSET_BYTES, hashAsset } from "./sceneAssets";
import { saveTextureAsset } from "./textureAssetStore";

const IMAGE_EXTENSION = /\.(png|jpe?g)$/i;

export const isImageFile = (file: File): boolean => IMAGE_EXTENSION.test(file.name);

// Finding see-through pixels reads every pixel, so a bigger picture is read scaled down to about this
// many (4096 × 4096), which still finds any transparent area worth blending for.
const MAX_SCANNED_PIXELS = 4096 * 4096;

function hasTransparency(bitmap: ImageBitmap): boolean {
  const scale = Math.min(1, Math.sqrt(MAX_SCANNED_PIXELS / (bitmap.width * bitmap.height)));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const context = new OffscreenCanvas(width, height).getContext("2d");
  if (!context) return false;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  return hasTransparentPixels(context.getImageData(0, 0, width, height).data);
}

// The single entry point for importing a .png, .jpg or .jpeg: stores the file as it is under its content
// hash (the texture's ID here and in the cloud, see sceneAssets.ts) and adds a plane showing it
// (utils/imagePlane.ts), named after the file, in one undo step. Says so when the picture is too large
// or can't be read.
export async function importImageFile(file: File): Promise<void> {
  // View only and Play are for looking: the store would drop the plane anyway, so don't store the picture.
  const { readOnlyReason, isPreviewMode } = useEditorStore.getState();
  if (readOnlyReason || isPreviewMode) return;

  // Anything bigger couldn't be uploaded with the scene.
  if (file.size > MAX_ASSET_BYTES) {
    void showAlert(`This image is too large to import. Images can be up to ${MAX_ASSET_BYTES / (1024 * 1024)} MB.`);
    throw new Error(`Image too large to import: ${file.size} bytes.`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (error) {
    void showAlert("This image couldn't be read.");
    throw error;
  }
  const aspect = bitmap.width / bitmap.height;
  const transparent = hasTransparency(bitmap);
  bitmap.close();

  const textureAssetId = await hashAsset(file);
  await saveTextureAsset(textureAssetId, file);
  useEditorStore.getState().addImagePlane(file.name.replace(IMAGE_EXTENSION, ""), textureAssetId, aspect, transparent);
}
