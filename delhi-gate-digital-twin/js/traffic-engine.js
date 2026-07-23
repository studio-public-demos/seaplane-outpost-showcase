import * as THREE from 'three';

const VEHICLE_COLORS = [
  0x1565c0, 0xc62828, 0xf9a825, 0x2e7d32, 0x4527a0,
  0xe65100, 0x00838f, 0x37474f, 0xffffff, 0xb71c1c,
  0xff6f00, 0x1b5e20
];

const VEHICLE_TYPES = [
  { name: 'car', length: 2.5, width: 1.2, height: 0.9, maxSpeed: 8, color: VEHICLE_COLORS, weight: 60 },
  { name: 'auto', length: 2, width: 1, height: 1.2, maxSpeed: 5, color: [0xffa000, 0xff8f00], weight: 15 },
  { name: 'bus', length: 5, width: 1.5, height: 1.8, maxSpeed: 6, color: [0x1565c0, 0x0d47a1, 0xff6f00], weight: 10 },
  { name: 'bike', length: 1.5, width: 0.5, height: 0.6, maxSpeed: 7, color: [0x212121, 0x424242], weight: 10 },
  { name: 'truck', length: 5.5, width: 1.8, height: 2, maxSpeed: 5, color: [0x5d4037, 0x3e2723], weight: 5 },
];

export class TrafficEngine {
  constructor(scene) {
    this.scene = scene;
    this.roads = [];
    this.vehicles = [];
    this.vehiclePool = [];
    this.spawnRate = 15;
    this.spawnTimer = 0;
    this.heatmapVisible = false;
    this.heatmapMeshes = [];
    this.stats = { activeCount: 0, avgSpeed: 0, totalPassed: 0, avgWaitTime: 0, throughput: 0 };
    this.passedRecent = [];
    this.waitTimes = [];
    this.meshGroup = new THREE.Group();
    this.meshGroup.name = 'vehicles';
    scene.add(this.meshGroup);
    this.heatmapGroup = new THREE.Group();
    this.heatmapGroup.name = 'heatmap';
    this.heatmapGroup.visible = false;
    scene.add(this.heatmapGroup);
  }

  init() {}

  addRoad(roadDef) {
    const road = {
      points: roadDef.points.map(p => new THREE.Vector3(p[0], 0, p[1])),
      width: roadDef.width || 8,
      name: roadDef.name || '',
      lanes: []
    };
    for (let i = 0; i < road.points.length - 1; i++) {
      const a = road.points[i], b = road.points[i + 1];
      const dir = new THREE.Vector3().subVectors(b, a).normalize();
      const right = new THREE.Vector3(-dir.z, 0, dir.x);
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      road.lanes.push({
        start: a.clone(), end: b.clone(), dir: dir.clone(), right: right.clone(),
        length: a.distanceTo(b), mid: mid.clone()
      });
    }
    this.roads.push(road);
  }

  finalizeRoads() {
    this.buildHeatmap();
  }

