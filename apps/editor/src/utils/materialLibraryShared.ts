/**
 * PURPOSE: What the browser (materialLibrary.ts) and the server (awsLibraryHandler.ts) agree on
 * about the Libre3D material library: the materials every scene can pick from in the Material
 * Assets drawer, kept by Libre3D's developers.
 *
 * No import at all, so the server can load it under Node's ES module loader as it is and its
 * TypeScript project stays free of the editor's types: the browser side names the layer type.
 */

/**
 * The Cognito group whose members may add to and remove from the library. An admin puts a user in
 * it (the user pool's Groups tab); the group is in that user's access token from their next sign-in.
 */
export const LIBRARY_EDITORS_GROUP = "library-editors";

export const MAX_LIBRARY_NAME_LENGTH = 80;
export const MAX_LIBRARY_CATEGORY_LENGTH = 40;
/** What a material without a category is filed under. */
export const DEFAULT_LIBRARY_CATEGORY = "General";

/** One material of the library: a layer stack and its opacity, as a scene's material asset has them. */
export interface LibraryMaterial<Layer = unknown> {
  id: string;
  name: string;
  /** What the drawer's library filter lists it under ("Metal", "Glass", …). */
  category: string;
  layers: Layer[]; // top first
  /** 0-1; none = 1, solid. */
  opacity?: number;
  /** ISO 8601. */
  addedAt: string;
}

/** What a developer sends to add one. */
export type NewLibraryMaterial<Layer = unknown> = Pick<LibraryMaterial<Layer>, "name" | "category" | "layers" | "opacity">;
