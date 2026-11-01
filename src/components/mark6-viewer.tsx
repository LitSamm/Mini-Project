"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { Material, Object3D, Texture } from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type ViewerStatus = "idle" | "loading" | "ready" | "error";

function disposeModel(model: Object3D) {
  model.traverse((object) => {
    const mesh = object as Object3D & {
      geometry?: { dispose: () => void };
      material?: Material | Material[];
    };

    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    materials.forEach((material) => {
      const maps = material as Material & {
        map?: Texture | null;
        normalMap?: Texture | null;
        roughnessMap?: Texture | null;
        metalnessMap?: Texture | null;
        aoMap?: Texture | null;
        emissiveMap?: Texture | null;
        bumpMap?: Texture | null;
        alphaMap?: Texture | null;
        lightMap?: Texture | null;
        displacementMap?: Texture | null;
        specularMap?: Texture | null;
        envMap?: Texture | null;
      };
      [
        maps.map,
        maps.normalMap,
        maps.roughnessMap,
        maps.metalnessMap,
        maps.aoMap,
        maps.emissiveMap,
        maps.bumpMap,
        maps.alphaMap,
        maps.lightMap,
        maps.displacementMap,
        maps.specularMap,
        maps.envMap,
      ].forEach((texture) => texture?.dispose());
      material.dispose();
    });
  });
}

