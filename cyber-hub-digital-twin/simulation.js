import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================================
// 1. CYBER HUB GURGAON - GEOGRAPHIC DATA
// ============================================================================

const CYBER_HUB_CENTER = { lat: 28.4595, lng: 77.0266 };
const SCALE = 1;
const LAT_TO_M = 111320;
const LNG_TO_M = 111320 * Math.cos(CYBER_HUB_CENTER.lat * Math.PI / 180);

function geoToLocal(lat, lng) {
    return {
        x: (lng - CYBER_HUB_CENTER.lng) * LNG_TO_M * SCALE,
        z: -(lat - CYBER_HUB_CENTER.lat) * LAT_TO_M * SCALE
    };
}

// ============================================================================
// 2. BUILDING & LANDMARK DATA FOR CYBER HUB COMPLEX
// ============================================================================

const buildings = [
    { name: "Cyber Hub Tower A", x: -30, z: -20, w: 40, d: 30, h: 60, color: 0x4a7ab5, type: "office" },
    { name: "Cyber Hub Tower B", x: 20, z: -25, w: 35, d: 28, h: 55, color: 0x5080b0, type: "office" },
    { name: "Cyber Hub Mall", x: -10, z: 15, w: 60, d: 35, h: 30, color: 0xc87dd4, type: "mall" },
    { name: "DLF Building 1", x: -80, z: -40, w: 25, d: 25, h: 45, color: 0x5a9ac0, type: "office" },
    { name: "DLF Building 2", x: -80, z: 10, w: 25, d: 25, h: 50, color: 0x60a0c8, type: "office" },
    { name: "DLF Building 3", x: -80, z: 60, w: 25, d: 25, h: 40, color: 0x5595b8, type: "office" },
    { name: "Sohna Road Tower 1", x: 70, z: -10, w: 20, d: 20, h: 35, color: 0x70b0d0, type: "commercial" },
    { name: "Sohna Road Tower 2", x: 70, z: 40, w: 22, d: 22, h: 42, color: 0x78b8d8, type: "commercial" },
    { name: "Cyber City Phase 1", x: 100, z: -50, w: 30, d: 25, h: 48, color: 0x4890b0, type: "it-park" },
    { name: "Cyber City Phase 2", x: 130, z: -30, w: 30, d: 25, h: 52, color: 0x5098b8, type: "it-park" },
    { name: "Ambience Mall", x: 50, z: -80, w: 50, d: 40, h: 25, color: 0xd47070, type: "mall" },
    { name: "Leela Palace Hotel", x: -50, z: -70, w: 35, d: 30, h: 38, color: 0xd4a850, type: "hotel" },
    { name: "Gateway Tower", x: 10, z: -60, w: 22, d: 22, h: 44, color: 0x60a8c8, type: "office" },
    { name: "One Horizon Center", x: -40, z: 60, w: 28, d: 28, h: 40, color: 0x5898c0, type: "office" },
    { name: "Unitech World Spa", x: 100, z: 60, w: 35, d: 30, h: 32, color: 0xb8a070, type: "residential" },
    { name: "Vipul Tech Square", x: -110, z: -10, w: 24, d: 20, h: 36, color: 0x4a90a8, type: "office" },
    { name: "Area 51 Office Complex", x: 130, z: 40, w: 26, d: 22, h: 30, color: 0x58a0b8, type: "office" },
    { name: "DLF Cyber City Metro", x: 60, z: 25, w: 45, d: 12, h: 8, color: 0x909090, type: "metro" },
];

// ============================================================================
// 3. ROAD NETWORK GRAPH
// ============================================================================

// Nodes: intersections and endpoints
const roadNodes = [
    { id: 0, x: -140, z: -30 },  // West entry (NH-48 direction)
    { id: 1, x: -80, z: -30 },   // DLF block junction
    { id: 2, x: -30, z: -30 },   // Cyber Hub Tower A junction
    { id: 3, x: 30, z: -30 },    // Cyber Hub Tower B junction
    { id: 4, x: 80, z: -30 },    // Sohna Rd junction
    { id: 5, x: 140, z: -30 },   // East entry
    { id: 6, x: -80, z: -60 },   // Leema Palace junction
    { id: 7, x: -30, z: -60 },   // Gateway junction
    { id: 8, x: 30, z: -60 },    // Ambience junction
    { id: 9, x: 80, z: -60 },    // Ambience East
    { id: 10, x: 130, z: -60 },  // Cyber City Phase 1 junction
    { id: 11, x: -30, z: 0 },    // Cyber Hub Mall west
    { id: 12, x: 30, z: 0 },     // Cyber Hub Mall east
    { id: 13, x: 80, z: 0 },     // Sohna Rd mid
    { id: 14, x: 130, z: 0 },    // Cyber City Phase 2
    { id: 15, x: -30, z: 40 },   // One Horizon junction
    { id: 16, x: 30, z: 40 },    // Metro station junction
    { id: 17, x: 80, z: 40 },    // South east junction
    { id: 18, x: 130, z: 40 },   // Area 51 junction
    { id: 19, x: 80, z: 80 },    // Unitech junction
    { id: 20, x: -140, z: 30 },  // South west entry
    { id: 21, x: -140, z: -60 }, // North west entry
];

// Edges: road segments [from, to, lanes, speed_limit_kmh]
const roadEdges = [
    // Main horizontal road (top) - Cyber Hub Main Road
    [0, 1, 3, 40], [1, 2, 3, 30], [2, 3, 3, 30], [3, 4, 3, 40], [4, 5, 3, 40],
    // Parallel road (middle)
    [6, 7, 2, 30], [7, 8, 2, 30], [8, 9, 2, 30], [9, 10, 2, 35],
    // Bottom road
    [11, 12, 2, 25], [12, 13, 2, 30], [13, 14, 2, 35],
    // South road
    [15, 16, 2, 25], [16, 17, 2, 30], [17, 18, 2, 30],
    // Vertical connectors
    [1, 6, 2, 30], [2, 7, 2, 25], [3, 8, 2, 25], [4, 9, 2, 30], [5, 10, 2, 35],
    [7, 11, 2, 25], [8, 12, 2, 25], [9, 13, 2, 30], [10, 14, 2, 35],
    [11, 15, 2, 25], [12, 16, 2, 25], [13, 17, 2, 25], [14, 18, 2, 30],
    [17, 19, 2, 25],
    // Entry roads
    [20, 15, 2, 40], [21, 6, 2, 40],
    // Cross connections
    [15, 11, 1, 20], [16, 12, 1, 20],
];

