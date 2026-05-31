export const TRUMP_DEFS = [
  // Карточные (1-12)
  { id: 'card2', name: '2-card', category: 'card', desc: 'Даёт вам карту номиналом 2 очка' },
  { id: 'card3', name: '3-card', category: 'card', desc: 'Даёт вам карту номиналом 3 очка' },
  { id: 'card4', name: '4-card', category: 'card', desc: 'Даёт вам карту номиналом 4 очка' },
  { id: 'card5', name: '5-card', category: 'card', desc: 'Даёт вам карту номиналом 5 очков' },
  { id: 'card6', name: '6-card', category: 'card', desc: 'Даёт вам карту номиналом 6 очков' },
  { id: 'card7', name: '7-card', category: 'card', desc: 'Даёт вам карту номиналом 7 очков' },
  { id: 'perfect_draw', name: 'Perfect draw', category: 'card', desc: 'Даёт вам туза (11 очков)' },
  { id: 'hush', name: 'Hush', category: 'card', desc: 'Даёт вам карту рубашкой вверх' },
  { id: 'disservice', name: 'Disservice', category: 'card', desc: 'Оппонент получает одну карту' },
  { id: 'exchange', name: 'Exchange', category: 'card', desc: 'Меняет вашу последнюю карту с картой оппонента' },
  { id: 'remove', name: 'Remove', category: 'card', desc: 'Удаляет последнюю карту оппонента' },
  { id: 'return_card', name: 'Return', category: 'card', desc: 'Удаляет вашу последнюю карту' },

  // Целевые (13-14)
  { id: 'go_for_24', name: 'Go for 24', category: 'target', desc: 'Цель раунда — 24 очка' },
  { id: 'go_for_27', name: 'Go for 27', category: 'target', desc: 'Цель раунда — 27 очков' },

  // Ставочные (15-17)
  { id: 'one_up', name: 'One-up', category: 'stake', desc: '+1 к позиции оппонента на спидометре' },
  { id: 'two_up', name: 'Two-up', category: 'stake', desc: '+2 к позиции оппонента на спидометре' },
  { id: 'shield', name: 'Shield', category: 'stake', desc: '-1 к вашей позиции на спидометре' },

  // Защитные (18)
  { id: 'bless', name: 'Bless', category: 'defense', desc: 'Защита: стрелка не достигнет 8 в этом раунде' },

  // Интерактивные (19-22)
  { id: 'destroy', name: 'Destroy', category: 'interactive', desc: 'Уничтожает козырь оппонента' },
  { id: 'bloodshed', name: 'Bloodshed', category: 'interactive', desc: 'Уничтожает козырь оппонента + ставка +1' },
  { id: 'reincarnation', name: 'Reincarnation', category: 'interactive', desc: 'Уничтожает козырь оппонента, выдаёт вам новый козырь' },
  { id: 'friendship', name: 'Friendship', category: 'interactive', desc: 'Выдаёт вам и оппоненту по 2 случайных козыря' },
];

export class TrumpDeck {
  constructor() {
    this.trumps = [...TRUMP_DEFS];
  }

  shuffle() {
    for (let i = this.trumps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.trumps[i], this.trumps[j]] = [this.trumps[j], this.trumps[i]];
    }
  }

  draw() {
    return this.trumps.pop();
  }

  reset() {
    this.trumps = [...TRUMP_DEFS];
    this.shuffle();
  }

  get remaining() { return this.trumps.length; }
}
