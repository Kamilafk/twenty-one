import * as THREE from 'three';

export class Lamp {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.light = null;
    this.flickerTime = 0;
  }

  build() {
    // Pole
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7, metalness: 0.3 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), poleMat);
    pole.position.set(0, 6.5, 0);
    this.group.add(pole);

    // Arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), poleMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.3, 5.75, 0);
    this.group.add(arm);

    // Shade (cone)
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.35, 16, 1, true), shadeMat);
    shade.rotation.x = Math.PI;
    shade.position.set(0.6, 5.55, 0);
    this.group.add(shade);

    // Bulb
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffddaa,
      emissive: 0xffaa44,
      emissiveIntensity: 0.5
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), bulbMat);
    bulb.position.set(0.6, 5.7, 0);
    this.group.add(bulb);
    this.bulb = bulb;

    // Point light
    this.light = new THREE.PointLight(0xffaa44, 0.8, 8);
    this.light.position.set(0.6, 5.7, 0);
    this.light.castShadow = false;
    this.scene.add(this.light);

    this.scene.add(this.group);
    return this.group;
  }

  update(time) {
    this.flickerTime += 0.05;
    const flicker = Math.sin(time * 8) * 0.15 + Math.sin(time * 13) * 0.1;
    const intensity = 0.7 + flicker;

    if (this.light) {
      this.light.intensity = Math.max(0.3, intensity);
    }
    if (this.bulb) {
      const emissiveIntensity = Math.max(0.2, 0.4 + flicker * 0.3);
      this.bulb.material.emissiveIntensity = emissiveIntensity;
    }
  }
}
