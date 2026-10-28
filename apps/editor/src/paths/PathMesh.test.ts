import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { PathMesh } from "./PathMesh";
import { createSamplePath, RADIAL_SEGMENTS, type PathStroke } from "./pathGeometry";

const stroke: PathStroke = { radius: 0.1, caps: "round" };
const makePath = (material = new THREE.MeshStandardMaterial()) => new PathMesh(createSamplePath(), stroke, material);
const caps = (mesh: PathMesh) => mesh.children.filter((child): child is THREE.Mesh => child instanceof THREE.Mesh);

describe("PathMesh", () => {
  it("draws the whole tube with a cap at each end", () => {
    const mesh = makePath();
    const index = mesh.geometry.getIndex()!;

    expect(mesh.geometry).toBeInstanceOf(THREE.TubeGeometry);
    expect(mesh.geometry.drawRange.start).toBe(0);
    expect(mesh.geometry.drawRange.count).toBe(index.count);
    expect(caps(mesh).map((cap) => cap.visible)).toEqual([true, true]);
  });

  it("trims with the draw range and moves the caps, without new geometry", () => {
    const mesh = makePath();
    const geometry = mesh.geometry;
    const [startCap, endCap] = caps(mesh);
    const endBefore = endCap.position.clone();

    mesh.setTrim(0, 0.5);

    expect(mesh.geometry).toBe(geometry);
    expect(mesh.geometry.drawRange.start).toBe(0);
    const indicesPerSegment = RADIAL_SEGMENTS * 6;
    const segments = geometry.getIndex()!.count / indicesPerSegment;
    expect(mesh.geometry.drawRange.count).toBe(Math.round(segments / 2) * indicesPerSegment);
    expect(startCap.position.x).toBeCloseTo(-1.2, 3);
    expect(endCap.position.distanceTo(endBefore)).toBeGreaterThan(1); // from the right end to the middle
    expect(endCap.position.length()).toBeLessThan(0.05);
  });

  it("hides both caps when nothing is drawn, and nothing of it can be clicked", () => {
    const mesh = makePath();
    mesh.setTrim(0, 0);

    expect(mesh.geometry.drawRange.count).toBe(0);
    expect(caps(mesh).map((cap) => cap.visible)).toEqual([false, false]);
    expect(mesh.isDrawn).toBe(false);

    const raycaster = new THREE.Raycaster(new THREE.Vector3(-1.2, 0, 5), new THREE.Vector3(0, 0, -1));
    expect(raycaster.intersectObject(mesh, true)).toEqual([]);
  });

  it("can be clicked only where it's drawn", () => {
    const mesh = makePath();
    mesh.setTrim(0, 0.5); // only the first arc, x from -1.2 to 0
    mesh.updateMatrixWorld();
    const hits = (x: number, y: number) =>
      new THREE.Raycaster(new THREE.Vector3(x, y, 5), new THREE.Vector3(0, 0, -1)).intersectObject(mesh, true).length;

    expect(hits(-0.6, 0.6)).toBeGreaterThan(0); // top of the first arc
    expect(hits(0.6, -0.6)).toBe(0); // bottom of the second, trimmed away
  });

  it("rebuilds for a new stroke, keeping its trim and disposing the old geometry", () => {
    const mesh = makePath();
    mesh.setTrim(0.25, 0.75);
    const old = mesh.geometry;
    const oldCap = caps(mesh)[0].geometry;
    const dispose = vi.spyOn(old, "dispose");
    const disposeCap = vi.spyOn(oldCap, "dispose");

    const thicker = { radius: 0.3, caps: "flat" as const };
    mesh.rebuild(mesh.path, thicker);

    expect(dispose).toHaveBeenCalled();
    expect(disposeCap).toHaveBeenCalled();
    expect(mesh.geometry).not.toBe(old);
    expect(mesh.stroke).toBe(thicker);
    expect(mesh.getTrim()).toEqual([0.25, 0.75]);
    expect(mesh.geometry.boundingBox!.max.y).toBeCloseTo(0.6 + 0.3, 2);
    expect(caps(mesh)[0].geometry).toBeInstanceOf(THREE.CircleGeometry);
  });

  it("shares its material with the caps", () => {
    const mesh = makePath();
    mesh.material = new THREE.MeshBasicMaterial();
    mesh.shareMaterialWithCaps();

    expect(caps(mesh).map((cap) => cap.material)).toEqual([mesh.material, mesh.material]);
  });

  it("draws nothing for a path with nothing to draw", () => {
    const mesh = new PathMesh({ points: [], closed: false }, stroke, new THREE.MeshBasicMaterial());

    expect(mesh.isDrawn).toBe(false);
    expect(caps(mesh).map((cap) => cap.visible)).toEqual([false, false]);
    expect(mesh.createTrimmedGeometry()).toBeNull();
  });

  describe("createTrimmedGeometry", () => {
    it("is null when the whole tube is drawn", () => {
      expect(makePath().createTrimmedGeometry()).toBeNull();
    });

    it("keeps only the drawn part of the index, sharing the vertices", () => {
      const mesh = makePath();
      mesh.setTrim(0.5, 1);
      const trimmed = mesh.createTrimmedGeometry()!;
      const { start, count } = mesh.geometry.drawRange;

      expect(trimmed.getIndex()!.count).toBe(count);
      expect(trimmed.getIndex()!.getX(0)).toBe(mesh.geometry.getIndex()!.getX(start));
      expect(trimmed.getAttribute("position")).toBe(mesh.geometry.getAttribute("position"));
    });
  });
});