  buildHeatmap() {
    this.heatmapGroup.children.forEach(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
    this.heatmapGroup.clear();
    this.heatmapMeshes = [];

    const size = 6;
    for (let x = -120; x <= 120; x += size) {
      for (let z = -120; z <= 120; z += size) {
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.MeshBasicMaterial({
          color: 0xff0000, transparent: true, opacity: 0, depthWrite: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.3, z);
        mesh.userData.heatValue = 0;
        this.heatmapGroup.add(mesh);
        this.heatmapMeshes.push(mesh);
      }
    }
  }

  setHeatmap(visible) {
    this.heatmapVisible = visible;
    this.heatmapGroup.visible = visible;
  }

  setSpawnRate(rate) {
    this.spawnRate = rate;
  }

  update(dt, simTime) {
    this.spawnTimer += dt;
    const spawnInterval = 60 / this.spawnRate;
    while (this.spawnTimer >= spawnInterval) {
      this.spawnTimer -= spawnInterval;
      this.spawnVehicle();
    }
    this.updateVehicles(dt, simTime);
    this.updateHeatmap(dt);
    this.computeStats();
  }

  spawnVehicle() {
    if (this.roads.length === 0) return;
    if (this.vehicles.length > 200) return;

    const roadIdx = Math.floor(Math.random() * this.roads.length);
    const road = this.roads[roadIdx];
    if (road.lanes.length === 0) return;

    const laneIdx = Math.floor(Math.random() * road.lanes.length);
    const lane = road.lanes[laneIdx];
    const fromStart = Math.random() > 0.5;

    const type = this.pickVehicleType();
    const colorArr = Array.isArray(type.color) ? type.color : [type.color];
    const color = colorArr[Math.floor(Math.random() * colorArr.length)];

    const mesh = this.createVehicleMesh(type, color);
    const progress = Math.random() * 0.3;
    const pos = fromStart
      ? lane.start.clone().addScaledVector(lane.dir, lane.length * progress)
      : lane.end.clone().addScaledVector(lane.dir, -lane.length * progress);

    const offset = (Math.random() - 0.5) * (road.width * 0.3);
    pos.addScaledVector(lane.right, offset);
    pos.y = type.height / 2 + 0.1;

    mesh.position.copy(pos);
    if (!fromStart) {
      const lookDir = lane.dir.clone().negate();
      mesh.lookAt(pos.clone().add(lookDir));
    } else {
      mesh.lookAt(pos.clone().add(lane.dir));
    }

    this.meshGroup.add(mesh);

    this.vehicles.push({
      mesh, type, lane, roadIdx, laneIdx,
      fromStart, progress,
      speed: type.maxSpeed * (0.5 + Math.random() * 0.5),
      targetSpeed: type.maxSpeed,
      state: 'moving',
      waitTime: 0,
      lifetime: 0
    });
  }

  pickVehicleType() {
    const totalWeight = VEHICLE_TYPES.reduce((s, t) => s + t.weight, 0);
    let r = Math.random() * totalWeight;
    for (const type of VEHICLE_TYPES) {
      r -= type.weight;
      if (r <= 0) return type;
    }
    return VEHICLE_TYPES[0];
  }

  createVehicleMesh(type, color) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.3 });

