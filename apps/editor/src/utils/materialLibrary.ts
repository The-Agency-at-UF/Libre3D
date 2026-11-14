/**
 * PURPOSE: The browser side of the Libre3D material library (`/api/library/materials`, server in
 * awsLibraryHandler.ts): the materials every scene can pick from in the Material Assets drawer.
 *
 * Reading is public and needs no sign-in (guests at `/try` see the library too). Adding and
 * removing go through `apiFetch` and only work for a signed-in Libre3D developer; the server
 * decides that, `canEditMaterialLibrary` only decides whether the controls are shown.
 *
 * No store and no Three.js import.
 */

import { apiFetch } from "./apiFetch";
import type { MaterialLayer } from "../scene/types";
import type { AuthSnapshot } from "./authSession";
import { LIBRARY_EDITORS_GROUP, type LibraryMaterial as StoredMaterial, type NewLibraryMaterial as NewStoredMaterial } from "./materialLibraryShared";

export type LibraryMaterial = StoredMaterial<MaterialLayer>;
export type NewLibraryMaterial = NewStoredMaterial<MaterialLayer>;

const ENDPOINT = "/api/library/materials";

const readJson = async <T>(response: Response, fallback: string): Promise<T> => {
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? fallback);
  return body;
};

/** Whether to show the controls that add to and remove from the library. */
export const canEditMaterialLibrary = (auth: AuthSnapshot): boolean => auth.status === "signedIn" && auth.groups.includes(LIBRARY_EDITORS_GROUP);

export const listLibraryMaterials = async (): Promise<LibraryMaterial[]> => {
  const body = await readJson<{ materials?: LibraryMaterial[] }>(await fetch(ENDPOINT), "Could not load the material library.");
  return Array.isArray(body.materials) ? body.materials : [];
};

export const addLibraryMaterial = async (material: NewLibraryMaterial): Promise<LibraryMaterial> => {
  const response = await apiFetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(material) });
  return (await readJson<{ material: LibraryMaterial }>(response, "Could not add the material to the library.")).material;
};

export const removeLibraryMaterial = async (id: string): Promise<void> => {
  const response = await apiFetch(ENDPOINT, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  await readJson(response, "Could not remove the material from the library.");
};

/** The library's categories, each once, A to Z. */
export const libraryCategories = (materials: LibraryMaterial[]): string[] => [...new Set(materials.map((material) => material.category))].sort((a, b) => a.localeCompare(b));
