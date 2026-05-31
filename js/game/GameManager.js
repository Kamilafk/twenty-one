import { Deck } from './Deck.js';
import { Player } from '../player/Player.js';
import { Speedometer } from './Speedometer.js';
import { TrumpDeck } from './TrumpDeck.js';
import { TrumpResolver } from './TrumpResolver.js';

export class GameManager {
  constructor(onStateChange) {
    this.onStateChange = onStateChange;
    this.deck = new Deck();
    this.trumpDeck = new TrumpDeck();
    this.speedometer = new Speedometer();
    this.players = [new Player('Игрок 1', 0), new Player('Игрок 2', 1)];
    this.roundNumber = 0;
    this.turnIndex = 0;
    this.roundTarget = 21;
    this.activeTrump = null;
    this.opponentTrump = null;
    this.queuedTrumps = [];
    this.lastTrumpEffect = '';
    this.phase = 'idle';
    this.winner = null;
    this.timer = { active: false, secondsLeft: 10, isRunning: false };
    this._timerInterval = null;
  }

  currentPlayer() { return this.players[this.turnIndex]; }
  opponent() { return this.players[1 - this.turnIndex]; }

  startGame() {
    for (const p of this.players) p.resetGame();
    this.roundNumber = 0;
    this.deck.reset();
    this.deck.shuffle();
    this.trumpDeck.reset();
    this.trumpDeck.shuffle();
    this.phase = 'intro';
    this.winner = null;
    this.opponentTrump = null;
    this.queuedTrumps = [];
    this.nextRound();
  }

   nextRound() {
     this.roundNumber++;
     this.roundTarget = 21;
     this.activeTrump = null;
     this.opponentTrump = null;
     this.lastTrumpEffect = '';
     for (const p of this.players) {
       p.resetRound();
       // Give each player a random trump at the start of the round
       if (this.trumpDeck.remaining === 0) this.trumpDeck.reset();
       const trump = this.trumpDeck.draw();
       p.trump = trump; // Store the trump in the player object
     }

     this.clearTimer();
     this.phase = 'deal';
     this._emit();
     this._dealCards();
   }

  _processQueuedTrumps(callback) {
    if (this.queuedTrumps.length === 0) { callback(); return; }

    const next = this.queuedTrumps.shift();
    const p = this.players[next.player];
    const origTurn = this.turnIndex;
    this.turnIndex = next.player;
    const resolver = new TrumpResolver(this);
    resolver.resolve(next.trump, () => {
      this.turnIndex = origTurn;
      setTimeout(() => this._processQueuedTrumps(callback), 400);
    });
  }

  _dealCards() {
    this.phase = 'deal';
    this._emit();
    for (let i = 0; i < 2; i++) {
      for (const p of this.players) {
        if (this.deck.remaining > 0) {
          p.addCard(this.deck.draw());
        }
      }
    }
    this.turnIndex = 0;
    this.phase = 'player_turn';
    this._emit();
    this._startTimer();
  }

  playerHit() {
    if (this.phase !== 'player_turn') return;
    this.clearTimer();

    const p = this.currentPlayer();
    if (this.deck.remaining > 0) {
      p.addCard(this.deck.draw());
    }
    p.recalcScore();
    this._emit();

    if (p.score > this.roundTarget) {
      // Bust
      this._advanceTurn(true);
    } else {
      this._startTimer();
    }
  }

  playerStand() {
    if (this.phase !== 'player_turn') return;
    this.clearTimer();
    this.currentPlayer().hasPassed = true;
    this._advanceTurn();
  }

  _advanceTurn(busted = false) {
    if (busted) {
      this.currentPlayer().hasPassed = true;
    }

    if (this.players.every(p => p.hasPassed)) {
      this._endRound();
      return;
    }

    this.turnIndex = 1 - this.turnIndex;
    this._emit();
    this._startTimer();
  }

