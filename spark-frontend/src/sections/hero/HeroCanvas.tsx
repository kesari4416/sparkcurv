'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { palette } from '@/lib/tokens';
import { bindPointer, pointer } from '@/lib/pointer';
import { linkFragment, linkVertex, nodeFragment, nodeVertex, pulseFragment, pulseVertex } from './shaders';

/*
 * Hero network, rendered with plain three.js.
 *
 * The scene is one canvas with no interactive 3D UI, so a React renderer for three
 * (react-three-fiber) bought nothing here and cost ~150 kB of extra JavaScript (it ships
 * its own React reconciler). It also still uses the deprecated THREE.Clock internally;
 * this loop uses THREE.Timer.
 */

const { damp } = THREE.MathUtils;
const RADIUS = 1.35;
const FOV = 35;
const CAMERA_Z = 5;

/** Small deterministic PRNG, so the network looks the same on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds the network once:
 *  - nodes spread evenly over a sphere with a Fibonacci lattice (plus a little jitter so
 *    it doesn't look machine-made),
 *  - each node linked to its `k` nearest neighbours (duplicates removed),
 *  - pulses assigned to a random subset of links.
 */
function buildNetwork(count: number, k: number, pulseCount: number) {
  const rand = mulberry32(7);
  const nodes: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i + (rand() - 0.5) * 0.35;
    nodes.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(RADIUS * (0.97 + rand() * 0.06)));
  }

  const edges: Array<[number, number]> = [];
  const seen = new Set<string>();
  for (let i = 0; i < count; i++) {
    const nearest = nodes
      .map((n, j) => ({ j, d: j === i ? Infinity : n.distanceToSquared(nodes[i]) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, k);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  }

  const nodePos = new Float32Array(count * 3);
  const nodeSize = new Float32Array(count);
  const nodeSeed = new Float32Array(count);
  nodes.forEach((n, i) => {
    n.toArray(nodePos, i * 3);
    nodeSize[i] = rand() < 0.08 ? 9 + rand() * 5 : 3.5 + rand() * 3; // a few larger "hub" nodes
    nodeSeed[i] = rand();
  });

  const linkPos = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], i) => {
    nodes[a].toArray(linkPos, i * 6);
    nodes[b].toArray(linkPos, i * 6 + 3);
  });

  const start = new Float32Array(pulseCount * 3);
  const end = new Float32Array(pulseCount * 3);
  const seed = new Float32Array(pulseCount);
  const speed = new Float32Array(pulseCount);
  for (let i = 0; i < pulseCount; i++) {
    const [a, b] = edges[Math.floor(rand() * edges.length)];
    const forward = rand() < 0.5;
    nodes[forward ? a : b].toArray(start, i * 3);
    nodes[forward ? b : a].toArray(end, i * 3);
    seed[i] = rand();
    speed[i] = 0.25 + rand() * 0.45;
  }

  return { nodePos, nodeSize, nodeSeed, linkPos, start, end, seed, speed };
}

type HeroCanvasProps = {
  play: boolean;
  onReady: () => void;
};

