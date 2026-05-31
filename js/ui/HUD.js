export class HUD {
  constructor() {
    this.handP1 = document.querySelector('#hand-p1 .hand-cards');
    this.handP2 = document.querySelector('#hand-p2 .hand-cards');
    this.scoreP1 = document.querySelector('#hand-p1 .hand-score');
    this.scoreP2 = document.querySelector('#hand-p2 .hand-score');
    this.btnHit = document.getElementById('btn-hit');
    this.btnStand = document.getElementById('btn-stand');
    this.btnStart = document.getElementById('btn-start');
    this.btnNext = document.getElementById('btn-next');
    this.roundInfo = document.getElementById('round-info');
    this.overkillP1 = document.getElementById('overkill-badge-p1');
    this.overkillP2 = document.getElementById('overkill-badge-p2');
  }

  update(state) {
    const p1 = state.players[0];
    const p2 = state.players[1];

    this._renderHand(this.handP1, p1.hand, 0);
    this._renderHand(this.handP2, p2.hand, 1);
    const p1Bust = p1.score > state.roundTarget;
    const p2Bust = p2.score > state.roundTarget;
    this.scoreP1.textContent = `Очки: ${p1Bust ? 'ПЕРЕБОР' : p1.score}`;
    this.scoreP2.textContent = `Очки: ${p2Bust ? 'ПЕРЕБОР' : p2.score}`;

    this.roundInfo.textContent = `Раунд: ${state.roundNumber} | Цель: ${state.roundTarget}`;

    this.btnHit.disabled = state.phase !== 'player_turn';
    this.btnStand.disabled = state.phase !== 'player_turn';
    this.btnStart.style.display = state.phase === 'idle' || state.phase === 'game_over' ? 'inline-block' : 'none';

    if (state.phase === 'game_over') {
      this.btnStart.textContent = 'ИГРАТЬ СНОВА';
    } else {
      this.btnStart.textContent = 'НАЧАТЬ ИГРУ';
    }

    this.overkillP1.classList.toggle('hidden', !p1.hasOverkill);
    this.overkillP2.classList.toggle('hidden', !p2.hasOverkill);
  }

   _renderHand(container, hand, playerId) {
     container.innerHTML = '';
     for (let i = 0; i < hand.length; i++) {
       const card = hand[i];
       const el = document.createElement('div');
       el.className = 'hand-card';

       if (card.faceUp) {
         el.classList.add('face-up');
         const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
         if (isRed) el.classList.add('red');
         el.innerHTML = `<span class="card-rank">${card.rank}</span>`;
       } else {
         el.classList.add('face-down');
       }

       if (card.hush) el.classList.add('hush-card');
       container.appendChild(el);
     }
   }

  _suitSymbol(suit) {
    const symbols = { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' };
    return symbols[suit] || suit;
  }

  onHit(callback) { this.btnHit.addEventListener('click', callback); }
  onStand(callback) { this.btnStand.addEventListener('click', callback); }
  onStart(callback) { this.btnStart.addEventListener('click', callback); }
  onNext(callback) { this.btnNext.addEventListener('click', callback); }
}
