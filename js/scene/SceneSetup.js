import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneSetup {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.Fog(0x0a0a0a, 15, 30);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50);
    this.camera.position.set(0, 6, 7);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minPolarAngle = 0.3;
    this.controls.maxPolarAngle = 1.2;
    this.controls.target.set(0, 0.5, 0);

    this._setupLights();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene: this.scene, camera: this.camera, renderer: this.renderer };
  }

  _setupLights() {
    const ambient = new THREE.AmbientLight(0x222233, 0.3);
    this.scene.add(ambient);

    const mainLight = new THREE.SpotLight(0xffddaa, 15, 20, Math.PI / 6, 0.5, 1);
    mainLight.position.set(0, 8, 0);
    mainLight.target.position.set(0, 0, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    this.scene.add(mainLight);
    this.scene.add(mainLight.target);
    this.mainLight = mainLight;

    const fill = new THREE.DirectionalLight(0x334466, 0.2);
    fill.position.set(-3, 4, 3);
    this.scene.add(fill);

    const backLight = new THREE.DirectionalLight(0x442222, 0.15);
    backLight.position.set(0, 2, -5);
    this.scene.add(backLight);
  }

  flickerLight() {
    if (this.mainLight) {
      const intensity = 12 + Math.random() * 4;
      this.mainLight.intensity = intensity;
    }
  }

  render() {
    const delta = this.clock.getDelta();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  get camera() { return this._camera; }
  set camera(val) { this._camera = val; }
}
