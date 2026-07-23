import * as THREE from 'three';

const isMobile = () => window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024);

class BiryaniScene {
  constructor(container) {
    this.container = container;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.isMobile = isMobile();

    this.init();
  }

  init() {
    const { width, height } = this.container.getBoundingClientRect();

    this.scene = new THREE.Scene();

    const camZ = this.isMobile ? 10 : 8;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 1.5, camZ);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: !this.isMobile, 
      alpha: true,
      powerPreference: this.isMobile ? 'low-power' : 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
    this.renderer.shadowMap.enabled = !this.isMobile;
    if (!this.isMobile) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    this.setupLights();
    this.createBiryaniPot();
    this.createParticles();
    this.createSteam();
    this.createCloud();
    this.setupEvents();
    this.animate();
  }

  setupLights() {
    const ambient = new THREE.AmbientLight('#3a1a0a', 0.6);
    this.scene.add(ambient);

    const key = new THREE.PointLight('#ff9a56', 12, 12, 1);
    key.position.set(3, 4, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    this.scene.add(key);

    const fill = new THREE.PointLight('#ff6b35', 5, 8, 2);
    fill.position.set(-3, 1, -2);
    this.scene.add(fill);

    const rim = new THREE.PointLight('#ffd4a8', 8, 10, 2);
    rim.position.set(0, 3, -4);
    this.scene.add(rim);

    const bottom = new THREE.PointLight('#8B4513', 3, 5, 2);
    bottom.position.set(0, -2, 0);
    this.scene.add(bottom);
  }

  createBiryaniPot() {
    this.potGroup = new THREE.Group();
    const seg = this.isMobile ? 16 : 48;
    const segLow = this.isMobile ? 8 : 32;

    const potMaterial = new THREE.MeshStandardMaterial({
      color: '#CD7F32',
      roughness: 0.3,
      metalness: 0.8,
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
      color: '#DAA520',
      roughness: 0.2,
      metalness: 0.9,
    });

    const doughMaterial = new THREE.MeshStandardMaterial({
      color: '#DEB887',
      roughness: 0.7,
      metalness: 0.0,
    });

    const potBodyGeom = new THREE.CylinderGeometry(1.2, 0.9, 2.4, seg, segLow);
    const potBody = new THREE.Mesh(potBodyGeom, potMaterial);
    potBody.castShadow = !this.isMobile;
    potBody.receiveShadow = !this.isMobile;
    potBody.position.y = -0.2;
    this.potGroup.add(potBody);

    const neckGeom = new THREE.CylinderGeometry(0.95, 1.2, 0.3, seg);
    const neck = new THREE.Mesh(neckGeom, rimMaterial);
    neck.castShadow = !this.isMobile;
    neck.position.y = 1.15;
    this.potGroup.add(neck);

    const rimGeom = new THREE.TorusGeometry(0.95, 0.08, 8, segLow);
    const rim = new THREE.Mesh(rimGeom, rimMaterial);
    rim.castShadow = !this.isMobile;
    rim.position.y = 1.3;
    rim.rotation.x = Math.PI / 2;
    this.potGroup.add(rim);

    const doughGeom = new THREE.SphereGeometry(0.85, seg, segLow, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const dough = new THREE.Mesh(doughGeom, doughMaterial);
    dough.castShadow = !this.isMobile;
    dough.receiveShadow = !this.isMobile;
    dough.position.y = 1.3;
    this.potGroup.add(dough);

    const bumpCount = this.isMobile ? 8 : 16;
    for (let i = 0; i < bumpCount; i++) {
      const angle = (i / bumpCount) * Math.PI * 2;
      const bumpGeom = new THREE.SphereGeometry(0.06, 4, 4);
      const bump = new THREE.Mesh(bumpGeom, doughMaterial);
      bump.position.set(Math.cos(angle) * 0.88, 1.35, Math.sin(angle) * 0.88);
      this.potGroup.add(bump);
    }

    for (let side = -1; side <= 1; side += 2) {
      const handleGeom = new THREE.TorusGeometry(0.3, 0.06, 8, 8, Math.PI);
      const handle = new THREE.Mesh(handleGeom, rimMaterial);
      handle.rotation.z = Math.PI / 2;
      handle.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      handle.position.set(side * 1.25, 0.3, 0);
      this.potGroup.add(handle);
    }

    const baseGeom = new THREE.CylinderGeometry(0.85, 0.95, 0.2, seg);
    const base = new THREE.Mesh(baseGeom, rimMaterial);
    base.position.y = -1.5;
    this.potGroup.add(base);

    const ringCount = this.isMobile ? 1 : 3;
    for (let i = 0; i < ringCount; i++) {
      const y = -0.7 + i * 0.6;
      const ringGeom = new THREE.TorusGeometry(1.21, 0.03, 4, segLow);
      const ring = new THREE.Mesh(ringGeom, rimMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      this.potGroup.add(ring);
    }

    this.scene.add(this.potGroup);
  }

  createParticles() {
    this.particlesGroup = new THREE.Group();
    const particleGeom = new THREE.SphereGeometry(0.03, 4, 4);
    const colors = ['#FF6B35', '#FFD700', '#FF4500', '#FF8C00', '#FF6347', '#F4A261'];

    this.particles = [];
    for (let i = 0; i < (this.isMobile ? 30 : 80); i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.5,
        emissive: color,
        emissiveIntensity: 0.4,
      });
      const particle = new THREE.Mesh(particleGeom, mat);

      const angle = Math.random() * Math.PI * 2;
      const radius = 1.4 + Math.random() * 2.5;
      particle.position.set(
        Math.cos(angle) * radius,
        -1.5 + Math.random() * 4,
        Math.sin(angle) * radius
      );
      particle.userData = {
        baseY: particle.position.y,
        speed: 0.5 + Math.random() * 2,
        amplitude: 0.2 + Math.random() * 1,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2,
      };

      this.particlesGroup.add(particle);
      this.particles.push(particle);
    }

    this.scene.add(this.particlesGroup);
  }

  createSteam() {
    this.steamGroup = new THREE.Group();
    this.steamParticles = [];

    for (let i = 0; i < (this.isMobile ? 5 : 15); i++) {
      const size = 0.08 + Math.random() * 0.15;
      const geom = new THREE.SphereGeometry(size, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.15,
      });
      const steam = new THREE.Mesh(geom, mat);

      steam.position.set(
        (Math.random() - 0.5) * 0.8,
        1.6 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.8
      );
      steam.userData = {
        baseX: steam.position.x,
        baseZ: steam.position.z,
        speed: 0.3 + Math.random() * 0.7,
        offset: Math.random() * Math.PI * 2,
        life: Math.random(),
      };

      this.steamGroup.add(steam);
      this.steamParticles.push(steam);
    }

    this.scene.add(this.steamGroup);
  }

  createCloud() {
    this.clouds = [];
    for (let i = 0; i < (this.isMobile ? 2 : 5); i++) {
      const cloudGroup = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.06,
      });

      for (let j = 0; j < 6; j++) {
        const size = 0.3 + Math.random() * 0.5;
        const geom = new THREE.SphereGeometry(size, 8, 8);
        const blob = new THREE.Mesh(geom, mat);
        blob.position.set(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.8
        );
        cloudGroup.add(blob);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 6,
        2 + Math.random() * 2,
        -4 + Math.random() * 2
      );
      cloudGroup.userData = {
        speed: 0.1 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      };

      this.scene.add(cloudGroup);
      this.clouds.push(cloudGroup);
    }
  }

  setupEvents() {
    this.onMouseMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.targetMouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    this.onResize = () => {
      const { width, height } = this.container.getBoundingClientRect();
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    this.onTouchMove = (e) => {
      if (e.touches.length === 1) {
        const rect = this.container.getBoundingClientRect();
        this.targetMouseX = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
        this.targetMouseY = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
      }
    };

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
  }

  animate() {
    this.animFrame = requestAnimationFrame(() => this.animate());

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    const time = performance.now() * 0.001;

    // Pot rotation
    if (this.potGroup) {
      this.potGroup.rotation.y += 0.003;
      this.potGroup.position.x += (this.mouseX * 0.3 - this.potGroup.position.x) * 0.03;
      this.potGroup.position.y += (-0.3 + this.mouseY * 0.2 - this.potGroup.position.y) * 0.03;
    }

    // Camera follow
    this.camera.position.x += (this.mouseX * 1.5 - this.camera.position.x) * 0.02;
    this.camera.position.y += (1.5 + this.mouseY * 0.5 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0.2, 0);

    // Animate floating spice particles
    if (this.particles) {
      this.particles.forEach((p) => {
        const d = p.userData;
        p.position.y = d.baseY + Math.sin(time * d.speed + d.angle) * d.amplitude;
        p.rotation.y += d.rotSpeed * 0.02;
        p.rotation.x += d.rotSpeed * 0.01;
      });
    }

    // Animate steam
    if (this.steamParticles) {
      this.steamParticles.forEach((s) => {
        s.userData.life += s.userData.speed * 0.005;
        if (s.userData.life > 1) s.userData.life = 0;

        const t = s.userData.life;
        s.position.y = 1.6 + t * 2.5;
        s.position.x = s.userData.baseX + Math.sin(time * s.userData.speed * 2 + s.userData.offset) * 0.3 * t;
        s.position.z = s.userData.baseZ + Math.cos(time * s.userData.speed * 1.5 + s.userData.offset) * 0.3 * t;
        s.scale.setScalar(0.5 + t * 2);
        s.material.opacity = 0.15 * (1 - t) * (1 - t);
      });
    }

    // Animate clouds
    if (this.clouds) {
      this.clouds.forEach((c) => {
        const d = c.userData;
        c.position.x += Math.sin(time * d.speed + d.offset) * 0.003;
        c.position.y += Math.cos(time * d.speed * 0.7) * 0.002;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.animFrame);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('touchmove', this.onTouchMove);

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }

    // Dispose all geometries and materials
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}

export default BiryaniScene;