    if (type.name === 'car') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(type.width, type.height * 0.6, type.length), mat);
      body.position.y = type.height * 0.3;
      group.add(body);
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(type.width * 0.8, type.height * 0.4, type.length * 0.5),
        new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.3, metalness: 0.5 })
      );
      cabin.position.set(0, type.height * 0.8, -type.length * 0.05);
      group.add(cabin);
    } else if (type.name === 'auto') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(type.width, type.height * 0.5, type.length), mat);
      body.position.y = type.height * 0.35;
      group.add(body);
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(type.width * 0.5, type.height * 0.4, 4),
        mat
      );
      roof.position.y = type.height * 0.8;
      roof.rotation.y = Math.PI / 4;
      group.add(roof);
    } else if (type.name === 'bus') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(type.width, type.height, type.length), mat);
      body.position.y = type.height / 2;
      group.add(body);
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x1a237e, roughness: 0.2, metalness: 0.6 });
      for (let z = -type.length * 0.3; z <= type.length * 0.3; z += type.length * 0.2) {
        for (let s = -1; s <= 1; s += 2) {
          const win = new THREE.Mesh(new THREE.BoxGeometry(0.05, type.height * 0.3, type.length * 0.12), windowMat);
          win.position.set(s * type.width / 2, type.height * 0.65, z);
          group.add(win);
        }
      }
    } else if (type.name === 'bike') {
      const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, type.length, 6), mat);
      frame.rotation.z = Math.PI / 2;
      frame.position.y = type.height * 0.6;
      group.add(frame);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
      [-type.length * 0.35, type.length * 0.35].forEach(z => {
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 12), wheelMat);
        wheel.position.set(0, 0.2, z);
        wheel.rotation.y = Math.PI / 2;
        group.add(wheel);
      });
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(type.width, type.height * 0.7, type.length), mat);
      body.position.y = type.height * 0.55;
      group.add(body);
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(type.width * 0.9, type.height * 0.4, type.length * 0.3),
        new THREE.MeshStandardMaterial({ color: 0x37474f })
      );
      cab.position.set(0, type.height * 0.9, type.length * 0.3);
      group.add(cab);
    }

    group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
    return group;
  }

  updateVehicles(dt, simTime) {
    const toRemove = [];
    this.vehicles.forEach((v, idx) => {
      v.lifetime += dt;
      if (v.lifetime > 300) { toRemove.push(idx); return; }

      const lane = v.lane;
      const speedFactor = v.type.maxSpeed / 8;
      const congestion = this.getNearbyCount(v.mesh.position, 5) / 10;
      v.targetSpeed = v.type.maxSpeed * (1 - congestion * 0.7);
      v.speed += (v.targetSpeed - v.speed) * dt * 2;
      v.speed = Math.max(0.5, v.speed);

      const moveDir = v.fromStart ? 1 : -1;
      v.progress += (v.speed * dt / lane.length) * moveDir;

      const pos = v.fromStart
        ? lane.start.clone().addScaledVector(lane.dir, lane.length * v.progress)
        : lane.end.clone().addScaledVector(lane.dir, -lane.length * v.progress);

      const offset = (Math.random() - 0.5) * 0.1;
      pos.addScaledVector(lane.right, offset);
      pos.y = v.type.height / 2 + 0.1;

      v.mesh.position.lerp(pos, 0.3);

      const lookDir = v.fromStart ? lane.dir.clone() : lane.dir.clone().negate();
      const target = v.mesh.position.clone().add(lookDir);
      v.mesh.lookAt(target);

      if (v.progress < -0.05 || v.progress > 1.05) {
        toRemove.push(idx);
        this.stats.totalPassed++;
        this.passedRecent.push(simTime);
        this.waitTimes.push(v.waitTime);
      }
    });

    for (let i = toRemove.length - 1; i >= 0; i--) {
      const v = this.vehicles.splice(toRemove[i], 1)[0];
      this.meshGroup.remove(v.mesh);
      v.mesh.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
  }

  getNearbyCount(pos, radius) {
    let count = 0;
    for (const v of this.vehicles) {
      if (v.mesh.position.distanceTo(pos) < radius) count++;
    }
    return count;
  }

  updateHeatmap(dt) {
    if (!this.heatmapVisible) return;
    this.heatmapMeshes.forEach(hm => {
      hm.userData.heatValue *= 0.98;
    });
    this.vehicles.forEach(v => {
      const px = v.mesh.position.x;
      const pz = v.mesh.position.z;
      this.heatmapMeshes.forEach(hm => {
        const dx = hm.position.x - px;
        const dz = hm.position.z - pz;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 10) {
          hm.userData.heatValue += dt * (1 - dist / 10);
          hm.userData.heatValue = Math.min(hm.userData.heatValue, 1);
        }
      });
    });
    this.heatmapMeshes.forEach(hm => {
      const val = Math.min(hm.userData.heatValue, 1);
      hm.material.color.setHSL(0.66 - val * 0.66, 0.8, 0.3 + val * 0.3);
      hm.material.opacity = val * 0.6;
    });
  }

  computeStats() {
    const active = this.vehicles.length;
    const avgSpeed = active > 0
      ? this.vehicles.reduce((s, v) => s + v.speed, 0) / active * 3.6
      : 0;
    const now = performance.now() / 1000;
    this.passedRecent = this.passedRecent.filter(t => now - t < 60);
    const throughput = this.passedRecent.length;
    const avgWait = this.waitTimes.length > 0
      ? this.waitTimes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(this.waitTimes.length, 50)
      : 0;

    this.stats = { activeCount: active, avgSpeed, totalPassed: this.stats.totalPassed, avgWaitTime: avgWait, throughput };
  }

  getStats() { return { ...this.stats }; }

  reset() {
    this.vehicles.forEach(v => {
      this.meshGroup.remove(v.mesh);
      v.mesh.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    });
    this.vehicles = [];
    this.stats = { activeCount: 0, avgSpeed: 0, totalPassed: 0, avgWaitTime: 0, throughput: 0 };
    this.passedRecent = [];
    this.waitTimes = [];
  }
}
