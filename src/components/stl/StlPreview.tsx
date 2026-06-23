import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import "./StlPreview.css";

interface StlPreviewProps {
  file?: File;
}

export function StlPreview({ file }: StlPreviewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [message, setMessage] = useState("Select an STL file to preview it here.");
  const [error, setError] = useState<string | null>(null);
  const [bounds, setBounds] = useState<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !file) return;
    const previewFile = file;

    let disposed = false;
    let frame = 0;
    setError(null);
    setBounds(null);
    setMessage("Parsing STL preview…");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f7);
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 10000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 1.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(1, 1, 2);
    scene.add(keyLight);

    async function load() {
      try {
        const buffer = await previewFile.arrayBuffer();
        if (disposed) return;
        const geometry = new STLLoader().parse(buffer);
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.center();
        const material = new THREE.MeshStandardMaterial({ metalness: 0.1, roughness: 0.65 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const box = geometry.boundingBox;
        const size = new THREE.Vector3();
        box?.getSize(size);
        setBounds(box ? { x: size.x, y: size.y, z: size.z } : null);
        setMessage(`Previewing ${previewFile.name}`);

        const maxDim = Math.max(size.x || 1, size.y || 1, size.z || 1);
        camera.position.set(maxDim * 1.3, maxDim * 1.1, maxDim * 1.8);
        camera.near = Math.max(maxDim / 1000, 0.01);
        camera.far = maxDim * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.update();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not parse STL file.");
        setMessage("STL preview failed.");
      }
    }

    function animate() {
      frame = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    load();
    animate();

    function handleResize() {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = Math.max(mountRef.current.clientHeight, 1);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frame);
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      renderer.domElement.remove();
    };
  }, [file]);

  function resetCamera() {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const maxDim = Math.max(bounds?.x ?? 50, bounds?.y ?? 50, bounds?.z ?? 50);
    camera.position.set(maxDim * 1.3, maxDim * 1.1, maxDim * 1.8);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  return (
    <div className="stl-preview-panel" aria-label="STL preview panel" role="region">
      <div ref={mountRef} style={{ minHeight: "320px", width: "100%" }} />
      <div className="stl-preview-note">
        <p className="stl-preview-label">{message}</p>
        {bounds && (
          <p className="text-xs text-muted">
            Rough bounds: {bounds.x.toFixed(1)} × {bounds.y.toFixed(1)} × {bounds.z.toFixed(1)} mm
          </p>
        )}
        {error && <p className="text-error text-sm" role="alert">{error}</p>}
        {file && <button type="button" className="btn btn-secondary btn-sm" onClick={resetCamera}>Reset camera</button>}
      </div>
    </div>
  );
}
