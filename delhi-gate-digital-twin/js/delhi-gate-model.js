import * as THREE from 'three';

export function buildDelhiGate() {
  const group = new THREE.Group();
  const sandstone = new THREE.MeshStandardMaterial({ color: 0xc4a06a, roughness: 0.85, metalness: 0.05 });
  const darkSand = new THREE.MeshStandardMaterial({ color: 0xa08050, roughness: 0.9, metalness: 0.05 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7, metalness: 0.1 });
  const redStone = new THREE.MeshStandardMaterial({ color: 0x8b3a2a, roughness: 0.8, metalness: 0.05 });

  const baseWidth = 16;
  const baseDepth = 8;
  const wallHeight = 14;
  const archHeight = 10;
  const archWidth = 5;
  const towerWidth = 4;
  const towerHeight = 22;

  const baseGeo = new THREE.BoxGeometry(baseWidth + 2, 1.5, baseDepth + 2);
  const base = new THREE.Mesh(baseGeo, sandstone);
  base.position.y = 0.75;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const wallGeo = new THREE.BoxGeometry(baseWidth, wallHeight, baseDepth);
  const wall = new THREE.Mesh(wallGeo, sandstone);
  wall.position.y = 1.5 + wallHeight / 2;
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);

  const archGroup = createArch(archWidth, archHeight, baseDepth, redStone);
  archGroup.position.set(0, 1.5, baseDepth / 2 + 0.1);
  group.add(archGroup);

  const archBack = createArch(archWidth, archHeight, baseDepth, redStone);
  archBack.position.set(0, 1.5, -(baseDepth / 2 + 0.1));
  archBack.rotation.y = Math.PI;
  group.add(archBack);

  const towerGeo = new THREE.BoxGeometry(towerWidth, towerHeight, towerWidth);
  const towerPositions = [
    [-(baseWidth / 2 + towerWidth / 2), 1.5 + towerHeight / 2, baseDepth / 2 + towerWidth / 2],
    [(baseWidth / 2 + towerWidth / 2), 1.5 + towerHeight / 2, baseDepth / 2 + towerWidth / 2],
    [-(baseWidth / 2 + towerWidth / 2), 1.5 + towerHeight / 2, -(baseDepth / 2 + towerWidth / 2]],
    [(baseWidth / 2 + towerWidth / 2), 1.5 + towerHeight / 2, -(baseDepth / 2 + towerWidth / 2]],
  ];
  towerPositions.forEach(pos => {
    const tower = new THREE.Mesh(towerGeo, darkSand);
    tower.position.set(...pos);
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    const dome = createDome(towerWidth * 0.8, accent);
    dome.position.set(pos[0], pos[1] + towerHeight / 2 + towerWidth * 0.4, pos[2]);
    group.add(dome);
  });

  const battlementGeo = new THREE.BoxGeometry(1.2, 1.5, 0.6);
  for (let x = -baseWidth / 2 + 1; x <= baseWidth / 2 - 1; x += 2) {
    const b = new THREE.Mesh(battlementGeo, sandstone);
    b.position.set(x, 1.5 + wallHeight + 0.75, baseDepth / 2);
    b.castShadow = true;
    group.add(b);
    const b2 = new THREE.Mesh(battlementGeo, sandstone);
    b2.position.set(x, 1.5 + wallHeight + 0.75, -baseDepth / 2);
    b2.castShadow = true;
    group.add(b2);
  }

  const detailGeo = new THREE.BoxGeometry(baseWidth + 0.5, 0.6, baseDepth + 0.5);
  const detail = new THREE.Mesh(detailGeo, accent);
  detail.position.y = 1.5 + wallHeight;
  detail.castShadow = true;
  group.add(detail);

  addDecorativeElements(group, sandstone, accent, baseWidth, wallHeight);

  const chattris = [
    [-(baseWidth / 2 - 2), 1.5 + wallHeight + 3, 0],
    [(baseWidth / 2 - 2), 1.5 + wallHeight + 3, 0],
  ];
  chattris.forEach(pos => {
    const chattri = createChattri(2.5, accent, sandstone);
    chattri.position.set(...pos);
    group.add(chattri);
  });

  group.position.set(0, 0, 0);
  return group;
}

function createArch(width, height, depth, material) {
  const group = new THREE.Group();
  const archShape = new THREE.Shape();
  archShape.moveTo(-width / 2, 0);
  archShape.lineTo(-width / 2, height * 0.6);
  archShape.quadraticCurveTo(-width / 2, height, 0, height);
  archShape.quadraticCurveTo(width / 2, height, width / 2, height * 0.6);
  archShape.lineTo(width / 2, 0);
  archShape.lineTo(width / 2 - 0.8, 0);
  archShape.lineTo(width / 2 - 0.8, height * 0.6);
  archShape.quadraticCurveTo(width / 2 - 0.8, height - 0.5, 0, height - 0.5);
  archShape.quadraticCurveTo(-width / 2 + 0.8, height - 0.5, -width / 2 + 0.8, height * 0.6);
  archShape.lineTo(-width / 2 + 0.8, 0);
  archShape.closePath();

  const extrudeSettings = { depth: 0.5, bevelEnabled: false };
  const archGeo = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
  const arch = new THREE.Mesh(archGeo, material);
  arch.castShadow = true;
  group.add(arch);
  return group;
}

function createDome(radius, material) {
  const group = new THREE.Group();
  const domeGeo = new THREE.SphereGeometry(radius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, material);
  group.add(dome);

  const finialGeo = new THREE.ConeGeometry(radius * 0.15, radius * 0.6, 8);
  const finial = new THREE.Mesh(finialGeo, material);
  finial.position.y = radius * 0.5;
  group.add(finial);
  return group;
}

function createChattri(radius, roofMat, pillarMat) {
  const group = new THREE.Group();
  const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, radius * 0.8, 6);
  const offsets = [[-radius * 0.35, 0], [radius * 0.35, 0], [0, -radius * 0.35], [0, radius * 0.35]];
  offsets.forEach(([x, z]) => {
    const p = new THREE.Mesh(pillarGeo, pillarMat);
    p.position.set(x, -radius * 0.4, z);
    group.add(p);
  });

  const roofGeo = new THREE.ConeGeometry(radius * 0.55, radius * 0.5, 8);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 0;
  group.add(roof);

  const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, 0.15, 8), pillarMat);
  basePlate.position.y = -radius * 0.4;
  group.add(basePlate);
  return group;
}

function addDecorativeElements(group, sandstone, accent, baseWidth, wallHeight) {
  const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, wallHeight * 0.7, 8);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const x = side * (baseWidth / 2 - 0.5);
      const z = (i - 1) * 2.5;
      const pillar = new THREE.Mesh(pillarGeo, accent);
      pillar.position.set(x, 1.5 + wallHeight * 0.35, z);
      pillar.castShadow = true;
      group.add(pillar);
    }
  }

  const moldingGeo = new THREE.BoxGeometry(baseWidth + 1, 0.3, 0.3);
  for (let y = [3, 6, 9]; ) {
    const molding = new THREE.Mesh(moldingGeo, accent);
    molding.position.set(0, y + 1.5, baseDepth / 2 + 0.1);
    group.add(molding);
    y += 3;
  }
}
