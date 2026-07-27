"use client";

import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

interface Phase {
  id: string;
  title: string;
  status: string;
  budgetAllocation: number;
  milestones: { completed: boolean }[];
  budgetSpent: number;
}

const STATUS_COLORS: Record<string, { main: string; glow: string }> = {
  completed: { main: "#10b981", glow: "#6ee7b7" },
  funded: { main: "#10b981", glow: "#6ee7b7" },
  in_progress: { main: "#f59e0b", glow: "#fcd34d" },
  submitted_for_review: { main: "#f59e0b", glow: "#fcd34d" },
  approved: { main: "#f59e0b", glow: "#fcd34d" },
  not_started: { main: "#cbd5e1", glow: "#e2e8f0" },
};

function getColor(status: string) {
  return STATUS_COLORS[status] || STATUS_COLORS.not_started;
}

export default function PhaseRoadmap3D({ phases }: { phases: Phase[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const phaseData = useMemo(() => phases.map((p, i) => ({
    ...p,
    idx: i,
    color: getColor(p.status),
    isDone: p.status === "completed" || p.status === "funded",
    isActive: ["in_progress", "submitted_for_review", "approved"].includes(p.status),
  })), [phases]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || phaseData.length === 0) return;

    const w = container.offsetWidth;
    const h = 220;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 200);
    camera.position.set(0, 0, 50);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const padX = 80;
    const gap = (w - padX * 2) / Math.max(phaseData.length - 1, 1);
    const cy = 0;

    const nodes: { group: THREE.Group; sphere: THREE.Mesh; glow: THREE.Mesh; ring: THREE.Mesh; phase: typeof phaseData[0] }[] = [];

    phaseData.forEach((phase, i) => {
      const x = -w / 2 + padX + i * gap;
      const group = new THREE.Group();
      group.position.set(x, cy, 0);
      scene.add(group);

      const c = new THREE.Color(phase.color.main);
      const gc = new THREE.Color(phase.color.glow);

      const sphereGeo = new THREE.SphereGeometry(22, 32, 32);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: phase.isDone || phase.isActive ? 1 : 0.3,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphere);

      const glowGeo = new THREE.SphereGeometry(36, 24, 24);
      const glowMat = new THREE.MeshBasicMaterial({
        color: gc,
        transparent: true,
        opacity: phase.isDone ? 0.25 : phase.isActive ? 0.2 : 0.06,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = -5;
      group.add(glow);

      const ringGeo = new THREE.RingGeometry(28, 32, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: phase.isDone ? 0.3 : phase.isActive ? 0.2 : 0.08,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = -1;
      group.add(ring);

      if (phase.isDone) {
        const shape = new THREE.Shape();
        shape.moveTo(-6, 0);
        shape.lineTo(-2, -5);
        shape.lineTo(7, 5);
        const checkGeo = new THREE.ShapeGeometry(shape);
        const checkMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const check = new THREE.Mesh(checkGeo, checkMat);
        check.position.z = 1;
        group.add(check);
      } else if (phase.isActive) {
        const dotGeo = new THREE.CircleGeometry(5, 24);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.z = 1;
        group.add(dot);
      } else {
        const lockShape = new THREE.Shape();
        lockShape.moveTo(-5, -3);
        lockShape.lineTo(-5, 2);
        lockShape.lineTo(5, 2);
        lockShape.lineTo(5, -3);
        lockShape.lineTo(3, -5);
        lockShape.lineTo(-3, -5);
        lockShape.lineTo(-5, -3);
        const holePath = new THREE.Path();
        holePath.absarc(0, 5, 4, 0, Math.PI * 2, false);
        lockShape.holes.push(holePath);
        const lockGeo = new THREE.ShapeGeometry(lockShape);
        const lockMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide });
        const lock = new THREE.Mesh(lockGeo, lockMat);
        lock.position.set(0, 0, 1);
        group.add(lock);
      }

      nodes.push({ group, sphere, glow, ring, phase });

      const dpr = Math.min(window.devicePixelRatio, 2);
      const canvasW = 512;
      const canvasH = 160;
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = canvasW * dpr;
      labelCanvas.height = canvasH * dpr;
      const lctx = labelCanvas.getContext("2d")!;
      lctx.scale(dpr, dpr);
      lctx.fillStyle = phase.isDone ? "#065f46" : phase.isActive ? "#92400e" : "#64748b";
      lctx.font = "bold 36px Inter, sans-serif";
      lctx.textAlign = "center";
      lctx.fillText(phase.title, canvasW / 2, 48);
      lctx.fillStyle = "#94a3b8";
      lctx.font = "26px Inter, sans-serif";
      const done = phase.milestones.filter((m) => m.completed).length;
      lctx.fillText(`${done}/${phase.milestones.length} milestones`, canvasW / 2, 90);
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      labelTexture.minFilter = THREE.LinearFilter;
      labelTexture.magFilter = THREE.LinearFilter;
      labelTexture.colorSpace = THREE.SRGBColorSpace;
      const labelMat = new THREE.SpriteMaterial({ map: labelTexture, transparent: true, opacity: 1 });
      const label = new THREE.Sprite(labelMat);
      label.scale.set(140, 44, 1);
      label.position.set(0, -52, 0);
      group.add(label);
    });

    for (let i = 0; i < phaseData.length - 1; i++) {
      const n1 = nodes[i];
      const n2 = nodes[i + 1];
      const isDone = phaseData[i].isDone;
      const startX = n1.group.position.x + 34;
      const endX = n2.group.position.x - 34;
      const points = [new THREE.Vector3(startX, cy, -2), new THREE.Vector3(endX, cy, -2)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: isDone ? 0x10b981 : 0xe2e8f0,
        transparent: true,
        opacity: isDone ? 0.8 : 0.4,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
    }

    let time = 0;
    let animId: number;

    const animate = () => {
      time += 0.02;
      animId = requestAnimationFrame(animate);

      nodes.forEach((node, i) => {
        const bobY = Math.sin(time * 0.6 + i * 0.9) * 3;
        node.group.position.y = cy + bobY;

        const mat = node.glow.material as THREE.MeshBasicMaterial;
        if (node.phase.isDone) {
          mat.opacity = 0.2 + Math.sin(time * 0.5 + i) * 0.08;
          node.ring.rotation.z = time * 0.15;
        } else if (node.phase.isActive) {
          mat.opacity = 0.15 + Math.sin(time * 0.7 + i) * 0.1;
          node.ring.rotation.z = -time * 0.2;
          (node.sphere.material as THREE.MeshBasicMaterial).opacity = 0.85 + Math.sin(time + i) * 0.15;
        } else {
          mat.opacity = 0.04 + Math.sin(time * 0.3 + i) * 0.02;
        }

        node.glow.scale.setScalar(1 + Math.sin(time * 0.4 + i * 0.5) * 0.08);
      });

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.offsetWidth;
      camera.left = -nw / 2;
      camera.right = nw / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [phaseData]);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full" style={{ height: "220px" }} />
    </div>
  );
}
