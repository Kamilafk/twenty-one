import * as THREE from 'three';

export class ElectricChair {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.sparkParticles = null;
    this.isShocking = false;
    this.shockTime = 0;
  }

  build() {
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9, metalness: 0.1 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.6 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), woodMat);
    seat.position.set(-1.8, 0.4, 1.0);
    seat.castShadow = true;
    this.group.add(seat);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.06), woodMat);
    back.position.set(-1.8, 0.8, 0.68);
    this.group.add(back);

    // Legs
    for (const offset of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.35, 6), metalMat);
      leg.position.set(-1.8 + offset[0], 0.18, 1.0 + offset[1]);
      this.group.add(leg);
    }

    // Armrests
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.45), metalMat);
      arm.position.set(-1.8 + side * 0.32, 0.65, 1.0);
      this.group.add(arm);
    }

    // Electrodes (helmet)
    const electrodeMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x222222,
      emissiveIntensity: 0.1
    });
    const electrode = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), electrodeMat);
    electrode.position.set(-1.8, 1.05, 0.68);
    this.group.add(electrode);
    this.electrode = electrode;

    // Wires
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 4), wireMat);
    wire.position.set(-1.8, 1.2, 0.68);
    wire.rotation.x = 0.3;
    this.group.add(wire);

    // Spark particle system
    const sparkGeo = new THREE.BufferGeometry();
    const sparkCount = 50;
    const positions = new Float32Array(sparkCount * 3);
    const colors = new Float32Array(sparkCount * 3);
    const sizes = new Float32Array(sparkCount);
    this.sparkData = { positions, colors, sizes, count: sparkCount };

    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3] = -1.8 + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = 1.0 + Math.random() * 0.3;
      positions[i * 3 + 2] = 0.68 + (Math.random() - 0.5) * 0.3;
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
      colors[i * 3 + 2] = 0.1;
      sizes[i] = Math.random() * 0.03 + 0.01;
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    sparkGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const sparkMat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.sparks = new THREE.Points(sparkGeo, sparkMat);
    this.sparks.visible = false;
    this.group.add(this.sparks);

    // Position the whole chair
    this.group.position.set(0.5, 0, 0);

    this.scene.add(this.group);
    return this.group;
  }

  triggerShock(power = 1) {
    this.isShocking = true;
    this.shockTime = 0;
    const intensity = Math.min(power / 5, 1);

    if (this.sparks) {
      this.sparks.visible = true;
      const positions = this.sparks.geometry.attributes.position.array;
      for (let i = 0; i < this.sparkData.count; i++) {
        positions[i * 3] = -1.8 + (Math.random() - 0.5) * 0.5 * (1 + intensity);
        positions[i * 3 + 1] = 1.0 + Math.random() * 0.4 * (1 + intensity);
        positions[i * 3 + 2] = 0.68 + (Math.random() - 0.5) * 0.5 * (1 + intensity);
      }
      this.sparks.geometry.attributes.position.needsUpdate = true;
    }

    if (this.electrode) {
      this.electrode.material.emissive.setHex(0x4444ff);
      this.electrode.material.emissiveIntensity = 0.5 + intensity * 0.5;
    }

    // Flash
    const flash = new THREE.PointLight(0x4488ff, 2 * intensity, 3);
    flash.position.set(-1.8, 1.0, 0.68);
    this.scene.add(flash);

    setTimeout(() => {
      this.scene.remove(flash);
      if (this.electrode) {
        this.electrode.material.emissive.setHex(0x222222);
        this.electrode.material.emissiveIntensity = 0.1;
      }
      if (this.sparks) this.sparks.visible = false;
      this.isShocking = false;
    }, 500 + power * 100);
  }
}
