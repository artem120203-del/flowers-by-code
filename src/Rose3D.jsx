
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Rose3D({ color = "#c91545" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    let frame = 0;
    let observer;
    let disposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8f1ed");

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.25, 7.8);

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "low-power",
      });
    } catch (error) {
      mount.textContent = "3D-цветок не поддерживается этим браузером.";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight("#fff4ee", "#45302a", 2.2));

    const keyLight = new THREE.DirectionalLight("#fff0dc", 3.5);
    keyLight.position.set(-3, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight("#f5a5bd", 18, 12);
    rimLight.position.set(3, 1.5, -2);
    scene.add(rimLight);

    const rose = new THREE.Group();
    scene.add(rose);

    const petalMaterial = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.34,
      metalness: 0,
      sheen: 0.65,
      sheenColor: new THREE.Color("#ffb2c4"),
      sheenRoughness: 0.45,
      side: THREE.DoubleSide,
    });

    const innerMaterial = petalMaterial.clone();
    innerMaterial.color.set("#a80e37");

    const stemMaterial = new THREE.MeshStandardMaterial({
      color: "#315e36",
      roughness: 0.72,
    });

    const leafMaterial = new THREE.MeshStandardMaterial({
      color: "#477b42",
      roughness: 0.48,
      side: THREE.DoubleSide,
    });

    // Лепесток с объёмом и естественно загнутым краем.
    function makePetal(width, length, bend = 0.18) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(
        -width * 0.78, length * 0.18,
        -width * 0.62, length * 0.82,
        0, length
      );
      shape.bezierCurveTo(
        width * 0.62, length * 0.82,
        width * 0.78, length * 0.18,
        0, 0
      );

      const geometry = new THREE.ShapeGeometry(shape, 20);
      const position = geometry.attributes.position;

      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const t = Math.max(0, Math.min(1, y / length));

        const z =
          Math.sin(t * Math.PI) * 0.13 +
          (x * x / (width * width + 0.001)) * bend -
          t * t * 0.05;

        position.setZ(i, z);
      }

      geometry.computeVertexNormals();
      return geometry;
    }

    // Плотная внутренняя спираль.
    for (let i = 0; i < 13; i++) {
      const angle = i * 2.399;
      const radius = 0.08 + i * 0.022;
      const petal = new THREE.Mesh(
        makePetal(0.19 + i * 0.004, 0.42 + i * 0.009, 0.2),
        innerMaterial
      );

      petal.position.set(
        Math.cos(angle) * radius,
        0.38 + (i % 3) * 0.025,
        Math.sin(angle) * radius
      );

      petal.rotation.y = -angle;
      petal.rotation.x = -0.22 + (i % 4) * 0.08;
      petal.rotation.z = -0.2 + (i % 5) * 0.09;
      rose.add(petal);
    }

    // Три раскрывающихся слоя лепестков.
    const layers = [
      { count: 9, radius: 0.19, width: 0.29, length: 0.72, tilt: 0.2 },
      { count: 12, radius: 0.36, width: 0.34, length: 0.91, tilt: 0.48 },
      { count: 15, radius: 0.56, width: 0.37, length: 1.02, tilt: 0.77 },
    ];

    layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        const angle =
          (i / layer.count) * Math.PI * 2 +
          layerIndex * 0.36;

        const petal = new THREE.Mesh(
          makePetal(
            layer.width,
            layer.length,
            0.16 + layerIndex * 0.09
          ),
          petalMaterial
        );

        petal.position.set(
          Math.cos(angle) * layer.radius,
          0.28 - layerIndex * 0.06,
          Math.sin(angle) * layer.radius
        );

        petal.rotation.y = -angle;
        petal.rotation.x = -layer.tilt;
        petal.rotation.z =
          Math.sin(angle * 2) * 0.12 +
          (layerIndex - 1) * 0.06;

        rose.add(petal);
      }
    });

    // Изогнутый зелёный стебель.
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0.04, -0.55, 0),
      new THREE.Vector3(-0.08, -1.2, 0),
      new THREE.Vector3(0.04, -2.15, 0),
      new THREE.Vector3(0.12, -2.75, 0),
    ]);

    const stem = new THREE.Mesh(
      new THREE.TubeGeometry(stemCurve, 32, 0.035, 8, false),
      stemMaterial
    );
    rose.add(stem);

    // Листья с заострённой формой и центральной жилкой.
    function addLeaf(x, y, z, rotation, scale) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(0.42, 0.38, 0.85, 0.13);
      shape.quadraticCurveTo(0.48, -0.12, 0, 0);
      shape.closePath();

      const leaf = new THREE.Mesh(
        new THREE.ShapeGeometry(shape, 16),
        leafMaterial
      );

      leaf.position.set(x, y, z);
      leaf.rotation.z = rotation;
      leaf.scale.setScalar(scale);
      rose.add(leaf);

      const veinCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0.012),
        new THREE.Vector3(0.35, 0.1, 0.012),
        new THREE.Vector3(0.75, 0.13, 0.012),
      ]);

      const vein = new THREE.Mesh(
        new THREE.TubeGeometry(veinCurve, 12, 0.008, 4, false),
        stemMaterial
      );

      vein.position.copy(leaf.position);
      vein.rotation.copy(leaf.rotation);
      vein.scale.copy(leaf.scale);
      rose.add(vein);
    }

    addLeaf(-0.05, -0.85, 0.02, 2.65, 1.15);
    addLeaf(0.02, -1.4, 0.03, 0.3, 1.05);
    addLeaf(-0.04, -1.95, 0.02, 2.8, 0.85);

    rose.position.y = 0.15;
    rose.rotation.z = -0.04;

    function resize() {
      if (disposed) return;
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const clock = new THREE.Clock();

    function animate() {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      rose.rotation.y = Math.sin(time * 0.35) * 0.13;
      rose.rotation.z = -0.04 + Math.sin(time * 0.55) * 0.012;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();

      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => material.dispose());
        }
      });

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [color]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "420px",
        overflow: "hidden",
        borderRadius: "24px",
        background: "#f8f1ed",
      }}
      aria-label="Объёмная 3D-роза"
    />
  );
}
