import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildDelhiGate } from './delhi-gate-model.js';
import { TrafficEngine } from './traffic-engine.js';
import { loadOSMData } from './osm-loader.js';
import { Analytics } from './analytics.js';

const DELHI_GATE_LAT = 28.6358;
const DELHI_GATE_LON = 77.2410;
const SCALE = 500;

let scene, camera, renderer, controls;
let gateGroup, roadMeshes = [], buildingMeshes = [];
let trafficEngine, analytics;
let running = true;
let simTime = 0;
const clock = new THREE.Clock();

function init() {
  const canvas = document.getElementById('three-canvas');
  const viewport = document.getElementById('viewport');

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a2332);
  scene.fog = new THREE.FogExp2(0x1a2332, 0.008);

  camera = new THREE.PerspectiveCamera(50, viewport.clientWidth / viewport.clientHeight, 0.1, 1000);
  camera.position.set(80, 60, 80);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 5, 0);
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 15;
  controls.maxDistance = 200;

  setupLighting();
  buildGround();
  buildDelhiGateModel();
  setupTraffic();
  setupAnalytics();
  bindControls();
  loadOSMEnvironment();
  animate();
  hideLoading();
}

function setupLighting() {
  const ambient = new THREE.AmbientLight(0x4a5568, 0.6);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x2d3748, 0.4);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
  sun.position.set(40, 60, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 200;
  sun.shadow.camera.left = -80;
  sun.shadow.camera.right = 80;
  sun.shadow.camera.top = 80;
  sun.shadow.camera.bottom = -80;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x4488cc, 0.3);
  fill.position.set(-30, 40, -20);
  scene.add(fill);

  const point = new THREE.PointLight(0xff8844, 0.5, 50);
  point.position.set(0, 15, 0);
  scene.add(point);
}

function buildGround() {
  const groundGeo = new THREE.PlaneGeometry(400, 400);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2d3748, roughness: 0.9, metalness: 0.1
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const gridHelper = new THREE.GridHelper(400, 80, 0x374151, 0x1f2937);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);
}

function buildDelhiGateModel() {
  gateGroup = new THREE.Mesh();
  gateGroup.name = 'delhi-gate';
  const gate = buildDelhiGate();
  gateGroup.add(gate);
  scene.add(gateGroup);
}

function setupTraffic() {
  trafficEngine = new TrafficEngine(scene);
  trafficEngine.init();
}

function setupAnalytics() {
  analytics = new Analytics();
}

async function loadOSMEnvironment() {
  updateLoading('Fetching OpenStreetMap data...');
  try {
    const data = await loadOSMData(DELHI_GATE_LAT, DELHI_GATE_LON, 500);
    if (data.roads) {
      data.roads.forEach(road => {
        const mesh = createRoadMesh(road);
        if (mesh) {
          roadMeshes.push(mesh);
          scene.add(mesh);
          trafficEngine.addRoad(road);
        }
      });
    }
    if (data.buildings) {
      data.buildings.forEach(b => {
        const mesh = createBuildingMesh(b);
        if (mesh) {
          buildingMeshes.push(mesh);
          scene.add(mesh);
        }
      });
    }
  } catch (e) {
    console.warn('OSM fetch failed, using procedural layout:', e.message);
    buildProceduralRoads();
    buildProceduralBuildings();
  }
  trafficEngine.finalizeRoads();
}

function buildProceduralRoads() {
  const roadDefs = [
    { points: [[0, -120], [0, -50], [0, 0], [0, 50], [0, 120]], width: 12, name: 'Rajpath (North-South)' },
    { points: [[-120, 0], [-50, 0], [0, 0], [50, 0], [120, 0]], width: 10, name: 'East-West Road' },
    { points: [[-100, 40], [-40, 40], [0, 25]], width: 8, name: 'NW Approach' },
    { points: [[100, 40], [40, 40], [0, 25]], width: 8, name: 'NE Approach' },
    { points: [[-100, -40], [-40, -40], [0, -25]], width: 8, name: 'SW Approach' },
    { points: [[100, -40], [40, -40], [0, -25]], width: 8, name: 'SE Approach' },
  ];
  roadDefs.forEach(road => {
    const mesh = createRoadMesh(road);
    if (mesh) {
      roadMeshes.push(mesh);
      scene.add(mesh);
      trafficEngine.addRoad(road);
    }
  });
}

function buildProceduralBuildings() {
  const buildingDefs = [
    { x: -45, z: 30, w: 15, d: 12, h: 12 },
    { x: -45, z: -30, w: 12, d: 10, h: 8 },
    { x: 45, z: 30, w: 14, d: 11, h: 15 },
    { x: 45, z: -30, w: 10, d: 14, h: 10 },
    { x: -35, z: 60, w: 18, d: 14, h: 20 },
    { x: 35, z: 60, w: 16, d: 12, h: 18 },
    { x: -35, z: -60, w: 14, d: 16, h: 14 },
    { x: 35, z: -60, w: 20, d: 10, h: 16 },
    { x: -70, z: 0, w: 12, d: 20, h: 10 },
    { x: 70, z: 0, w: 15, d: 18, h: 22 },
  ];
  buildingDefs.forEach(b => {
    const mesh = createBuildingMesh(b);
    if (mesh) {
      buildingMeshes.push(mesh);
      scene.add(mesh);
    }
  });
}

