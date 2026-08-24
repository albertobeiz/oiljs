// oiljs — seeded oil portraits in 3D. Pipeline:
// recipe(seed) -> target image -> stroke planner -> height-field paint engine
// -> displaced impasto surface. Replay re-stamps the strokes live.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeSubject, drawSubject, TW, TH } from './subject.js';
import { planStrokes } from './planner.js';
import { PaintEngine } from './engine.js';
import { PaintSurface, PAINT_W, PAINT_H } from './surface.js';

const app = document.getElementById('app');
const ui = {
  seed: document.getElementById('seed'),
  status: document.getElementById('status'),
  bar: document.getElementById('barfill'),
  target: document.getElementById('target'),
};

// --- renderer / scene ------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x141110);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.05, 30);
camera.position.set(0.38, 0.16, 3.1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 0.4;
controls.maxDistance = 8;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const key = new THREE.DirectionalLight(0xfff2e0, 2.6);
key.position.set(-1.6, 1.8, 2.4);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -1.6; key.shadow.camera.right = 1.6;
key.shadow.camera.top = 1.9; key.shadow.camera.bottom = -1.9;
key.shadow.camera.near = 0.5; key.shadow.camera.far = 8;
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.01;
scene.add(key);
scene.add(new THREE.AmbientLight(0x404040, 0.7));
const rim = new THREE.DirectionalLight(0xa0b8ff, 0.5);
rim.position.set(1.8, 0.4, 1.2);
scene.add(rim);

// --- paint engine + surface ------------------------------------------------
let engine = new PaintEngine(TW, TH, 1);
const surface = new PaintSurface(engine, { segments: 2 });
scene.add(surface.mesh);

// --- frame + wall ----------------------------------------------------------
const frameMat = new THREE.MeshStandardMaterial({ color: 0x2e2016, roughness: 0.55, metalness: 0.15 });
const fw = 0.07, fd = 0.06;
const FW = PAINT_W, FH = PAINT_H;
for (const [w, h, x, y] of [
  [FW + fw * 2, fw, 0, FH / 2 + fw / 2], [FW + fw * 2, fw, 0, -FH / 2 - fw / 2],
  [fw, FH, -FW / 2 - fw / 2, 0], [fw, FH, FW / 2 + fw / 2, 0],
]) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, fd), frameMat);
  bar.position.set(x, y, fd / 2 - 0.015);
  bar.castShadow = bar.receiveShadow = true;
  scene.add(bar);
}

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x241f1a, roughness: 1 }));
wall.position.z = -0.03;
wall.receiveShadow = true;
scene.add(wall);

// --- painting state --------------------------------------------------------
let strokes = [];
let nextStroke = 0;          // replay cursor
let strokesPerFrame = 1;
let playing = false;
let currentSeed = 0;

function setStatus(t) { ui.status.textContent = t; }

async function generate(seed) {
  currentSeed = seed;
  ui.seed.textContent = String(seed);
  history.replaceState(null, '', `#${seed}`);
  playing = false;
  setStatus('generando retrato…');
  await new Promise(r => setTimeout(r, 20));

  const recipe = makeSubject(seed);
  const target = drawSubject(recipe);
  ui.target.width = target.width; ui.target.height = target.height;
  ui.target.getContext('2d').drawImage(target, 0, 0);

  setStatus('planificando pinceladas…');
  await new Promise(r => setTimeout(r, 20));
  const t0 = performance.now();
  engine = new PaintEngine(TW, TH, seed);
  surface.setEngine(engine);
  strokes = planStrokes(target, seed, engine);
  const secs = ((performance.now() - t0) / 1000).toFixed(1);
  setStatus(`${recipe.species}/${recipe.media} · ${strokes.length} pinceladas · ${secs}s`);

  replay();
}

function replay() {
  engine.reset();
  surface.update();
  nextStroke = 0;
  const targetFrames = 22 * 60;   // ~22 s at 60 fps
  strokesPerFrame = Math.max(1, Math.ceil(strokes.length / targetFrames));
  playing = true;
}

// --- loop ------------------------------------------------------------------
renderer.setAnimationLoop(() => {
  if (playing && strokes.length) {
    const end = Math.min(strokes.length, nextStroke + strokesPerFrame);
    for (; nextStroke < end; nextStroke++) {
      engine.stampStroke(strokes[nextStroke], nextStroke);
    }
    surface.update();
    ui.bar.style.width = `${(nextStroke / strokes.length * 100).toFixed(1)}%`;
    if (nextStroke >= strokes.length) {
      playing = false;
      setStatus(`${strokes.length} pinceladas · terminado`);
    }
  }
  controls.update();
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// --- UI --------------------------------------------------------------------
document.getElementById('btnNew').onclick = () => generate((Math.random() * 0xffffffff) >>> 0);
document.getElementById('btnReplay').onclick = replay;
document.getElementById('btnTarget').onclick = () => {
  ui.target.style.display = ui.target.style.display === 'block' ? 'none' : 'block';
};
function finish() {
  for (; nextStroke < strokes.length; nextStroke++) {
    engine.stampStroke(strokes[nextStroke], nextStroke);
  }
  surface.update();
  ui.bar.style.width = '100%';
  playing = false;
}

document.getElementById('btnFinish').onclick = finish;
addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') generate((Math.random() * 0xffffffff) >>> 0);
  if (e.key === ' ') { e.preventDefault(); replay(); }
  if (e.key === 'f' || e.key === 'F') finish();
  if (e.key === 't' || e.key === 'T') document.getElementById('btnTarget').onclick();
});

const hashSeed = parseInt(location.hash.slice(1), 10);
generate(Number.isFinite(hashSeed) ? hashSeed : (Math.random() * 0xffffffff) >>> 0);
