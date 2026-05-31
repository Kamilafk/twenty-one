export class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.hand = [];
    this.score = 0;
    this.speed = 0;
    this.hasOverkill = false;
    this.hasPassed = false;
    this.hasBless = false;
    this.hushCards = [];
    this.trump = null; // Current trump for this player
  }

  addCard(card, faceUp = true) {
    card.faceUp = faceUp;
    this.hand.push(card);
    this.recalcScore();
  }

  removeLastCard() {
    return this.hand.pop();
  }

  getLastCard() {
    return this.hand[this.hand.length - 1];
  }

  get visibleHand() {
    return this.hand.map((c, i) => ({
      ...c,
      faceUp: this.hushCards.includes(i) ? false : c.faceUp
    }));
  }

  recalcScore() {
    let score = 0;
    let aces = 0;
    for (const c of this.hand) {
      score += c.value;
      if (c.rank === 'A') aces++;
    }
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    this.score = score;
    return score;
  }

  get cardCount() { return this.hand.length; }

  resetRound() {
    this.hand = [];
    this.score = 0;
    this.hasPassed = false;
    this.hushCards = [];
  }

  resetGame() {
    this.resetRound();
    this.speed = 0;
    this.hasOverkill = false;
    this.hasBless = false;
    this.isDead = false;
  }
}
