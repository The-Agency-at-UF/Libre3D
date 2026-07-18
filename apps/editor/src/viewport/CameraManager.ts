import * as THREE from "three";
import { type EditorState } from "../store/useEditorStore";

export class CameraManager {
  public perspectiveCamera: THREE.PerspectiveCamera;
  public orthographicCamera: THREE.OrthographicCamera;
  public activeCamera: THREE.Camera;
  private orthoSize: number = 5;

  constructor(
    initialProfile: EditorState["cameraProfiles"][string],
    initialMode: "perspective" | "orthographic",
    aspect: number
  ) {
    this.perspectiveCamera = new THREE.PerspectiveCamera(initialProfile.fov, aspect, initialProfile.near, initialProfile.far);
    this.perspectiveCamera.position.set(...initialProfile.position);

    this.orthographicCamera = new THREE.OrthographicCamera(
      -this.orthoSize * aspect,
      this.orthoSize * aspect,
      this.orthoSize,
      -this.orthoSize,
      initialProfile.near,
      initialProfile.far
    );
    this.orthographicCamera.zoom = initialProfile.zoom;
    this.orthographicCamera.position.set(...initialProfile.position);

    this.activeCamera = initialMode === "perspective" ? this.perspectiveCamera : this.orthographicCamera;
  }

  public updateAspect(width: number, height: number) {
    const aspect = width / height;

    this.perspectiveCamera.aspect = aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    this.orthographicCamera.left = -this.orthoSize * aspect;
    this.orthographicCamera.right = this.orthoSize * aspect;
    this.orthographicCamera.top = this.orthoSize;
    this.orthographicCamera.bottom = -this.orthoSize;
    this.orthographicCamera.updateProjectionMatrix();
  }

  public setActiveMode(mode: "perspective" | "orthographic") {
    this.activeCamera = mode === "perspective" ? this.perspectiveCamera : this.orthographicCamera;
  }

  public syncWithProfile(profile: EditorState["cameraProfiles"][string], orbitControlsTarget: THREE.Vector3) {
    const [px, py, pz] = profile.position;

    this.perspectiveCamera.position.set(px, py, pz);
    this.perspectiveCamera.fov = profile.fov;
    this.perspectiveCamera.near = profile.near;
    this.perspectiveCamera.far = profile.far;
    this.perspectiveCamera.updateProjectionMatrix();

    this.orthographicCamera.position.set(px, py, pz);
    this.orthographicCamera.zoom = profile.zoom;
    this.orthographicCamera.near = profile.near;
    this.orthographicCamera.far = profile.far;
    this.orthographicCamera.updateProjectionMatrix();

    const [tx, ty, tz] = profile.target;
    orbitControlsTarget.set(tx, ty, tz);
  }
}
