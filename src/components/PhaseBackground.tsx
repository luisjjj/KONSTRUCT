"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PHASE_COLORS = [
  new THREE.Color("#10b981"),
  new THREE.Color("#f59e0b"),
  new THREE.Color("#3b82f6"),
  new THREE.Color("#8b5cf6"),
  new THREE.Color("#06b6d4"),
];

interface PhaseNode {
  group: THREE.Group;
  sphere: THREE.Mesh;
  glow: THREE.Mesh;
  ring: THREE.Mesh;
  lineMesh: THREE.Line;
  speed: number;
  offset: number;
  baseY: number;
  orbitRadius: number;
}

export default function PhaseBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(0, 0, 40);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const nodes: PhaseNode[] = [];

    const positions = [
      { x: -18, y: 5 },
      { x: -8, y: -4 },
      { x: 2, y: 6 },
      { x: 12, y: -3 },
      { x: 20, y: 4 },
    ];

    for (let i = 0; i < 5; i++) {
      const color = PHASE_COLORS[i];
      const pos = positions[i];

      const group = new THREE.Group();
      group.position.set(pos.x, pos.y, -5);
      scene.add(group);

      const sphereGeo = new THREE.SphereGeometry(1.8, 32, 32);
      const sphereMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphere);

      const glowGeo = new THREE.SphereGeometry(4.5, 24, 24);
      const glowMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.06,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = -2;
      group.add(glow);

      const ringGeo = new THREE.RingGeometry(2.5, 2.8, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = -0.5;
      group.add(ring);

      const linePoints: THREE.Vector3[] = [];
      for (let j = 0; j < 40; j++) {
        linePoints.push(new THREE.Vector3(0, 0, 0));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.06,
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      scene.add(lineMesh);

      nodes.push({
        group,
        sphere,
        glow,
        ring,
        lineMesh,
        speed: 0.3 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
        baseY: pos.y,
        orbitRadius: 1.5 + Math.random() * 2,
      });
    }

    for (let i = 0; i < nodes.length - 1; i++) {
      const n1 = nodes[i];
      const n2 = nodes[i + 1];
      const linePoints = [
        n1.group.position.clone(),
        n2.group.position.clone(),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xcbd5e1,
        transparent: true,
        opacity: 0.08,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      (line as any)._connect = { n1: i, n2: i + 1 };
    }

    const particleCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 60;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 8;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.2,
      sizeAttenuation: true,
    });
    const pts = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    let time = 0;
    let animId: number;

    const animate = () => {
      time += 0.006;
      animId = requestAnimationFrame(animate);

      nodes.forEach((node, i) => {
        node.group.position.y = node.baseY + Math.sin(time * node.speed + node.offset) * node.orbitRadius;
        node.group.position.x += Math.sin(time * 0.08 + node.offset) * 0.005;

        (node.sphere.material as THREE.MeshBasicMaterial).opacity =
          0.12 + Math.sin(time * 0.4 + node.offset) * 0.04;
        (node.glow.material as THREE.MeshBasicMaterial).opacity =
          0.04 + Math.sin(time * 0.3 + node.offset) * 0.02;
        node.glow.scale.setScalar(1 + Math.sin(time * 0.25 + node.offset) * 0.1);
        node.ring.rotation.z = time * 0.05 + i;

        const linePos = node.lineMesh.geometry.attributes.position as THREE.BufferAttribute;
        for (let j = 0; j < 40; j++) {
          const t = j / 39;
          linePos.setY(j, node.group.position.y + Math.sin(time * node.speed + j * 0.12) * 0.8 * t);
          linePos.setX(j, node.group.position.x + Math.sin(time * 0.15 + j * 0.18) * 0.5 * t);
        }
        linePos.needsUpdate = true;
      });

      scene.children.forEach((child) => {
        if ((child as any)._connect) {
          const { n1, n2 } = (child as any)._connect;
          const line = child as THREE.Line;
          const pos = line.geometry.attributes.position as THREE.BufferAttribute;
          pos.setXYZ(0, nodes[n1].group.position.x, nodes[n1].group.position.y, nodes[n1].group.position.z);
          pos.setXYZ(1, nodes[n2].group.position.x, nodes[n2].group.position.y, nodes[n2].group.position.z);
          pos.needsUpdate = true;
        }
      });

      pts.rotation.y = time * 0.01;
      pts.rotation.x = Math.sin(time * 0.03) * 0.03;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