/** Loaded with next/dynamic (no SSR) and only on devices that can run it; see HeroVisual. */
export default function HeroCanvas({ play, onReady }: HeroCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const playRef = useRef(play);
  const readyRef = useRef(onReady);

  useEffect(() => {
    playRef.current = play;
    readyRef.current = onReady;
  }, [play, onReady]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    bindPointer();

    // Fewer nodes on touch screens: the effect reads the same, the work halves.
    const dense = !window.matchMedia('(pointer: coarse)').matches;
    const net = buildNetwork(dense ? 220 : 120, 3, dense ? 70 : 36);

    // ── Renderer, scene, camera ────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'display:block;width:100%;height:100%';
    wrap.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
    camera.position.z = CAMERA_Z;

    // One uniforms object shared by all three materials: same time, entrance and cursor.
    const uniforms = {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uCursor: { value: new THREE.Vector3(0, 0, RADIUS) },
      uCursorAmt: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uSilver: { value: new THREE.Color(palette.spark.silver) },
      uBlue: { value: new THREE.Color(palette.spark.blue) },
    };
    const additive = { uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };

    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(net.linkPos, 3));
    const links = new THREE.LineSegments(
      linkGeo,
      new THREE.ShaderMaterial({ vertexShader: linkVertex, fragmentShader: linkFragment, ...additive }),
    );

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(net.nodePos, 3));
    nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(net.nodeSize, 1));
    nodeGeo.setAttribute('aSeed', new THREE.BufferAttribute(net.nodeSeed, 1));
    const nodes = new THREE.Points(
      nodeGeo,
      new THREE.ShaderMaterial({ vertexShader: nodeVertex, fragmentShader: nodeFragment, ...additive }),
    );

    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(net.start, 3));
    pulseGeo.setAttribute('aStart', new THREE.BufferAttribute(net.start, 3));
    pulseGeo.setAttribute('aEnd', new THREE.BufferAttribute(net.end, 3));
    pulseGeo.setAttribute('aSeed', new THREE.BufferAttribute(net.seed, 1));
    pulseGeo.setAttribute('aSpeed', new THREE.BufferAttribute(net.speed, 1));
    const pulses = new THREE.Points(
      pulseGeo,
      new THREE.ShaderMaterial({ vertexShader: pulseVertex, fragmentShader: pulseFragment, ...additive }),
    );
    // The pulses' real positions come from the shader, not `position`, so skip culling.
    pulses.frustumCulled = false;

    const group = new THREE.Group();
    group.add(links, nodes, pulses);
    scene.add(group);

    // ── Sizing ────────────────────────────────────────────────────────────────
    // Visible world size at z = 0, used to place the sphere relative to the viewport.
    const view = { width: 1, height: 1, aspect: 1 };
    const resize = () => {
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      view.aspect = w / h;
      view.height = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAMERA_Z;
      view.width = view.height * view.aspect;
    };
    // ResizeObserver reports layout size, unaffected by CSS transforms on ancestors.
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // ── Per-frame update ──────────────────────────────────────────────────────
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const sphere = new THREE.Sphere();
    const hit = new THREE.Vector3();

    const step = (delta: number) => {
      uniforms.uTime.value += delta;
      uniforms.uReveal.value = damp(uniforms.uReveal.value, playRef.current ? 1 : 0, 1.8, delta);

      // Wide screens: right of the headline. Portrait: raised behind the headline so the
      // intro paragraph sits on plain ink.
      const portrait = view.aspect < 1;
      const baseX = portrait ? 0 : view.width * 0.2;
      const baseY = portrait ? view.height * 0.24 : 0;
      group.scale.setScalar((portrait ? 0.66 : 1) * (0.85 + uniforms.uReveal.value * 0.15));

      // Slow spin plus mouse parallax.
      group.rotation.y += delta * 0.07;
      group.rotation.x = damp(group.rotation.x, 0.25 - pointer.ny * 0.25, 3, delta);
      group.rotation.z = damp(group.rotation.z, -pointer.nx * 0.12, 3, delta);
      group.position.x = damp(group.position.x, baseX + pointer.nx * 0.15, 2, delta);
      group.position.y = damp(group.position.y, baseY + pointer.ny * 0.1, 2, delta);
      group.updateMatrixWorld();

      // Project the cursor onto the sphere: a ray from the camera through the pointer,
      // intersected with the sphere's bounds, converted to the group's local space (the
      // shaders work in local space, so the rotation is accounted for).
      let target = 0;
      if (pointer.active) {
        ndc.set(pointer.nx, pointer.ny);
        ray.setFromCamera(ndc, camera);
        sphere.set(group.getWorldPosition(hit), RADIUS * group.scale.x);
        if (ray.ray.intersectSphere(sphere, hit)) {
          group.worldToLocal(hit);
          uniforms.uCursor.value.lerp(hit, 1 - Math.exp(-12 * delta));
          target = 1;
        }
      }
      uniforms.uCursorAmt.value = damp(uniforms.uCursorAmt.value, target, 4, delta);
    };

    // THREE.Timer + Page Visibility: no time jump when returning to a hidden tab.
    const timer = new THREE.Timer();
    timer.connect(document);
    let raf = 0;
    let running = false;
    let reported = false;
    const frame = (now: number) => {
      timer.update(now);
      step(Math.min(timer.getDelta(), 0.1));
      renderer.render(scene, camera);
      if (!reported) {
        reported = true;
        readyRef.current();
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      timer.reset();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Render only while the hero is on screen.
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(wrap);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      timer.dispose();
      [linkGeo, nodeGeo, pulseGeo].forEach((g) => g.dispose());
      [links, nodes, pulses].forEach((o) => (o.material as THREE.Material).dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={wrapRef} className="absolute inset-0" />;
}