function createRoadMesh(road) {
  if (!road.points || road.points.length < 2) return null;
  const width = road.width || 8;
  const shape = new THREE.Shape();
  const pts = road.points;
  const left = [], right = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const nx = -dz / len * width / 2, nz = dx / len * width / 2;
    left.push([x1 + nx, z1 + nz]);
    right.push([x1 - nx, z1 - nz]);
  }
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const dx = last[0] - prev[0], dz = last[1] - prev[1];
  const len = Math.sqrt(dx * dx + dz * dz);
  const nx = -dz / len * width / 2, nz = dx / len * width / 2;
  left.push([last[0] + nx, last[1] + nz]);
  right.push([last[0] - nx, last[1] - nz]);

  shape.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < left.length; i++) shape.lineTo(left[i][0], left[i][1]);
  for (let i = right.length - 1; i >= 0; i--) shape.lineTo(right[i][0], right[i][1]);
  shape.closePath();

  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x37474f, roughness: 0.8, metalness: 0.2
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.05;
  mesh.receiveShadow = true;
  mesh.userData.road = road;
  return mesh;
}

function createBuildingMesh(b) {
  const h = b.h || (5 + Math.random() * 15);
  const w = b.w || (6 + Math.random() * 10);
  const d = b.d || (6 + Math.random() * 10);
  const geo = new THREE.BoxGeometry(w, h, d);
  const hue = 0.55 + Math.random() * 0.1;
  const color = new THREE.Color().setHSL(hue, 0.15, 0.25 + Math.random() * 0.15);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(b.x || 0, h / 2, b.z || 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function updateLightingForTime(hour) {
  const sun = scene.children.find(c => c.isDirectionalLight && c.intensity > 0.5);
  if (!sun) return;
  const t = (hour - 6) / 12;
  const angle = t * Math.PI;
  sun.position.set(Math.cos(angle) * 60, Math.max(Math.sin(angle) * 60, 2), 30);
  const nightFactor = hour < 6 || hour > 19 ? 0.2 : (hour < 8 || hour > 17 ? 0.6 : 1.0);
  sun.intensity = 1.2 * nightFactor;
  const warmTint = hour < 8 || hour > 17 ? 0xff9944 : 0xfff4e0;
  sun.color.setHex(warmTint);
  scene.background.setHex(hour > 19 || hour < 6 ? 0x0a0e17 : 0x1a2332);
  scene.fog.color.copy(scene.background);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (running) {
    const simSpeed = parseFloat(document.getElementById('sim-speed').value);
    const dt = delta * simSpeed;
    simTime += dt;
    trafficEngine.update(dt, simTime);
    updateStats();
    analytics.update(trafficEngine.getStats());
  }
  controls.update();
  renderer.render(scene, camera);
}

function updateStats() {
  const stats = trafficEngine.getStats();
  document.getElementById('stat-vehicles').textContent = stats.activeCount;
  document.getElementById('stat-speed').textContent = stats.avgSpeed.toFixed(1) + ' km/h';
  document.getElementById('stat-density').textContent =
    stats.activeCount < 20 ? 'Low' : stats.activeCount < 50 ? 'Medium' : 'High';
  const mins = Math.floor(simTime / 60);
  const secs = Math.floor(simTime % 60);
  document.getElementById('stat-time').textContent =
    String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

function bindControls() {
  document.getElementById('sim-speed').addEventListener('input', e => {
    document.getElementById('sim-speed-val').textContent = parseFloat(e.target.value).toFixed(1) + 'x';
  });
  document.getElementById('traffic-volume').addEventListener('input', e => {
    document.getElementById('traffic-volume-val').textContent = e.target.value + ' veh/min';
    trafficEngine.setSpawnRate(parseInt(e.target.value));
  });
  document.getElementById('time-of-day').addEventListener('input', e => {
    const hour = parseFloat(e.target.value);
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    document.getElementById('time-of-day-val').textContent =
      String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    updateLightingForTime(hour);
  });
  document.getElementById('btn-play').addEventListener('click', e => {
    running = !running;
    e.target.textContent = running ? 'Pause' : 'Play';
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    trafficEngine.reset();
    simTime = 0;
    analytics.reset();
  });
  document.getElementById('show-buildings').addEventListener('change', e => {
    buildingMeshes.forEach(m => m.visible = e.target.checked);
  });
  document.getElementById('show-roads').addEventListener('change', e => {
    roadMeshes.forEach(m => m.visible = e.target.checked);
  });
  document.getElementById('show-gate').addEventListener('change', e => {
    gateGroup.visible = e.target.checked;
  });
  document.getElementById('show-heatmap').addEventListener('change', e => {
    trafficEngine.setHeatmap(e.target.checked);
  });
}

function updateLoading(msg) {
  document.getElementById('loading-status').textContent = msg;
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

window.addEventListener('resize', () => {
  const vp = document.getElementById('viewport');
  camera.aspect = vp.clientWidth / vp.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(vp.clientWidth, vp.clientHeight);
});

init();
