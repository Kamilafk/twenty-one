import * as THREE from 'three';

export class Table {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
  }

  build() {
    // Table top - green felt
    const topGeo = new THREE.BoxGeometry(2.8, 0.08, 2);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x1a4a2a,
      roughness: 0.9,
      metalness: 0.1
    });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.75;
    top.receiveShadow = true;
    top.castShadow = true;
    this.group.add(top);

    // Felt surface (slightly above for card placement)
    const feltGeo = new THREE.PlaneGeometry(2.6, 1.8);
    const feltMat = new THREE.MeshStandardMaterial({
      color: 0x1a5a2a,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide
    });
    const felt = new THREE.Mesh(feltGeo, feltMat);
    felt.rotation.x = -Math.PI / 2;
    felt.position.y = 0.8;
    this.group.add(felt);

    // Table legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.8 });
    const legPositions = [[-1.2, 0, -0.8], [1.2, 0, -0.8], [-1.2, 0, 0.8], [1.2, 0, 0.8]];
    for (const pos of legPositions) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.7, 6), legMat);
      leg.position.set(pos[0], 0.35, pos[2]);
      leg.castShadow = true;
      this.group.add(leg);
    }

    // Table edge trim
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.7 });
    const edge = new THREE.Mesh(new THREE.BoxGeometry(2.82, 0.02, 2.02), edgeMat);
    edge.position.y = 0.79;
    this.group.add(edge);

    this.scene.add(this.group);
    return this.group;
  }
}