  _startTimer() {
    if (this.phase !== 'player_turn') return;
    this.clearTimer();
    this.timer = { active: true, secondsLeft: 10, isRunning: true };
    this._emit();

    let time = 10;
    this._timerInterval = setInterval(() => {
      time--;
      this.timer.secondsLeft = time;
      this._emit();

      if (time <= 0) {
        this.clearTimer();
        this.currentPlayer().hasOverkill = true;
        this._emit();
        this.currentPlayer().hasPassed = true;
        this._advanceTurn();
      }
    }, 1000);
  }

  clearTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
    this.timer.active = false;
  }

  _endRound() {
    this.clearTimer();
    this.phase = 'result';

    const target = this.roundTarget;
    const results = this.players.map(p => {
      const diff = p.score <= target ? target - p.score : Infinity;
      return { player: p, diff, bust: p.score > target };
    });

    let loser = null;
    const r0 = results[0], r1 = results[1];

    if (r0.bust && r1.bust) {
      if (r0.player.score === r1.player.score) {
        loser = null;
      } else {
        loser = r0.player.score > r1.player.score ? r0.player : r1.player;
      }
    } else if (r0.bust) {
      loser = r0.player;
    } else if (r1.bust) {
      loser = r1.player;
    } else {
      loser = r0.diff > r1.diff ? r0.player : (r1.diff > r0.diff ? r1.player : null);
    }

    if (loser) {
      let penalty = 1;
      if (loser.hasOverkill) penalty++;
      const result = this.speedometer.increase(loser, penalty);
      this._emit();

      this.lastResult = {
        loser,
        penalty,
        died: result.died,
        blessed: result.blessed,
        scores: [this.players[0].score, this.players[1].score]
      };
    } else {
      // Draw - both get +1
      for (const p of this.players) {
        this.speedometer.increase(p, 1);
      }
      this.lastResult = {
        loser: null,
        penalty: 0,
        died: false,
        blessed: false,
        draw: true,
        scores: [this.players[0].score, this.players[1].score]
      };
    }

    this._emit();

    setTimeout(() => {
      this._checkGameOver();
    }, 500);
  }

  _checkGameOver() {
    const dead = this.players.find(p => p.isDead);
    if (dead) {
      this.phase = 'game_over';
      this.winner = this.players[1 - dead.id];
      this._emit();
    } else {
      setTimeout(() => {
        this.phase = 'idle';
        this._emit();
      }, 2000);
    }
  }

  gameOver(loser) {
    this.clearTimer();
    loser.speed = 8;
    this.phase = 'game_over';
    this.winner = this.players[1 - loser.id];
    this._emit();
  }

  nextRoundAfterResult() {
    this.nextRound();
  }

  restartGame() {
    this.startGame();
  }

   applyTrump(playerIndex, trumpId) {
     const player = this.players[playerIndex];
     if (!player.trump || player.trump.id !== trumpId) return;
     
     // Apply the trump effect
     const resolver = new TrumpResolver(this);
     resolver.resolve(player.trump, () => {
       // Remove the trump from player's inventory after use
       player.trump = null;
       this._emit();
       
       // Continue with game flow
       if (this.phase === 'player_turn') {
         this._startTimer();
       }
     });
   }

   _emit() {
     if (this.onStateChange) this.onStateChange(this.getState());
   }

   getState() {
     return {
       phase: this.phase,
       roundNumber: this.roundNumber,
       roundTarget: this.roundTarget,
       turnIndex: this.turnIndex,
       activeTrump: this.activeTrump,
       lastTrumpEffect: this.lastTrumpEffect,
       players: this.players.map(p => ({
         name: p.name,
         id: p.id,
         hand: p.visibleHand,
         score: p.score,
         speed: p.speed,
         hasOverkill: p.hasOverkill,
         hasPassed: p.hasPassed,
         hasBless: p.hasBless,
         cardCount: p.cardCount,
         trump: p.trump
       })),
       timer: { ...this.timer },
       winner: this.winner,
       lastResult: this.lastResult,
       deckRemaining: this.deck.remaining,
       trumpRemaining: this.trumpDeck.remaining
     };
   }
}
