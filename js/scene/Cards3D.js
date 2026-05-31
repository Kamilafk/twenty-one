import * as THREE from 'three';

export class Cards3D {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.cardMeshes = [];
    this.animating = false;
    this.textureLoader = new THREE.TextureLoader();
    this.cardTextures = {};
    this.cardBackTexture = null;
    this.loadingComplete = false;
    this.texturesLoading = 0;
    this.texturesToLoad = 0;
    this.loadTextures();
  }

  loadTextures() {
    // Reset counters
    this.texturesLoading = 0;
    this.texturesToLoad = 14; // 1 back + 13 face cards
    
    // Load card back texture
    this.texturesLoading++;
    this.cardBackTexture = this.textureLoader.load(
      'Основная Рубашка.png',
      () => this.onTextureLoaded(),
      undefined,
      (err) => {
        console.error('Error loading card back texture:', err);
        this.onTextureLoaded();
      }
    );
    
    // Load number card textures
    const loadCardTexture = (rank, filename) => {
      this.texturesLoading++;
      this.cardTextures[rank] = this.textureLoader.load(
        filename,
        () => this.onTextureLoaded(),
        undefined,
        (err) => {
          console.error(`Error loading ${filename} texture:`, err);
          this.onTextureLoaded();
        }
      );
    };

    loadCardTexture(1, 'Основная 1.png'); // Ace
    loadCardTexture(2, 'Основная 2.png');
    loadCardTexture(3, 'Основная 3.png');
    loadCardTexture(4, 'Основная 4.png');
    loadCardTexture(5, 'Основная 5.png');
    loadCardTexture(6, 'Основная 6.png');
    loadCardTexture(7, 'Основная 7.png');
    loadCardTexture(8, 'Основная 8.png');
    loadCardTexture(9, 'Основная 9.png');
    loadCardTexture(10, 'Основная 10.png');
    
    // Load face card texture (J, Q, K all use the same)
    loadCardTexture(11, 'Основная 11.png'); // Jack
    this.cardTextures[12] = this.cardTextures[11]; // Queen (share texture)
    this.cardTextures[13] = this.cardTextures[11]; // King (share texture)
  }

  onTextureLoaded() {
    this.texturesLoading--;
    if (this.texturesLoading <= 0) {
      this.loadingComplete = true;
      console.log('All card textures loaded successfully');
    }
  }

  build() {
    this.scene.add(this.group);
  }

  clear() {
    for (const mesh of this.cardMeshes) {
      this.group.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    }
    this.cardMeshes = [];
  }

  renderHand(playerId, hand, position) {
    // Remove old cards for this player
    const toRemove = this.cardMeshes.filter(m => m.userData.playerId === playerId);
    for (const m of toRemove) {
      this.group.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
      const idx = this.cardMeshes.indexOf(m);
      if (idx > -1) this.cardMeshes.splice(idx, 1);
    }

    const startX = position.x + (hand.length - 1) * -0.12;

    for (let i = 0; i < hand.length; i++) {
      const geo = new THREE.BoxGeometry(0.13, 0.18, 0.005);
      const card = hand[i];
      
      let material;
      if (card.faceUp) {
        // Map card rank to texture index
        let rankIndex = 0;
        switch(card.rank) {
          case 'A': rankIndex = 1; break;
          case 'J': rankIndex = 11; break;
          case 'Q': rankIndex = 12; break;
          case 'K': rankIndex = 13; break;
          default: rankIndex = parseInt(card.rank);
        }
        
        const texture = this.cardTextures[rankIndex];
        if (texture && this.loadingComplete) {
          material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.6,
            metalness: 0.1
          });
        } else {
          // Fallback to procedural if texture not ready or loading failed
          material = new THREE.MeshStandardMaterial({
            color: 0xf5e6d0,
            roughness: 0.6,
            metalness: 0.1
          });
        }
      } else {
        // Face down card
        if (this.cardBackTexture && this.loadingComplete) {
          material = new THREE.MeshStandardMaterial({
            map: this.cardBackTexture,
            roughness: 0.8
          });
        } else {
          // Fallback to procedural if texture not ready or loading failed
          material = new THREE.MeshStandardMaterial({
            color: 0x2a0a0a,
            roughness: 0.8
          });
        }
      }

      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(startX + i * 0.12, position.y, position.z);
      mesh.userData = { playerId, cardIndex: i };
      this.group.add(mesh);
      this.cardMeshes.push(mesh);
    }
  }

  setTablePosition(tableGroup) {
    this.group.position.copy(tableGroup.position);
  }
}

  loadTextures() {
    // Load card back texture
    this.cardBackTexture = this.textureLoader.load('Основная Рубашка.png', () => {
      console.log('Card back texture loaded');
    }, undefined, (err) => {
      console.error('Error loading card back texture:', err);
    });
    
    // Load number card textures
    this.cardTextures[1] = this.textureLoader.load('Основная 1.png', () => {
      console.log('Ace texture loaded');
    }, undefined, (err) => {
      console.error('Error loading ace texture:', err);
    }); // Ace
    this.cardTextures[2] = this.textureLoader.load('Основная 2.png', () => {
      console.log('2 texture loaded');
    }, undefined, (err) => {
      console.error('Error loading 2 texture:', err);
    });
    this.cardTextures[3] = this.textureLoader.load('Основная 3.png', () => {
      console.log('3 texture loaded');
    }, undefined, (err) => {
      console.error('Error loading 3 texture:', err);
    });
    this.cardTextures[4] = this.textureLoader.load('Основная 4.png', () => {
      console.log('4 texture loaded');
    }, undefined, (err) => {
      console.error('Error loading 4 texture:', err);
    });
    this.cardTextures[5] = this.textureLoader.load('Основная 5.png', () => {
      console.log('5 texture loaded');
    }, undefined, (err) => {
      console.error('Error loading 5 texture:', err);
    });
    this.cardTextures[6] = this.textureLoader.load('Основная 6.png', () => {
      console.log('6 texture loaded');
    }, undefined, (err) => {
      console.error('Error loading 6 texture:', err);
    });
    this.cardTextures[7] = this.textureLoader.load('Основная 7.png', () => {
      console.log('7 texture loaded');
    }, undefined, (err) => {
      console.error('Error loading 7 texture:', err);
    });
    this.cardTextures[8] = this.textureLoader.load('Основная 8.png', () => {
      console.log('8 texture loaded');
    }, undefined, (err) => {
      console.error('Error loading 8 texture:', err);
    });
    this.cardTextures[9] = this.textureLoader.load('Основная 9.png', () => {
      console.log('9 texture loaded');
    }, undefined, (err) => {
      console.error('Error loading 9 texture:', err);
    });
    this.cardTextures[10] = this.textureLoader.load('Основная 10.png', () => {
      console.log('10 texture loaded');
    }, undefined, (err) => {
      console.error('Error loading 10 texture:', err);
    });
    
    // Load face card texture (J, Q, K all use the same)
    this.cardTextures[11] = this.textureLoader.load('Основная 11.png', () => {
      console.log('Jack texture loaded');
    }, undefined, (err) => {
      console.error('Error loading Jack texture:', err);
    }); // Jack
    this.cardTextures[12] = this.cardTextures[11]; // Queen (share texture)
    this.cardTextures[13] = this.cardTextures[11]; // King (share texture)
    
    // Set flag when all textures are loaded (simplified - in reality you'd want to check all)
    setTimeout(() => {
      this.loadingComplete = true;
      console.log('Texture loading initialization complete');
    }, 100);
  }

  build() {
    this.scene.add(this.group);
  }

  clear() {
    for (const mesh of this.cardMeshes) {
      this.group.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    }
    this.cardMeshes = [];
  }

  renderHand(playerId, hand, position) {
    // Remove old cards for this player
    const toRemove = this.cardMeshes.filter(m => m.userData.playerId === playerId);
    for (const m of toRemove) {
      this.group.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
      const idx = this.cardMeshes.indexOf(m);
      if (idx > -1) this.cardMeshes.splice(idx, 1);
    }

    const startX = position.x + (hand.length - 1) * -0.12;

    for (let i = 0; i < hand.length; i++) {
      const geo = new THREE.BoxGeometry(0.13, 0.18, 0.005);
      const card = hand[i];
      
      let material;
      if (card.faceUp && this.loadingComplete) {
        // Map card rank to texture index
        let rankIndex = 0;
        switch(card.rank) {
          case 'A': rankIndex = 1; break;
          case 'J': rankIndex = 11; break;
          case 'Q': rankIndex = 12; break;
          case 'K': rankIndex = 13; break;
          default: rankIndex = parseInt(card.rank);
        }
        
        const texture = this.cardTextures[rankIndex];
        if (texture) {
          material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.6,
            metalness: 0.1
          });
        } else {
          // Fallback to procedural if texture not ready
          material = new THREE.MeshStandardMaterial({
            color: 0xf5e6d0,
            roughness: 0.6,
            metalness: 0.1
          });
        }
      } else if (card.faceUp && !this.loadingComplete) {
        // Still loading, use procedural
        material = new THREE.MeshStandardMaterial({
          color: 0xf5e6d0,
          roughness: 0.6,
          metalness: 0.1
        });
      } else {
        // Face down card
        if (this.loadingComplete && this.cardBackTexture) {
          material = new THREE.MeshStandardMaterial({
            map: this.cardBackTexture,
            roughness: 0.8
          });
        } else {
          // Fallback to procedural if texture not ready
          material = new THREE.MeshStandardMaterial({
            color: 0x2a0a0a,
            roughness: 0.8
          });
        }
      }

      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(startX + i * 0.12, position.y, position.z);
      mesh.userData = { playerId, cardIndex: i };
      this.group.add(mesh);
      this.cardMeshes.push(mesh);
    }
  }

  setTablePosition(tableGroup) {
    this.group.position.copy(tableGroup.position);
  }
}

  build() {
    this.scene.add(this.group);
  }

  clear() {
    for (const mesh of this.cardMeshes) {
      this.group.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    }
    this.cardMeshes = [];
  }

  renderHand(playerId, hand, position) {
    // Remove old cards for this player
    const toRemove = this.cardMeshes.filter(m => m.userData.playerId === playerId);
    for (const m of toRemove) {
      this.group.remove(m);
      m.geometry.dispose();
      m.material.dispose();
      const idx = this.cardMeshes.indexOf(m);
      if (idx > -1) this.cardMeshes.splice(idx, 1);
    }

    const startX = position.x + (hand.length - 1) * -0.12;
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0xf5e6d0,
      roughness: 0.6,
      metalness: 0.1
    });
    const cardBackMat = new THREE.MeshStandardMaterial({
      color: 0x2a0a0a,
      roughness: 0.8
    });

    for (let i = 0; i < hand.length; i++) {
      const group = new THREE.Group();
      const geo = new THREE.BoxGeometry(0.13, 0.18, 0.005);

      const card = hand[i];
      if (card.faceUp) {
        const mesh = new THREE.Mesh(geo, cardMat.clone());
        mesh.position.set(startX + i * 0.12, position.y, position.z);
        mesh.userData = { playerId, cardIndex: i };
        this.group.add(mesh);
        this.cardMeshes.push(mesh);

        // Suit/rank indicator (simple colored dot)
        const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
        const dotMat = new THREE.MeshBasicMaterial({
          color: isRed ? 0xcc0000 : 0x000000
        });
        const dot = new THREE.Mesh(new THREE.CircleGeometry(0.015, 8), dotMat);
        dot.position.set(startX + i * 0.12, position.y + 0.06, position.z + 0.003);
        this.group.add(dot);
        this.cardMeshes.push(dot);

        // Rank text (using small boxes)
        if (card.rank) {
          const textMat = new THREE.MeshBasicMaterial({ color: isRed ? 0xcc0000 : 0x000000 });
          const text = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.02), textMat);
          text.position.set(startX + i * 0.12 - 0.04, position.y + 0.06, position.z + 0.003);
          this.group.add(text);
          this.cardMeshes.push(text);
        }
      } else {
        // Face down card
        const mesh = new THREE.Mesh(geo, cardBackMat.clone());
        mesh.position.set(startX + i * 0.12, position.y, position.z);
        mesh.userData = { playerId, cardIndex: i };
        this.group.add(mesh);
        this.cardMeshes.push(mesh);
      }
    }
  }

  setTablePosition(tableGroup) {
    this.group.position.copy(tableGroup.position);
  }
}