// Signalized intersections
const signalizedIntersections = [
    { nodeId: 2, name: "Cyber Hub Tower A Jn" },
    { nodeId: 3, name: "Cyber Hub Tower B Jn" },
    { nodeId: 7, name: "Gateway Tower Jn" },
    { nodeId: 8, name: "Ambience Jn" },
    { nodeId: 12, name: "Mall East Jn" },
    { nodeId: 13, name: "Sohna Rd Mid Jn" },
    { nodeId: 16, name: "Metro Station Jn" },
];

// ============================================================================
// 4. TRAFFIC SIGNAL SYSTEM
// ============================================================================

class TrafficSignal {
    constructor(nodeId, name) {
        this.nodeId = nodeId;
        this.name = name;
        this.phase = 0; // 0 = NS green, 1 = NS yellow, 2 = EW green, 3 = EW yellow
        this.timer = 0;
        this.phases = [
            { duration: 30, color: 'green', direction: 'NS' },
            { duration: 3, color: 'yellow', direction: 'NS' },
            { duration: 25, color: 'green', direction: 'EW' },
            { duration: 3, color: 'yellow', direction: 'EW' },
        ];
        this.mesh = null;
    }

    update(dt) {
        this.timer += dt;
        const currentPhase = this.phases[this.phase];
        if (this.timer >= currentPhase.duration) {
            this.timer = 0;
            this.phase = (this.phase + 1) % this.phases.length;
            return true; // phase changed
        }
        return false;
    }

    getCurrentColor() {
        return this.phases[this.phase].color;
    }

    getDirectionColor(dir) {
        const current = this.phases[this.phase];
        if (current.color === 'red') return 'red';
        if (current.direction === dir) return current.color;
        return 'red';
    }
}

// ============================================================================
// 5. VEHICLE SYSTEM
// ============================================================================

const VEHICLE_TYPES = [
    { name: "car", length: 4.5, width: 1.8, height: 1.5, color: 0x2266cc, speed: 1.0 },
    { name: "sedan", length: 4.8, width: 1.8, height: 1.5, color: 0x3355bb, speed: 1.0 },
    { name: "suv", length: 5.0, width: 2.0, height: 1.8, color: 0x5533aa, speed: 0.95 },
    { name: "auto", length: 3.0, width: 1.5, height: 1.8, color: 0xeab308, speed: 0.7 },
    { name: "bus", length: 10.0, width: 2.5, height: 3.2, color: 0xdc2626, speed: 0.65 },
    { name: "truck", length: 7.0, width: 2.3, height: 2.8, color: 0x16a34a, speed: 0.6 },
    { name: "bike", length: 2.0, width: 0.8, height: 1.2, color: 0xdb2777, speed: 1.1 },
];

const CAR_COLORS = [
    0x2266cc, 0x3355bb, 0x6633cc, 0x0891b2, 0x059669,
    0xd97706, 0xdc2626, 0xdb2777, 0xea580c, 0xf5f5f5,
    0x334155, 0x78716c, 0xb91c1c, 0x2563eb
];

class Vehicle {
    constructor(path, type) {
        this.type = type || VEHICLE_TYPES[Math.floor(Math.random() * 3)];
        this.path = path; // array of node IDs
        this.pathIndex = 0;
        this.progress = 0; // 0-1 between current and next node
        this.speed = this.type.speed * (0.85 + Math.random() * 0.3);
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.waiting = false;
        this.waitTime = 0;
        this.alive = true;
        this.removed = false;

        this.mesh = this.createMesh();
        this.updatePosition();
    }

