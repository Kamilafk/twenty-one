import * as THREE from 'three';

export class TVScreens {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.noiseTextures = [];
  }

  build() {
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x112233,
      emissive: 0x224466,
      emissiveIntensity: 0.2,
      roughness: 0.5,
      metalness: 0.3
    });

    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });

    // Create a wall of 6 TVs (3x2)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const group = new THREE.Group();

        // TV body
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.35), bezelMat);
        group.add(body);

        // Screen
        const screenGeo = new THREE.PlaneGeometry(0.6, 0.45);
        const screenMesh = new THREE.Mesh(screenGeo, screenMat.clone());
        screenMesh.position.z = 0.18;
        group.add(screenMesh);

        // Static noise effect (animated canvas texture)
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 48;
        const ctx = canvas.getContext('2d');
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const noiseMat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.3,
          depthWrite: false
        });
        const noiseMesh = new THREE.Mesh(screenGeo, noiseMat);
        noiseMesh.position.z = 0.19;
        group.add(noiseMesh);

        // Position TVs
        const xOffset = (col - 1) * 1.0;
        const yOffset = (row - 0.5) * 0.8 + 1.5;
        group.position.set(xOffset, yOffset, -2.5);
        group.rotation.y = 0;

        this.group.add(group);
        this.noiseTextures.push({ canvas, ctx, texture, width: 64, height: 48 });
      }
    }

    this.scene.add(this.group);
    return this.group;
  }

  updateNoise() {
    for (const nt of this.noiseTextures) {
      const { canvas, ctx, texture, width, height } = nt;
      const imgData = ctx.createImageData(width, height);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = Math.random() * 255;
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      texture.needsUpdate = true;
    }
  }
}
