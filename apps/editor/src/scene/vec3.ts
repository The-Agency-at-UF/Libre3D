/**
 * PURPOSE: A position, rotation, or scale as a scene stores it: three numbers.
 *
 * No imports, so the animation runtime and the path math (which stay free of the store, React, and
 * the DOM) can use it too.
 */

export type Vec3 = [number, number, number];

/**
 * A copy that shares nothing with `vector`. Stored vectors are copied on the way in and on the way
 * out, never handed around by reference, so nothing can change a scene behind the store's back.
 */
export const cloneVector = (vector: Vec3): Vec3 => [vector[0], vector[1], vector[2]];
