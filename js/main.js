import * as THREE from 'three';
import { SceneSetup } from './scene/SceneSetup.js';
import { Table } from './scene/Table.js';
import { Lamp } from './scene/Lamp.js';
import { TVScreens } from './scene/TVScreens.js';
import { ElectricChair } from './scene/ElectricChair.js';
import { Cards3D } from './scene/Cards3D.js';
import { Speedometer3D } from './scene/Speedometer3D.js';
import { GameManager } from './game/GameManager.js';
import { HUD } from './ui/HUD.js';
import { TrumpDisplay } from './ui/TrumpDisplay.js';
import { TimerDisplay } from './ui/TimerDisplay.js';
import { RoundResult } from './ui/RoundResult.js';

// --- Init 3D Scene ---
const container = document.body;
const sceneSetup = new SceneSetup(container);
const { scene, camera, renderer } = sceneSetup.init();

// --- Build Scene Objects ---
const table = new Table(scene);
table.build();

const lamp = new Lamp(scene);
lamp.build();

const tvs = new TVScreens(scene);
tvs.build();

const chair = new ElectricChair(scene);
chair.build();

const cards3d = new Cards3D(scene);
cards3d.build();

// --- Wall / Floor ---
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Walls
const wallMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9, side: THREE.DoubleSide });
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), wallMat);
backWall.position.set(0, 2, -3);
scene.add(backWall);

// Thin light beams from lamp
const beamMat = new THREE.MeshBasicMaterial({
  color: 0xffddaa,
  transparent: true,
  opacity: 0.04,
  side: THREE.DoubleSide
});
const beam = new THREE.Mesh(new THREE.ConeGeometry(2.5, 5, 16, 1, true), beamMat);
beam.position.set(0.6, 4.5, 0);
beam.rotation.x = Math.PI;
scene.add(beam);

// Dust particles
const dustGeo = new THREE.BufferGeometry();
const dustCount = 200;
const dustPos = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount * 3; i++) {
  dustPos[i] = (Math.random() - 0.5) * 6;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({
  color: 0x888888,
  size: 0.01,
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending
});
const dust = new THREE.Points(dustGeo, dustMat);
dust.position.y = 0.5;
scene.add(dust);

 // --- Init Game Manager & UI ---
 const speedo3d = new Speedometer3D();
 const hud = new HUD();
 const trumpDisplay = new TrumpDisplay();
 const timerDisplay = new TimerDisplay();
 const roundResult = new RoundResult();
 
 const DOM = {
   menu: document.getElementById('main-menu'),
   eyelids: document.getElementById('eyelids'),
   controls: document.getElementById('controls'),
   hands: document.getElementById('hands'),
   trumpSel: document.getElementById('trump-selection-overlay'),
   trumpGrid: document.getElementById('trump-cards-grid'),
   trumpCard: document.getElementById('trump-card'),
   trumpPanel: document.getElementById('trump-panel'),
   trumpList: document.getElementById('trump-list'),
   roundInfo: document.getElementById('round-info'),
   resultModal: document.getElementById('result-modal'),
   scale: document.getElementById('damage-scale-container'),
   speedoCanvas: document.getElementById('speedo-canvas'),
   timer: document.getElementById('timer')
 };

   const game = new GameManager((state) => {
   hud.update(state);
   trumpDisplay.update(state);
   timerDisplay.update(state);
   roundResult.show(state);
   speedo3d.update(state);

   // 3D cards
   if (state.players[0].hand.length > 0 || state.players[1].hand.length > 0) {
     cards3d.renderHand(0, state.players[0].hand, { x: -0.8, y: 0.85, z: 0.5 });
     cards3d.renderHand(1, state.players[1].hand, { x: -0.8, y: 0.85, z: -0.5 });
   } else {
     cards3d.clear();
   }

   // Trump effect overlay
   if (state.phase === 'trump_resolve' && state.lastTrumpEffect) {
     trumpDisplay.showEffect(state.lastTrumpEffect);
   }

   // Trump panel
   if (state.phase === 'deal' || state.phase === 'player_turn') {
     // Show trump panel with player's trump
     const playerTrump = state.players[0].trump;
     if (playerTrump) {
       DOM.trumpPanel.classList.remove('hidden');
       DOM.trumpList.innerHTML = `
         <div class="trump-choice-card" data-trump="${playerTrump.id}">
           <div class="trump-choice-name">${playerTrump.name}</div>
           <div class="trump-choice-symbol">${playerTrump.symbol}</div>
           <div class="trump-choice-desc">${playerTrump.desc}</div>
           <button class="action-btn" id="apply-trump" style="margin-top: 10px; padding: 8px 16px; font-size: 16px;">Применить</button>
         </div>
       `;
       
       // Add hover effect (using CSS classes for better performance)
       const trumpCard = DOM.trumpList.querySelector('.trump-choice-card');
       trumpCard.classList.add('trump-hover-effect');
       
       // Apply button handler (using event delegation to avoid duplicates)
       if (!this._trumpApplyListener) {
         this._trumpApplyListener = (e) => {
           if (e.target && e.target.id === 'apply-trump') {
             const cardEl = e.target.closest('.trump-choice-card');
             if (cardEl) {
               const trumpId = cardEl.getAttribute('data-trump');
               game.applyTrump(0, trumpId);
               DOM.trumpPanel.classList.add('hidden');
             }
           }
         };
         DOM.trumpList.addEventListener('click', this._trumpApplyListener);
       }
     } else {
       DOM.trumpPanel.classList.add('hidden');
     }
   } else {
     DOM.trumpPanel.classList.add('hidden');
   }

   // Active Trump display
   const t = state.activeTrump;
   if (t && state.phase.startsWith('turn')) {
     DOM.trumpCard.classList.remove('hidden');
     document.getElementById('trump-name').textContent = t.name;
     document.getElementById('trump-desc').textContent = t.desc;
   } else { DOM.trumpCard.classList.add('hidden'); }

   // Shock animation
   if (state.phase === 'result' && state.lastResult && state.lastResult.loser) {
     chair.triggerShock(state.roundNumber);
   }

   // Game over
   if (state.phase === 'game_over' && state.winner) {
     trumpDisplay.showEffect(`${state.winner.name} ПОБЕДИЛ!`);
   }
 });

// --- UI Events ---
hud.onHit(() => game.playerHit());
hud.onStand(() => game.playerStand());
hud.onStart(() => game.startGame());
const handleNext = () => {
  if (game.phase === 'game_over') {
    game.restartGame();
  } else {
    game.nextRoundAfterResult();
  }
};
hud.onNext(handleNext);

// --- Animation Loop ---
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  lamp.update(time);
  tvs.updateNoise();
  sceneSetup.flickerLight();

  // Dust animation
  const pos = dust.geometry.attributes.position.array;
  for (let i = 0; i < dustCount; i++) {
    pos[i * 3 + 1] += Math.sin(time + i) * 0.0003;
    pos[i * 3] += Math.cos(time * 0.5 + i) * 0.0002;
  }
  dust.geometry.attributes.position.needsUpdate = true;

  sceneSetup.render();
}
animate();
