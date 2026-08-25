# Production Readiness Roadmap

Running backlog of gaps between the current editor and a Spline-level, production-ready tool. Append new items as they surface; check items off once fixed. Not prioritized — reorder as needed.

## Rendering / Viewport

- [ ] **Z-fighting at distance on zoom-out.** `CameraManager` sets a fixed `near: 0.1, far: 1000` (10,000:1 ratio) and `useViewportRenderer` creates the `WebGLRenderer` without `logarithmicDepthBuffer: true`. Depth precision degrades fast with distance in a standard depth buffer, so overlapping/thin geometry (layered cloth, straps, etc.) flickers/clips when zoomed out. Fix: enable `logarithmicDepthBuffer: true` and/or raise `near` off of 0.1.

## Import Pipeline

- [ ] **GLB import creates one editor node per glTF node.** `walkGltfScene` (via `extractModelHierarchy` in `importModel.ts`) DFS-walks every `Object3D` in the parsed scene — bones, empty transform groups, mesh primitives — with no filtering, so a rigged character explodes into hundreds of outliner entries. Spline collapses skinned-mesh rigs instead of exposing bones as separate nodes. Fix: filter/merge non-visual nodes (bones, empty groups) during import, or fold skinned-mesh rigs into a single entity.