export default function Mark6Viewer() {
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [status, setStatus] = useState<ViewerStatus>("idle");
  const [autoRotate, setAutoRotate] = useState(false);

  useEffect(() => {
    const initialStage = stageRef.current;
    if (!initialStage) return;

    let cancelled = false;
    let requested = false;
    let inViewport = false;
    let frame = 0;
    let resumeRendering: (() => void) | null = null;
    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let resizeObserver: ResizeObserver | null = null;

    async function initializeViewer() {
      if (requested) {
        resumeRendering?.();
        return;
      }
      requested = true;
      setStatus("loading");

      try {
        const [THREE, { FBXLoader }, { OrbitControls: Controls }] =
          await Promise.all([
            import("three"),
            import("three/examples/jsm/loaders/FBXLoader.js"),
            import("three/examples/jsm/controls/OrbitControls.js"),
          ]);

        if (cancelled) return;

        const activeScene = new THREE.Scene();
        scene = activeScene;
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
        const cameraDirection = new THREE.Vector3();
        let baseCameraDistance = 0;
        let activeCameraDistance = 0;
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.domElement.className = "mark6-canvas";
        renderer.domElement.setAttribute("aria-hidden", "true");
        const stage = stageRef.current;
        if (cancelled || !stage) {
          renderer.dispose();
          renderer = null;
          return;
        }
        stage.appendChild(renderer.domElement);

        activeScene.add(new THREE.HemisphereLight(0xe4f7ed, 0x101713, 2.1));

        const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
        keyLight.position.set(-4, 7, 5);
        activeScene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x43d6a0, 2.3);
        rimLight.position.set(5, 3, -5);
        activeScene.add(rimLight);

        const floor = new THREE.Mesh(
          new THREE.CircleGeometry(3.5, 96),
          new THREE.MeshBasicMaterial({
            color: 0x10231b,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
          }),
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.025;
        activeScene.add(floor);

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(3.48, 3.51, 128),
          new THREE.MeshBasicMaterial({
            color: 0x39d6a0,
            transparent: true,
            opacity: 0.34,
            side: THREE.DoubleSide,
          }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -0.018;
        activeScene.add(ring);

        const controls = new Controls(camera, renderer.domElement);
        controlsRef.current = controls;
        controls.enableDamping = true;
        controls.dampingFactor = 0.065;
        controls.enablePan = false;
        controls.rotateSpeed = 0.55;
        controls.zoomSpeed = 0.8;
        controls.minDistance = 3.5;
        controls.maxDistance = 12;
        controls.minPolarAngle = 0.72;
        controls.maxPolarAngle = 1.48;
        controls.autoRotate = false;

        const resize = () => {
          if (cancelled) return;
          const stage = stageRef.current;
          if (!stage) return;
          const { width, height } = stage.getBoundingClientRect();
          if (width <= 0 || height <= 0 || !renderer) return;

          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          if (baseCameraDistance > 0) {
            const zoomRatio =
              activeCameraDistance > 0
                ? camera.position.distanceTo(controls.target) /
                  activeCameraDistance
                : 1;
            cameraDirection
              .copy(camera.position)
              .sub(controls.target)
              .normalize();
            activeCameraDistance =
              baseCameraDistance * Math.max(1, 1.3 / camera.aspect);
            camera.position
              .copy(controls.target)
              .addScaledVector(
                cameraDirection,
                activeCameraDistance * zoomRatio,
              );
            camera.lookAt(controls.target);
            controls.update();
            controls.saveState();
          }
        };

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(stage);
        resize();

        const render = () => {
          if (cancelled || !inViewport || !renderer) return;
          frame = window.requestAnimationFrame(render);
          controls.update();
          renderer.render(activeScene, camera);
        };

        const startRendering = () => {
          if (frame === 0 && inViewport) {
            frame = window.requestAnimationFrame(render);
          }
        };
        resumeRendering = startRendering;

        const manager = new THREE.LoadingManager();
        const suppliedTextures: Record<string, string> = {
          "image_0.jpg": "/models/mark-6/Texture 1.png",
          "image_2.jpg": "/models/mark-6/Texture 3.png",
          "texture_0_metallic.png": "/models/mark-6/Texture 2.png",
          "texture_0_roughness.png": "/models/mark-6/Texture 4.png",
        };
        manager.setURLModifier((url) => {
          const filename = decodeURIComponent(url.replaceAll("\\", "/"))
            .split("/")
            .pop()
            ?.toLowerCase();
          return (filename && suppliedTextures[filename]) || url;
        });
        manager.onError = (url) => {
          console.error(`Unable to load a Mark 6 texture: ${url}`);
          if (!cancelled) setStatus("error");
        };

        const loader = new FBXLoader(manager);
        loader.load(
          "/models/mark-6/mark-6.fbx",
          (loadedModel) => {
            if (cancelled) {
              disposeModel(loadedModel);
              return;
            }

            try {
              const bounds = new THREE.Box3().setFromObject(loadedModel);
              const size = bounds.getSize(new THREE.Vector3());
              const center = bounds.getCenter(new THREE.Vector3());
              const longestSide = Math.max(size.x, size.y, size.z);

              if (!Number.isFinite(longestSide) || longestSide <= 0) {
                throw new Error("The Mark 6 FBX has no measurable geometry.");
              }

              const scale = 4.7 / longestSide;
              loadedModel.scale.setScalar(scale);
              loadedModel.position.set(
                -center.x * scale,
                -bounds.min.y * scale,
                -center.z * scale,
              );
              loadedModel.rotation.y = Math.PI / 2;
              activeScene.add(loadedModel);

              const modelHeight = size.y * scale;
              controls.target.set(0, modelHeight * 0.43, 0);
              camera.position.set(3.1, modelHeight * 0.72 + 0.6, 4.1);
              baseCameraDistance = camera.position.distanceTo(controls.target);
              activeCameraDistance = baseCameraDistance;
              cameraDirection
                .copy(camera.position)
                .sub(controls.target)
                .normalize();
              camera.lookAt(controls.target);
              controls.update();
              resize();
              controls.saveState();
              setStatus("ready");
              startRendering();
            } catch (error) {
              console.error("Unable to prepare the Mark 6 FBX model.", error);
              setStatus("error");
            }
          },
          undefined,
          (error) => {
            console.error("Unable to load the Mark 6 FBX model.", error);
            if (!cancelled) setStatus("error");
          },
        );

        startRendering();
      } catch (error) {
        console.error("Unable to initialize the Mark 6 3D viewer.", error);
        if (!cancelled) setStatus("error");
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (cancelled) return;
        inViewport = entry.isIntersecting;
        if (inViewport) {
          void initializeViewer();
        } else if (frame !== 0) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "180px 0px", threshold: 0 },
    );
    observer.observe(initialStage);

    return () => {
      cancelled = true;
      observer.disconnect();
      resizeObserver?.disconnect();
      if (frame !== 0) window.cancelAnimationFrame(frame);
      controlsRef.current?.dispose();
      controlsRef.current = null;
      if (scene) disposeModel(scene);
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const controls = controlsRef.current;
    if (!controls || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;

    event.preventDefault();
    controls.rotateLeft(event.key === "ArrowLeft" ? 0.16 : -0.16);
    controls.update();
  }, []);

  const resetView = useCallback(() => {
    controlsRef.current?.reset();
  }, []);

  return (
    <div className="mark6-viewer">
      <div
        className="mark6-stage"
        ref={stageRef}
        role="application"
        aria-label="Interactive 3D view of the Anargya Mark 6. Drag to rotate; use the left and right arrow keys when focused."
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {status !== "ready" && (
          <div className="mark6-viewer-message" role="status" aria-live="polite">
            {status === "loading" ? (
              <>
                <span className="mark6-loader" aria-hidden="true" />
                Loading Mark 6 3D model…
              </>
            ) : status === "error" ? (
              "The 3D model could not be loaded. Please refresh the page to try again."
            ) : (
              "The interactive model loads as you reach this section."
            )}
          </div>
        )}
        <p className="mark6-viewer-hint">
          <span className="mark6-hint-indicator" aria-hidden="true" />
          Drag to rotate · Scroll to zoom
        </p>
        <div className="mark6-viewer-controls" aria-label="3D model controls">
          <button
            type="button"
            onClick={() => setAutoRotate((current) => !current)}
            aria-pressed={autoRotate}
            disabled={status !== "ready"}
          >
            {autoRotate ? "Pause rotation" : "Auto rotate"}
          </button>
          <button
            type="button"
            onClick={resetView}
            disabled={status !== "ready"}
          >
            Reset view
          </button>
        </div>
        <span className="mark6-viewer-index" aria-hidden="true">
          M6 <span>—</span> 360°
        </span>
      </div>
    </div>
  );
}
