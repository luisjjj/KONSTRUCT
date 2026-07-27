"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PHASE_COLORS = [
  { main: "#10b981", glow: "#34d399" },
  { main: "#f59e0b", glow: "#fbbf24" },
  { main: "#3b82f6", glow: "#60a5fa" },
  { main: "#8b5cf6", glow: "#a78bfa" },
  { main: "#06b6d4", glow: "#22d3ee" },
];

const PHASE_LABELS = ["Foundation", "Blockwork", "Roofing", "Finishing", "External"];

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.offsetWidth;
    const h = container.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500);
    camera.position.set(0, 0, 28);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const phaseGroup = new THREE.Group();
    scene.add(phaseGroup);

    const sphereNodes: { mesh: THREE.Mesh; glow: THREE.Mesh; ring: THREE.Mesh; label: string; idx: number }[] = [];

    for (let i = 0; i < 5; i++) {
      const color = new THREE.Color(PHASE_COLORS[i].main);
      const glowColor = new THREE.Color(PHASE_COLORS[i].glow);
      const x = (i - 2) * 5.5;
      const y = Math.sin(i * 0.8) * 2;

      const sphereGeo = new THREE.SphereGeometry(0.7, 32, 32);
      const sphereMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(x, y, 0);
      phaseGroup.add(sphere);

      const glowGeo = new THREE.SphereGeometry(1.6, 24, 24);
      const glowMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.15 });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.set(x, y, -0.5);
      phaseGroup.add(glowMesh);

      const ringGeo = new THREE.RingGeometry(1.0, 1.15, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, y, -0.1);
      phaseGroup.add(ring);

      sphereNodes.push({ mesh: sphere, glow: glowMesh, ring, label: PHASE_LABELS[i], idx: i });
    }

    const curvePoints: THREE.Vector3[] = sphereNodes.map((n) => n.mesh.position.clone());
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, "catmullrom", 0.5);
    const curvePts = curve.getPoints(120);
    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
    const curveMat = new THREE.LineBasicMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.25 });
    const curveLine = new THREE.Line(curveGeo, curveMat);
    phaseGroup.add(curveLine);

    for (let p = 0; p < 3; p++) {
      const trailCount = 8;
      const trailPts: THREE.Vector3[] = [];
      for (let t = 0; t < trailCount; t++) {
        trailPts.push(new THREE.Vector3(-20, 0, 0));
      }
      const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPts);
      const trailMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(PHASE_COLORS[p * 2].main),
        transparent: true,
        opacity: 0.15,
      });
      const trail = new THREE.Line(trailGeo, trailMat);
      phaseGroup.add(trail);
      (trail as any)._trailData = { curve, speed: 0.06 + p * 0.02, offset: p * 0.33, trailCount };
    }

    const particleCount = 150;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 60;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      pSizes[i] = Math.random() * 2 + 0.5;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("size", new THREE.BufferAttribute(pSizes, 1));
    const pMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.2,
      sizeAttenuation: true,
    });
    const pts = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    const lineTrails = phaseGroup.children.filter((c) => (c as any)._trailData) as any[];

    let time = 0;
    let animId: number;

    const animate = () => {
      time += 0.01;
      animId = requestAnimationFrame(animate);

      phaseGroup.children.forEach((child) => {
        if ((child as any)._trailData) return;
      });

      sphereNodes.forEach((node, i) => {
        const baseY = Math.sin(i * 0.8) * 2;
        node.mesh.position.y = baseY + Math.sin(time * 0.5 + i * 0.7) * 0.4;
        node.glow.position.y = node.mesh.position.y - 0.5;
        node.ring.position.y = node.mesh.position.y - 0.1;

        (node.glow.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(time * 0.8 + i) * 0.05;
        node.glow.scale.setScalar(1 + Math.sin(time * 0.6 + i * 0.5) * 0.12);
        node.ring.rotation.z = time * 0.1 + i;
        (node.ring.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(time * 0.4 + i) * 0.04;

        (node.mesh.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(time * 0.7 + i * 0.9) * 0.2;
      });

      const updatedPts = sphereNodes.map((n) => n.mesh.position.clone());
      const updatedCurve = new THREE.CatmullRomCurve3(updatedPts, false, "catmullrom", 0.5);
      const newCurvePts = updatedCurve.getPoints(120);
      const posAttr = curveLine.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < newCurvePts.length; i++) {
        posAttr.setXYZ(i, newCurvePts[i].x, newCurvePts[i].y, newCurvePts[i].z);
      }
      posAttr.needsUpdate = true;

      lineTrails.forEach((trail) => {
        const td = trail._trailData;
        const prog = ((time * td.speed + td.offset) % 1 + 1) % 1;
        const trailPos = trail.geometry.attributes.position as THREE.BufferAttribute;
        for (let t = 0; t < td.trailCount; t++) {
          const tt = ((prog - t * 0.02) % 1 + 1) % 1;
          const pt = td.curve.getPoint(tt);
          trailPos.setXYZ(t, pt.x, pt.y, pt.z);
        }
        trailPos.needsUpdate = true;
      });

      pts.rotation.y = time * 0.015;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.offsetWidth;
      const nh = container.offsetHeight;
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
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.65 }}
    />
  );
}
