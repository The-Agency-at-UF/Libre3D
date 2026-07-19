import { saveModelAsset } from "./modelAssetStore";

const createAssetId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export async function importModelFile(file: File): Promise<{ assetId: string; name: string }> {
  if (!/\.glb$/i.test(file.name)) {
    window.alert("Only .glb files are supported for import.");
    throw new Error("Unsupported file type: only .glb files are supported for import.");
  }

  const buffer = await file.arrayBuffer();
  const assetId = createAssetId();
  await saveModelAsset(assetId, buffer);

  return { assetId, name: file.name.replace(/\.glb$/i, "") };
}
