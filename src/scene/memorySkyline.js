import * as THREE from 'three';
import { accentFillStyle } from '../theme/accent.js';

const RAIN_COUNT = 4000;
const DRIFT_SPEED = 0.00012;
const FOG_NEAR = 1;
const FOG_FAR = 48;

/** Sky / fog stay black; only the point-light accent shifts on memory select. */
const BLACK = 0x000000;

/** Cycle tints derived from `theme.css` --accent (no hardcoded hex). */
function buildAccentPalettes() {
  const base = new THREE.Color(accentFillStyle());
  const white = new THREE.Color(0xffffff);
  const L = (t) => base.clone().lerp(white, t).getHex();
  const D = (m) => base.clone().multiplyScalar(m).getHex();
  return [
    { fog: BLACK, accent: base.getHex() },
    { fog: BLACK, accent: L(0.38) },
    { fog: BLACK, accent: D(0.76) },
    { fog: BLACK, accent: L(0.22) },
    { fog: BLACK, accent: base.getHex() },
    { fog: BLACK, accent: L(0.52) },
    { fog: BLACK, accent: D(0.62) },
  ];
}

let palettes = [];

let renderer, scene, camera, rainGeo, rainMat, rain;
let frameId = null;
let paletteIndex = 0;
let targetFogColor = new THREE.Color(BLACK);
let targetAccent = new THREE.Color(BLACK);

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initScene() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  palettes = buildAccentPalettes();
  targetFogColor = new THREE.Color(palettes[0].fog);
  targetAccent = new THREE.Color(palettes[0].accent);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(palettes[0].fog, FOG_NEAR, FOG_FAR);
  scene.background = new THREE.Color(palettes[0].fog);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2, 8);

  buildCityBlocks();
  buildRain();

  const ambient = new THREE.AmbientLight(0x0c0a12, 0.42);
  scene.add(ambient);

  const point = new THREE.PointLight(palettes[0].accent, 1.35, 32);
  point.position.set(2, 6, 4);
  scene.add(point);

  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('memory:select', onMemorySelect);

  if (!prefersReducedMotion) {
    animate();
  } else {
    renderer.render(scene, camera);
  }
}

function buildCityBlocks() {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x101012,
    roughness: 0.92,
    metalness: 0.22,
  });

  const count = 60;
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = -Math.random() * 35 - 3;
    const h = 1 + Math.random() * 8;
    const w = 0.6 + Math.random() * 1.8;
    const d = 0.6 + Math.random() * 1.8;

    dummy.position.set(x, h / 2, z);
    dummy.scale.set(w, h, d);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  scene.add(mesh);
}

function makeRainDropTexture() {
  // Points sprites are square; a 10×10 texture with a 1px-wide column gives streak aspect 1:10 (w:h)
  const n = 10;
  const canvas = document.createElement('canvas');
  canvas.width = n;
  canvas.height = n;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, n, n);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(Math.floor((n - 1) / 2), 0, 1, n);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function buildRain() {
  const positions = new Float32Array(RAIN_COUNT * 3);
  const velocities = new Float32Array(RAIN_COUNT);

  for (let i = 0; i < RAIN_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    velocities[i] = 0.08 + Math.random() * 0.14;
  }

  rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  rainGeo.userData.velocities = velocities;

  rainMat = new THREE.PointsMaterial({
    map: makeRainDropTexture(),
    color: palettes[0].accent,
    // World-units height of the streak; width follows 1:10 texture aspect
    size: 0.55,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    sizeAttenuation: true,
    alphaTest: 0.02,
  });

  rain = new THREE.Points(rainGeo, rainMat);
  scene.add(rain);
}

function animate() {
  frameId = requestAnimationFrame(animate);

  const t = performance.now();

  camera.position.x = Math.sin(t * DRIFT_SPEED) * 1.2;
  camera.position.y = 2 + Math.sin(t * DRIFT_SPEED * 0.7) * 0.3;
  camera.lookAt(0, 1.5, -6);

  updateRain();
  lerpSceneColors();

  renderer.render(scene, camera);
}

function updateRain() {
  const pos = rainGeo.attributes.position.array;
  const vel = rainGeo.userData.velocities;

  for (let i = 0; i < RAIN_COUNT; i++) {
    pos[i * 3 + 1] -= vel[i];
    if (pos[i * 3 + 1] < -1) {
      pos[i * 3 + 1] = 18 + Math.random() * 4;
    }
  }

  rainGeo.attributes.position.needsUpdate = true;
}

function lerpSceneColors() {
  scene.fog.color.lerp(targetFogColor, 0.015);
  scene.background.lerp(targetFogColor, 0.015);

  const point = scene.children.find((c) => c.isPointLight);
  if (point) {
    point.color.lerp(targetAccent, 0.02);
  }

  if (rainMat) {
    rainMat.color.lerp(targetAccent, 0.02);
  }
}

function onMemorySelect(e) {
  const idx = palettes.length > 0
    ? (paletteIndex + 1) % palettes.length
    : 0;
  paletteIndex = idx;
  targetFogColor = new THREE.Color(palettes[idx].fog);
  targetAccent = new THREE.Color(palettes[idx].accent);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onVisibilityChange() {
  if (prefersReducedMotion) return;
  if (document.hidden) {
    cancelAnimationFrame(frameId);
    frameId = null;
  } else if (!frameId) {
    animate();
  }
}
