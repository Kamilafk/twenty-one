const SUITS = ['spades', 'hearts', 'clubs', 'diamonds'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

export class Deck {
  constructor() {
    this.cards = [];
    this.reset();
  }

  reset() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push({ suit, rank, value: this.getValue(rank) });
      }
    }
  }

  getValue(rank) {
    if (rank === 'A') return 11;
    if (['J','Q','K'].includes(rank)) return 10;
    return parseInt(rank);
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    return this.cards.pop();
  }

  hasRankValue(value) {
    return this.cards.some(c => c.value === value);
  }

  drawByValue(value) {
    const idx = this.cards.findIndex(c => c.value === value);
    if (idx === -1) return null;
    const card = this.cards[idx];
    this.cards.splice(idx, 1);
    return card;
  }

  drawAce() {
    return this.drawByValue(11);
  }

  drawAny() {
    return this.draw();
  }

  get remaining() { return this.cards.length; }
}