    createMesh() {
        const group = new THREE.Group();
        const { length, width, height } = this.type;

        // Body - brighter and more colorful
        const bodyGeo = new THREE.BoxGeometry(width, height * 0.6, length);
        const bodyMat = new THREE.MeshPhongMaterial({
            color: this.type.color === 0x2266cc || this.type.color === 0x3355bb
                ? CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]
                : this.type.color,
            shininess: 100,
            specular: 0x444444,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = height * 0.35;
        body.castShadow = true;
        group.add(body);

        // Cabin for cars - lighter glass
        if (this.type.name === "car" || this.type.name === "sedan" || this.type.name === "suv") {
            const cabinGeo = new THREE.BoxGeometry(width * 0.85, height * 0.35, length * 0.5);
            const cabinMat = new THREE.MeshPhongMaterial({
                color: 0x88bbee,
                shininess: 150,
                transparent: true,
                opacity: 0.6
            });
            const cabin = new THREE.Mesh(cabinGeo, cabinMat);
            cabin.position.y = height * 0.65;
            cabin.position.z = -length * 0.05;
            group.add(cabin);
        }

        // Headlights - brighter
        const headlightGeo = new THREE.BoxGeometry(width * 0.15, 0.18, 0.12);
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
        const hl1 = new THREE.Mesh(headlightGeo, headlightMat);
        hl1.position.set(width * 0.35, height * 0.35, -length / 2);
        group.add(hl1);
        const hl2 = new THREE.Mesh(headlightGeo, headlightMat);
        hl2.position.set(-width * 0.35, height * 0.35, -length / 2);
        group.add(hl2);

        // Tail lights - brighter red
        const tlMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
        const tl1 = new THREE.Mesh(headlightGeo, tlMat);
        tl1.position.set(width * 0.35, height * 0.35, length / 2);
        group.add(tl1);
        const tl2 = new THREE.Mesh(headlightGeo, tlMat);
        tl2.position.set(-width * 0.35, height * 0.35, length / 2);
        group.add(tl2);

        return group;
    }

    getNodePos(nodeId) {
        return roadNodes[nodeId];
    }

    update(dt, speedLimit, signals, vehicles) {
        if (!this.alive || this.pathIndex >= this.path.length - 1) {
            this.alive = false;
            return;
        }

        const fromNode = this.getNodePos(this.path[this.pathIndex]);
        const toNode = this.getNodePos(this.path[this.pathIndex + 1]);
        const dx = toNode.x - fromNode.x;
        const dz = toNode.z - fromNode.z;
        const segLen = Math.sqrt(dx * dx + dz * dz);

        this.targetSpeed = speedLimit * this.speed;

        // Check for traffic signal ahead
        const nextNodeId = this.path[this.pathIndex + 1];
        const signal = signals.find(s => s.nodeId === nextNodeId);
        if (signal && this.progress > 0.6) {
            const ewDir = Math.abs(dx) > Math.abs(dz);
            const dir = ewDir ? 'EW' : 'NS';
            const sigColor = signal.getDirectionColor(dir);
            if (sigColor === 'red' || sigColor === 'yellow') {
                this.targetSpeed = 0;
                this.waiting = true;
            }
        }

        // Check for vehicle ahead
        const lookAhead = this.type.length * 3;
        for (const other of vehicles) {
            if (other === this || !other.alive) continue;
            if (other.pathIndex !== this.pathIndex) continue;
            const otherProg = other.progress;
            if (otherProg > this.progress && (otherProg - this.progress) * segLen < lookAhead) {
                this.targetSpeed = Math.min(this.targetSpeed, other.currentSpeed * 0.8);
            }
        }

        // Smooth speed transition
        const accel = this.targetSpeed > this.currentSpeed ? 8 : 12;
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * Math.min(1, accel * dt);
        this.currentSpeed = Math.max(0, this.currentSpeed);

        if (this.currentSpeed < 0.5) {
            this.waiting = true;
            this.waitTime += dt;
        } else {
            this.waiting = false;
        }

        // Update progress
        const moveSpeed = this.currentSpeed / 3.6; // km/h to m/s
        this.progress += (moveSpeed * dt) / segLen;

        if (this.progress >= 1) {
            this.progress = 0;
            this.pathIndex++;
            if (this.pathIndex >= this.path.length - 1) {
                this.alive = false;
                return;
            }
        }

        this.updatePosition();
    }

    updatePosition() {
        if (this.pathIndex >= this.path.length - 1) return;

        const fromNode = this.getNodePos(this.path[this.pathIndex]);
        const toNode = this.getNodePos(this.path[this.pathIndex + 1]);

        const x = fromNode.x + (toNode.x - fromNode.x) * this.progress;
        const z = fromNode.z + (toNode.z - fromNode.z) * this.progress;
        const y = 0.05 + this.type.height * 0.3;

        this.mesh.position.set(x, y, z);

        // Rotate to face direction of travel
        const angle = Math.atan2(toNode.x - fromNode.x, toNode.z - fromNode.z);
        this.mesh.rotation.y = angle;
    }

    dispose(scene) {
        if (this.mesh.parent) {
            scene.remove(this.mesh);
        }
        this.mesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

// ============================================================================
// 6. PATHFINDING
// ============================================================================

function buildAdjacency() {
    const adj = {};
    roadNodes.forEach(n => adj[n.id] = []);
    roadEdges.forEach(([from, to]) => {
        adj[from].push(to);
        adj[to].push(from);
    });
    return adj;
}

const adjacency = buildAdjacency();

function findRandomPath() {
    const startNodes = roadNodes.filter(n =>
        n.x <= -120 || n.x >= 120 || n.z <= -55 || n.z >= 70
    );
    if (startNodes.length === 0) return [0, 1, 2, 3, 4, 5];

    const start = startNodes[Math.floor(Math.random() * startNodes.length)];
    const visited = new Set();
    const queue = [[start.id]];
    visited.add(start.id);

    let candidates = [];

    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];
        const pos = roadNodes[current];

        if (path.length > 3 && (
            pos.x <= -120 || pos.x >= 120 || pos.z <= -55 || pos.z >= 70
        )) {
            candidates.push(path);
            if (candidates.length >= 3) break;
        }

        for (const neighbor of adjacency[current]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([...path, neighbor]);
            }
        }
    }

    if (candidates.length === 0) {
        // Fallback: simple path through the network
        const allIds = roadNodes.map(n => n.id);
        const shuffled = allIds.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(6, shuffled.length));
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
}

// ============================================================================
// 7. MAIN APPLICATION
// ============================================================================

class CyberHubDigitalTwin {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();

        this.vehicles = [];
        this.signals = [];
        this.heatmapMeshes = [];
        this.roadNetworkLines = [];
        this.labelSprites = [];
        this.signalMeshes = [];

        this.simRunning = true;
        this.simSpeed = 1;
        this.simTime = 8;
        this.spawnRate = 20;
        this.speedLimit = 40;
        this.spawnAccumulator = 0;
        this.totalEntered = 0;
        this.totalExited = 0;

        this.showHeatmap = false;
        this.showSignals = true;
        this.showLabels = true;
        this.showRoadNetwork = false;

        this.fpsFrames = 0;
        this.fpsTime = 0;
        this.currentFps = 60;

        this.throughputHistory = new Array(60).fill(0);
        this.speedHistory = new Array(60).fill(30);
        this.throughputCounter = 0;
        this.throughputTimer = 0;

        this.scenario = "normal";

        this.init();
    }

    init() {
        this.initThree();
        this.buildScene();
        this.initSignals();
        this.buildRoadNetwork();
        this.buildHeatmap();
        this.buildLabels();
        this.initUI();
        this.animate();
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.0008);

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(-80, 120, 160);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 500;
        this.controls.target.set(0, 0, 0);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    buildScene() {
        // Ambient light - bright overall illumination
        const ambient = new THREE.AmbientLight(0xffffff, 2.0);
        this.scene.add(ambient);

        // Hemisphere light - sky/ground color bleed
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8fbc8f, 1.8);
        this.scene.add(hemiLight);

        // Directional sun - strong and warm
        this.sunLight = new THREE.DirectionalLight(0xfff5e0, 3.5);
        this.sunLight.position.set(100, 200, 80);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 600;
        const d = 200;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.sunLight.shadow.bias = -0.0005;
        this.scene.add(this.sunLight);

        // Fill light from opposite side
        const fillLight = new THREE.DirectionalLight(0xc8d8f0, 1.2);
        fillLight.position.set(-80, 100, -60);
        this.scene.add(fillLight);

        // Ground plane - light green grass
        const groundGeo = new THREE.PlaneGeometry(600, 400);
        const groundMat = new THREE.MeshPhongMaterial({
            color: 0x7cc87c,
            shininess: 5
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Roads
        this.buildRoads();

        // Buildings
        this.buildBuildings();

        // Sidewalks and landscaping
        this.buildSidewalks();
    }

    buildRoads() {
        const roadMat = new THREE.MeshPhongMaterial({ color: 0x444444, shininess: 10 });

        roadEdges.forEach(([fromId, toId, lanes]) => {
            const from = roadNodes[fromId];
            const to = roadNodes[toId];
            const dx = to.x - from.x;
            const dz = to.z - from.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dx, dz);
            const roadWidth = lanes * 3.5;

            const roadGeo = new THREE.BoxGeometry(roadWidth, 0.1, length);
            const road = new THREE.Mesh(roadGeo, roadMat);
            road.position.set(
                (from.x + to.x) / 2,
                0.05,
                (from.z + to.z) / 2
            );
            road.rotation.y = angle;
            road.receiveShadow = true;
            this.scene.add(road);

            // Road markings (center line)
            if (lanes >= 2) {
                const markGeo = new THREE.BoxGeometry(0.2, 0.03, length - 2);
                const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
                const mark = new THREE.Mesh(markGeo, markMat);
                mark.position.set(
                    (from.x + to.x) / 2,
                    0.12,
                    (from.z + to.z) / 2
                );
                mark.rotation.y = angle;
                this.scene.add(mark);
            }

            // Edge lines - bright white
            for (const side of [-1, 1]) {
                const edgeGeo = new THREE.BoxGeometry(0.15, 0.03, length);
                const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
                const edge = new THREE.Mesh(edgeGeo, edgeMat);
                const perpX = Math.cos(angle) * (roadWidth / 2) * side;
                const perpZ = -Math.sin(angle) * (roadWidth / 2) * side;
                edge.position.set(
                    (from.x + to.x) / 2 + perpX,
                    0.12,
                    (from.z + to.z) / 2 + perpZ
                );
                edge.rotation.y = angle;
                this.scene.add(edge);
            }
        });
    }

    buildBuildings() {
        buildings.forEach(b => {
            const group = new THREE.Group();

            // Main structure - brighter materials
            const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
            const mat = new THREE.MeshPhongMaterial({
                color: b.color,
                shininess: 80,
                specular: 0x445566,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.y = b.h / 2;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);

            // Windows (grid pattern) - brighter and more visible
            const windowRows = Math.floor(b.h / 4);
            const windowCols = Math.floor(Math.max(b.w, b.d) / 5);
            const windowGeo = new THREE.PlaneGeometry(1.4, 1.8);

            // Front and back windows
            for (const face of [-1, 1]) {
                for (let row = 0; row < windowRows; row++) {
                    for (let col = 0; col < windowCols; col++) {
                        if (Math.random() > 0.8) continue;
                        const windowMat = new THREE.MeshBasicMaterial({
                            color: Math.random() > 0.4 ? 0xddeeff : 0xfff8e0,
                            transparent: true,
                            opacity: 0.85,
                            side: THREE.DoubleSide,
                        });
                        const win = new THREE.Mesh(windowGeo, windowMat);
                        win.position.set(
                            (col - windowCols / 2 + 0.5) * 4,
                            (row + 1) * 4,
                            (b.d / 2 + 0.1) * face
                        );
                        if (face === -1) win.rotation.y = Math.PI;
                        group.add(win);
                    }
                }
            }

            // Side windows
            const sideCols = Math.floor(b.d / 5);
            for (const face of [-1, 1]) {
                for (let row = 0; row < windowRows; row++) {
                    for (let col = 0; col < sideCols; col++) {
                        if (Math.random() > 0.8) continue;
                        const windowMat = new THREE.MeshBasicMaterial({
                            color: Math.random() > 0.4 ? 0xddeeff : 0xfff8e0,
                            transparent: true,
                            opacity: 0.85,
                            side: THREE.DoubleSide,
                        });
                        const win = new THREE.Mesh(windowGeo, windowMat);
                        win.position.set(
                            (b.w / 2 + 0.1) * face,
                            (row + 1) * 4,
                            (col - sideCols / 2 + 0.5) * 4
                        );
                        win.rotation.y = Math.PI / 2 * face;
                        group.add(win);
                    }
                }
            }

            // Rooftop accent - visible glowing top
            if (b.type === "office" || b.type === "it-park") {
                const accentGeo = new THREE.BoxGeometry(b.w * 0.8, 0.5, b.d * 0.8);
                const accentMat = new THREE.MeshPhongMaterial({
                    color: 0x4488cc,
                    emissive: 0x224466,
                    shininess: 100
                });
                const accent = new THREE.Mesh(accentGeo, accentMat);
                accent.position.y = b.h + 0.3;
                group.add(accent);
            }

            // Building base / podium
            const baseGeo = new THREE.BoxGeometry(b.w + 2, 2, b.d + 2);
            const baseMat = new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 20 });
            const base = new THREE.Mesh(baseGeo, baseMat);
            base.position.y = 1;
            base.receiveShadow = true;
            group.add(base);

            group.position.set(b.x, 0, b.z);
            this.scene.add(group);
        });
    }

    buildSidewalks() {
        const sidewalkMat = new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 15 });

        roadEdges.forEach(([fromId, toId, lanes]) => {
            const from = roadNodes[fromId];
            const to = roadNodes[toId];
            const dx = to.x - from.x;
            const dz = to.z - from.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dx, dz);
            const roadWidth = lanes * 3.5;
            const sidewalkWidth = 2;

            for (const side of [-1, 1]) {
                const swGeo = new THREE.BoxGeometry(sidewalkWidth, 0.25, length);
                const sw = new THREE.Mesh(swGeo, sidewalkMat);
                const perpX = Math.cos(angle) * (roadWidth / 2 + sidewalkWidth / 2) * side;
                const perpZ = -Math.sin(angle) * (roadWidth / 2 + sidewalkWidth / 2) * side;
                sw.position.set(
                    (from.x + to.x) / 2 + perpX,
                    0.12,
                    (from.z + to.z) / 2 + perpZ
                );
                sw.rotation.y = angle;
                sw.receiveShadow = true;
                this.scene.add(sw);
            }
        });

        // Trees / landscaping along roads
        const treeGeo = new THREE.SphereGeometry(2.5, 8, 8);
        const treeMat = new THREE.MeshPhongMaterial({ color: 0x2d8a4e, shininess: 10 });
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
        const trunkMat = new THREE.MeshPhongMaterial({ color: 0x6b4226, shininess: 5 });

        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 320;
            const z = (Math.random() - 0.5) * 220;

            let tooClose = false;
            for (const b of buildings) {
                const dx = x - b.x;
                const dz = z - b.z;
                if (Math.abs(dx) < b.w / 2 + 5 && Math.abs(dz) < b.d / 2 + 5) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;

            let onRoad = false;
            for (const [fromId, toId] of roadEdges) {
                const from = roadNodes[fromId];
                const to = roadNodes[toId];
                const segDx = to.x - from.x;
                const segDz = to.z - from.z;
                const segLen = Math.sqrt(segDx * segDx + segDz * segDz);
                const t = Math.max(0, Math.min(1,
                    ((x - from.x) * segDx + (z - from.z) * segDz) / (segLen * segLen)
                ));
                const closestX = from.x + t * segDx;
                const closestZ = from.z + t * segDz;
                const dist = Math.sqrt((x - closestX) ** 2 + (z - closestZ) ** 2);
                if (dist < 8) { onRoad = true; break; }
            }
            if (onRoad) continue;

            const tree = new THREE.Mesh(treeGeo, treeMat);
            tree.position.set(x, 5.5, z);
            tree.castShadow = true;
            this.scene.add(tree);

            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.set(x, 1.5, z);
            this.scene.add(trunk);
        }
    }

    buildRoadNetwork() {
        const lineMat = new THREE.LineBasicMaterial({ color: 0x22aa44, transparent: true, opacity: 0.7, linewidth: 2 });

        roadEdges.forEach(([fromId, toId]) => {
            const from = roadNodes[fromId];
            const to = roadNodes[toId];
            const points = [
                new THREE.Vector3(from.x, 0.3, from.z),
                new THREE.Vector3(to.x, 0.3, to.z)
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geo, lineMat);
            line.visible = false;
            this.scene.add(line);
            this.roadNetworkLines.push(line);
        });

        // Node markers - brighter
        const nodeGeo = new THREE.SphereGeometry(0.8, 12, 12);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0x22aa44, transparent: true, opacity: 0.7 });
        roadNodes.forEach(n => {
            const mesh = new THREE.Mesh(nodeGeo, nodeMat);
            mesh.position.set(n.x, 0.8, n.z);
            mesh.visible = false;
            this.scene.add(mesh);
            this.roadNetworkLines.push(mesh);
        });
    }

    initSignals() {
        signalizedIntersections.forEach(si => {
            const signal = new TrafficSignal(si.nodeId, si.name);
            this.signals.push(signal);

            const node = roadNodes[si.nodeId];

            // Signal pole - bright metallic
            const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 7, 8);
            const poleMat = new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 60 });
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.set(node.x + 6, 3.5, node.z + 6);
            pole.castShadow = true;
            this.scene.add(pole);

            // Signal housing - dark but visible
            const housingGeo = new THREE.BoxGeometry(1.2, 3, 0.9);
            const housingMat = new THREE.MeshPhongMaterial({ color: 0x2a2a2a, shininess: 30 });
            const housing = new THREE.Mesh(housingGeo, housingMat);
            housing.position.set(node.x + 6, 7.5, node.z + 6);
            this.scene.add(housing);

            // Signal lights - larger and brighter
            const lightColors = [0xff0000, 0xffff00, 0x00ff00];
            const lightMeshes = [];
            lightColors.forEach((color, i) => {
                const lightGeo = new THREE.SphereGeometry(0.4, 16, 16);
                const lightMat = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.25
                });
                const light = new THREE.Mesh(lightGeo, lightMat);
                light.position.set(node.x + 6, 8.8 - i * 0.9, node.z + 6 + 0.5);
                this.scene.add(light);
                lightMeshes.push(light);
            });

            signal.mesh = { pole, housing, lights: lightMeshes };
            this.signalMeshes.push(signal);
        });
    }

    updateSignals(dt) {
        this.signals.forEach(signal => {
            const changed = signal.update(dt);
            if (signal.mesh && signal.mesh.lights) {
                const colors = ['red', 'yellow', 'green'];
                const currentIdx = colors.indexOf(signal.getCurrentColor());
                signal.mesh.lights.forEach((light, i) => {
                    light.material.opacity = i === currentIdx ? 1.0 : 0.15;
                    light.material.emissive = new THREE.Color(i === currentIdx ? light.material.color : 0x000000);
                });
            }
        });
    }

    buildHeatmap() {
        const cellSize = 10;
        const gridW = 32;
        const gridH = 22;
        const offsetX = -160;
        const offsetZ = -110;

        for (let gx = 0; gx < gridW; gx++) {
            for (let gz = 0; gz < gridH; gz++) {
                const geo = new THREE.PlaneGeometry(cellSize - 0.5, cellSize - 0.5);
                const mat = new THREE.MeshBasicMaterial({
                    color: 0xff4444,
                    transparent: true,
                    opacity: 0,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.rotation.x = -Math.PI / 2;
                mesh.position.set(
                    offsetX + gx * cellSize + cellSize / 2,
                    0.4,
                    offsetZ + gz * cellSize + cellSize / 2
                );
                mesh.visible = false;
                this.scene.add(mesh);
                this.heatmapMeshes.push({ mesh, gx, gz, offsetX, offsetZ, cellSize });
            }
        }
    }

    updateHeatmap() {
        if (!this.showHeatmap) {
            this.heatmapMeshes.forEach(h => h.mesh.visible = false);
            return;
        }

        this.heatmapMeshes.forEach(h => {
            h.mesh.visible = true;
            const cellCenterX = h.offsetX + h.gx * h.cellSize + h.cellSize / 2;
            const cellCenterZ = h.offsetZ + h.gz * h.cellSize + h.cellSize / 2;

            let count = 0;
            this.vehicles.forEach(v => {
                if (!v.alive) return;
                const pos = v.mesh.position;
                if (Math.abs(pos.x - cellCenterX) < h.cellSize &&
                    Math.abs(pos.z - cellCenterZ) < h.cellSize) {
                    count++;
                    if (v.currentSpeed < 2) count += 2;
                }
            });

            const density = Math.min(1, count / 5);
            // Green -> Yellow -> Red gradient
            let r, g, b;
            if (density < 0.5) {
                r = density * 2;
                g = 1;
                b = 0;
            } else {
                r = 1;
                g = (1 - density) * 2;
                b = 0;
            }
            h.mesh.material.color.setRGB(r, g, b);
            h.mesh.material.opacity = 0.15 + density * 0.45;
        });
    }

    buildLabels() {
        buildings.forEach(b => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 128;
            // Light background for labels
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fillRect(0, 0, 512, 128);
            ctx.strokeStyle = 'rgba(0,100,200,0.6)';
            ctx.lineWidth = 3;
            ctx.strokeRect(2, 2, 508, 124);
            ctx.fillStyle = '#1a3a5a';
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(b.name, 256, 55);
            ctx.fillStyle = '#555555';
            ctx.font = '20px monospace';
            ctx.fillText(`${b.type.toUpperCase()} | ${b.h}m`, 256, 90);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95 });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.set(b.x, b.h + 6, b.z);
            sprite.scale.set(22, 5.5, 1);
            this.scene.add(sprite);
            this.labelSprites.push(sprite);
        });
    }

    spawnVehicle() {
        const path = findRandomPath();
        if (path.length < 2) return;

        const typeIdx = Math.random() < 0.6 ? Math.floor(Math.random() * 3) :
            Math.random() < 0.7 ? 3 :
            Math.random() < 0.8 ? 6 :
            Math.floor(Math.random() * VEHICLE_TYPES.length);

        const vehicle = new Vehicle(path, VEHICLE_TYPES[typeIdx]);
        this.vehicles.push(vehicle);
        this.scene.add(vehicle.mesh);
        this.totalEntered++;
        this.throughputCounter++;
    }

    updateVehicles(dt) {
        for (const v of this.vehicles) {
            if (!v.alive) continue;
            v.update(dt, this.speedLimit, this.signals, this.vehicles);
        }

        // Remove dead vehicles
        const toRemove = this.vehicles.filter(v => !v.alive);
        toRemove.forEach(v => {
            this.totalExited++;
            v.dispose(this.scene);
        });
        this.vehicles = this.vehicles.filter(v => v.alive);
    }

    getScenarioMultiplier() {
        const hour = this.simTime % 24;
        switch (this.scenario) {
            case 'rush-morning':
                return (hour >= 7 && hour <= 10) ? 3.5 : 0.8;
            case 'rush-evening':
                return (hour >= 17 && hour <= 20) ? 3.5 : 0.8;
            case 'event':
                return 2.5;
            case 'accident':
                return 1.5;
            default: {
                if (hour >= 7 && hour <= 10) return 2.5;
                if (hour >= 17 && hour <= 20) return 3.0;
                if (hour >= 22 || hour <= 5) return 0.3;
                return 1.0;
            }
        }
    }

    updateAnalytics() {
        const aliveVehicles = this.vehicles.filter(v => v.alive);
        const count = aliveVehicles.length;
        const avgSpeed = count > 0
            ? aliveVehicles.reduce((s, v) => s + v.currentSpeed, 0) / count
            : 0;

        let congestionLevel = "LOW";
        let congestionColor = "green";
        const congestionIndex = count > 0
            ? aliveVehicles.filter(v => v.currentSpeed < 3).length / count
            : 0;

        if (congestionIndex > 0.6) { congestionLevel = "CRITICAL"; congestionColor = "red"; }
        else if (congestionIndex > 0.35) { congestionLevel = "HIGH"; congestionColor = "red"; }
        else if (congestionIndex > 0.15) { congestionLevel = "MEDIUM"; congestionColor = "yellow"; }

        document.getElementById('vehicle-count').textContent = count;
        document.getElementById('stat-vehicles').textContent = count;
        document.getElementById('stat-avgspeed').textContent = avgSpeed.toFixed(1);
        document.getElementById('stat-congestion').textContent = congestionLevel;
        document.getElementById('stat-congestion').className = `stat-val ${congestionColor}`;
        document.getElementById('metric-entered').textContent = this.totalEntered;
        document.getElementById('metric-exited').textContent = this.totalExited;

        const avgWait = aliveVehicles.filter(v => v.waiting).reduce((s, v) => s + v.waitTime, 0) / Math.max(1, aliveVehicles.filter(v => v.waiting).length);
        document.getElementById('metric-wait').textContent = avgWait.toFixed(1) + 's';

        const maxQueue = Math.max(0, ...this.signals.map(s => {
            return this.vehicles.filter(v => v.alive && v.waiting && v.pathIndex < v.path.length - 1 && v.path[v.pathIndex + 1] === s.nodeId).length;
        }));
        document.getElementById('metric-queue').textContent = maxQueue;

        document.getElementById('metric-congestion').textContent = congestionIndex.toFixed(2);
        document.getElementById('metric-congestion').className = `metric-val ${congestionColor}`;

        // Update signal status panel
        const signalList = document.getElementById('signal-status-list');
        signalList.innerHTML = '';
        this.signals.forEach(s => {
            const color = s.getCurrentColor();
            const remaining = s.phases[s.phase].duration - s.timer;
            signalList.innerHTML += `
                <div class="signal-item">
                    <span class="signal-dot ${color}"></span>
                    <span class="signal-name">${s.name}</span>
                    <span class="signal-phase">${remaining.toFixed(0)}s</span>
                </div>
            `;
        });
    }

    updateCharts() {
        this.throughputTimer += 1 / 60;
        if (this.throughputTimer >= 1) {
            this.throughputHistory.push(this.throughputCounter);
            this.throughputHistory.shift();
            this.throughputCounter = 0;
            this.throughputTimer = 0;

            const alive = this.vehicles.filter(v => v.alive);
            const avg = alive.length > 0
                ? alive.reduce((s, v) => s + v.currentSpeed, 0) / alive.length
                : 0;
            this.speedHistory.push(avg);
            this.speedHistory.shift();
        }

        this.drawChart('chart-throughput', this.throughputHistory, 0x00f2fe, Math.max(60, ...this.throughputHistory));
        this.drawChart('chart-speed', this.speedHistory, 0x10b981, this.speedLimit);
    }

    drawChart(canvasId, data, color, maxVal) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Grid lines - light
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const y = (h / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Data line
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        ctx.beginPath();
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 2;
        data.forEach((val, i) => {
            const x = (i / (data.length - 1)) * w;
            const y = h - (val / maxVal) * h * 0.9;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Fill
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = `rgba(${r},${g},${b},0.12)`;
        ctx.fill();
    }

    updateLighting() {
        const hour = this.simTime % 24;
        const sunAngle = ((hour - 6) / 12) * Math.PI;

        const sunX = Math.cos(sunAngle) * 200;
        const sunY = Math.sin(sunAngle) * 200;
        this.sunLight.position.set(sunX, Math.max(20, sunY), 80);

        let sunIntensity, ambientIntensity, hemiIntensity, bgColor, fogColor;
        if (hour >= 6 && hour < 8) {
            // Sunrise
            sunIntensity = 1.5 + (hour - 6) * 1.0;
            ambientIntensity = 1.5 + (hour - 6) * 0.5;
            hemiIntensity = 1.2 + (hour - 6) * 0.4;
            bgColor = 0xa8d8f0;
            fogColor = 0xa8d8f0;
        } else if (hour >= 8 && hour < 17) {
            // Daytime - bright and clear
            sunIntensity = 3.5;
            ambientIntensity = 2.0;
            hemiIntensity = 1.8;
            bgColor = 0x87ceeb;
            fogColor = 0x87ceeb;
        } else if (hour >= 17 && hour < 20) {
            // Sunset
            sunIntensity = 3.5 - (hour - 17) * 0.8;
            ambientIntensity = 2.0 - (hour - 17) * 0.4;
            hemiIntensity = 1.8 - (hour - 17) * 0.3;
            bgColor = 0xf0a868;
            fogColor = 0xf0a868;
        } else {
            // Night - still visible, soft blue moonlight
            sunIntensity = 0.6;
            ambientIntensity = 0.8;
            hemiIntensity = 0.6;
            bgColor = 0x2a3050;
            fogColor = 0x2a3050;
        }

        this.sunLight.intensity = sunIntensity;
        this.scene.children.forEach(c => {
            if (c instanceof THREE.AmbientLight) c.intensity = ambientIntensity;
            if (c instanceof THREE.HemisphereLight) c.intensity = hemiIntensity;
        });
        this.scene.background.setHex(bgColor);
        if (this.scene.fog) this.scene.fog.color.setHex(fogColor);
    }

    initUI() {
        // Play/Pause
        document.getElementById('btn-play-pause').addEventListener('click', () => {
            this.simRunning = !this.simRunning;
            const btn = document.getElementById('btn-play-pause');
            if (this.simRunning) {
                btn.innerHTML = '<i data-lucide="pause"></i> PAUSE SIMULATION';
                document.getElementById('sim-status').textContent = 'RUNNING';
                document.getElementById('sim-status').className = 'value green';
            } else {
                btn.innerHTML = '<i data-lucide="play"></i> RESUME SIMULATION';
                document.getElementById('sim-status').textContent = 'PAUSED';
                document.getElementById('sim-status').className = 'value yellow';
            }
            lucide.createIcons();
        });

        // Speed
        document.getElementById('param-speed').addEventListener('input', (e) => {
            this.simSpeed = parseInt(e.target.value);
            document.getElementById('speed-val').textContent = this.simSpeed + 'x';
        });

        // Time of day
        document.getElementById('param-time').addEventListener('input', (e) => {
            this.simTime = parseFloat(e.target.value);
            const h = Math.floor(this.simTime);
            const m = Math.floor((this.simTime % 1) * 60);
            document.getElementById('tod-val').textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            document.getElementById('sim-time').textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            this.updateLighting();
        });

        // Spawn rate
        document.getElementById('param-spawn').addEventListener('input', (e) => {
            this.spawnRate = parseInt(e.target.value);
            document.getElementById('spawn-val').textContent = this.spawnRate;
        });

        // Speed limit
        document.getElementById('param-speedlimit').addEventListener('input', (e) => {
            this.speedLimit = parseInt(e.target.value);
            document.getElementById('limit-val').textContent = this.speedLimit;
        });

        // Scenario
        document.getElementById('traffic-scenario').addEventListener('change', (e) => {
            this.scenario = e.target.value;
            this.addIncident(`Scenario changed to: ${e.target.value.toUpperCase()}`);
        });

        // Overlay toggles
        document.getElementById('toggle-heatmap').addEventListener('change', (e) => {
            this.showHeatmap = e.target.checked;
        });
        document.getElementById('toggle-signals').addEventListener('change', (e) => {
            this.showSignals = e.target.checked;
            this.signalMeshes.forEach(s => {
                if (s.mesh) {
                    s.mesh.pole.visible = this.showSignals;
                    s.mesh.housing.visible = this.showSignals;
                    s.mesh.lights.forEach(l => l.visible = this.showSignals);
                }
            });
        });
        document.getElementById('toggle-labels').addEventListener('change', (e) => {
            this.showLabels = e.target.checked;
            this.labelSprites.forEach(s => s.visible = this.showLabels);
        });
        document.getElementById('toggle-roadnetwork').addEventListener('change', (e) => {
            this.showRoadNetwork = e.target.checked;
            this.roadNetworkLines.forEach(l => l.visible = this.showRoadNetwork);
        });

        // Camera presets
        document.getElementById('btn-orbit').addEventListener('click', () => this.setCameraView('orbit'));
        document.getElementById('btn-top').addEventListener('click', () => this.setCameraView('top'));
        document.getElementById('btn-street').addEventListener('click', () => this.setCameraView('street'));

        document.getElementById('btn-reset-cam').addEventListener('click', () => this.setCameraView('orbit'));
        document.getElementById('btn-follow').addEventListener('click', () => this.setCameraView('follow'));
        document.getElementById('btn-clear').addEventListener('click', () => this.clearAll());

        lucide.createIcons();
    }

    setCameraView(view) {
        document.querySelectorAll('.view-controls .btn').forEach(b => b.classList.remove('active'));

        switch (view) {
            case 'orbit':
                document.getElementById('btn-orbit').classList.add('active');
                this.camera.position.set(-80, 120, 160);
                this.controls.target.set(0, 0, 0);
                break;
            case 'top':
                document.getElementById('btn-top').classList.add('active');
                this.camera.position.set(0, 200, 0.1);
                this.controls.target.set(0, 0, 0);
                break;
            case 'street':
                document.getElementById('btn-street').classList.add('active');
                this.camera.position.set(-25, 3, -28);
                this.controls.target.set(-25, 2, -60);
                break;
            case 'follow':
                document.getElementById('btn-follow').classList.add('active');
                if (this.vehicles.length > 0) {
                    const v = this.vehicles[Math.floor(Math.random() * this.vehicles.length)];
                    this.camera.position.copy(v.mesh.position).add(new THREE.Vector3(10, 8, 15));
                    this.controls.target.copy(v.mesh.position);
                    this.followVehicle = v;
                }
                break;
        }
    }

    addIncident(msg) {
        const log = document.getElementById('incident-log');
        const h = Math.floor(this.simTime);
        const m = Math.floor((this.simTime % 1) * 60);
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        log.innerHTML = `
            <div class="incident-item">
                <span class="incident-time">${time}</span>
                <span class="incident-msg">${msg}</span>
            </div>
        ` + log.innerHTML;

        if (log.children.length > 20) {
            log.removeChild(log.lastChild);
        }
    }

    clearAll() {
        this.vehicles.forEach(v => v.dispose(this.scene));
        this.vehicles = [];
        this.totalEntered = 0;
        this.totalExited = 0;
        this.addIncident('All vehicles cleared from simulation.');
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const rawDt = this.clock.getDelta();
        const dt = Math.min(rawDt, 0.05);

        // FPS counter
        this.fpsFrames++;
        this.fpsTime += rawDt;
        if (this.fpsTime >= 0.5) {
            this.currentFps = Math.round(this.fpsFrames / this.fpsTime);
            document.getElementById('fps-counter').textContent = this.currentFps;
            this.fpsFrames = 0;
            this.fpsTime = 0;
        }

        if (this.simRunning) {
            const simDt = dt * this.simSpeed;

            // Advance time
            this.simTime += simDt / 60;
            if (this.simTime >= 24) this.simTime -= 24;
            const h = Math.floor(this.simTime);
            const m = Math.floor((this.simTime % 1) * 60);
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            document.getElementById('sim-time').textContent = timeStr;

            this.updateSignals(simDt);
            this.updateVehicles(simDt);
            this.updateHeatmap();
            this.updateLighting();

            // Spawn vehicles
            const multiplier = this.getScenarioMultiplier();
            const effectiveRate = this.spawnRate * multiplier;
            this.spawnAccumulator += effectiveRate * simDt / 60;
            while (this.spawnAccumulator >= 1) {
                this.spawnAccumulator -= 1;
                if (this.vehicles.length < 200) {
                    this.spawnVehicle();
                }
            }

            // Follow vehicle camera
            if (this.followVehicle && this.followVehicle.alive) {
                const targetPos = this.followVehicle.mesh.position.clone();
                this.camera.position.lerp(targetPos.clone().add(new THREE.Vector3(10, 8, 15)), 0.05);
                this.controls.target.lerp(targetPos, 0.1);
            } else {
                this.followVehicle = null;
            }
        }

        this.controls.update();
        this.updateAnalytics();
        this.updateCharts();
        this.renderer.render(this.scene, this.camera);
    }
}

// ============================================================================
// 8. LAUNCH
// ============================================================================

const app = new CyberHubDigitalTwin();
