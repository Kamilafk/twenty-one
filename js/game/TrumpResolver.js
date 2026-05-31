export class TrumpResolver {
  constructor(gameState) {
    this.gs = gameState;
  }

  resolve(trump, callback) {
    this.gs.activeTrump = trump;
    const effects = [];

    switch (trump.id) {
      case 'card2': case 'card3': case 'card4':
      case 'card5': case 'card6': case 'card7': {
        const val = parseInt(trump.id.replace('card', ''));
        if (this.gs.deck.hasRankValue(val)) {
          const card = this.gs.deck.drawByValue(val);
          if (card) {
            this.gs.currentPlayer().addCard(card);
            effects.push(`${this.gs.currentPlayer().name} получает ${card.rank} ${card.suit}`);
          }
        }
        break;
      }
      case 'perfect_draw': {
        const ace = this.gs.deck.drawAce();
        if (ace) {
          this.gs.currentPlayer().addCard(ace);
          effects.push(`${this.gs.currentPlayer().name} получает туза`);
        }
        break;
      }
      case 'hush': {
        const card = this.gs.deck.drawAny();
        if (card) {
          const idx = this.gs.currentPlayer().hand.length;
          this.gs.currentPlayer().addCard(card, false);
          this.gs.currentPlayer().hushCards.push(idx);
          effects.push(`${this.gs.currentPlayer().name} получает карту рубашкой вверх`);
        }
        break;
      }
      case 'disservice': {
        const card = this.gs.deck.drawAny();
        if (card) {
          this.gs.opponent().addCard(card);
          effects.push(`${this.gs.opponent().name} получает карту от Disservice`);
        }
        break;
      }
      case 'exchange': {
        const p = this.gs.currentPlayer();
        const o = this.gs.opponent();
        if (p.cardCount > 1 && o.cardCount > 1) {
          const pCard = p.removeLastCard();
          const oCard = o.removeLastCard();
          p.addCard(oCard);
          o.addCard(pCard);
          effects.push('Последние карты обменяны');
        }
        break;
      }
      case 'remove': {
        const o = this.gs.opponent();
        if (o.cardCount > 1) {
          o.removeLastCard();
          effects.push(`Последняя карта ${o.name} удалена`);
        }
        break;
      }
      case 'return_card': {
        const p = this.gs.currentPlayer();
        if (p.cardCount > 1) {
          p.removeLastCard();
          effects.push(`Последняя карта ${p.name} удалена`);
        }
        break;
      }
      case 'go_for_24': {
        this.gs.roundTarget = 24;
        effects.push('Цель раунда — 24');
        break;
      }
      case 'go_for_27': {
        this.gs.roundTarget = 27;
        effects.push('Цель раунда — 27');
        break;
      }
      case 'one_up': {
        const result = this.gs.speedometer.increase(this.gs.opponent());
        effects.push(`${this.gs.opponent().name} +1 на спидометре`);
        if (result.died) this.gs.gameOver(this.gs.opponent());
        break;
      }
      case 'two_up': {
        const result = this.gs.speedometer.increase(this.gs.opponent(), 2);
        effects.push(`${this.gs.opponent().name} +2 на спидометре`);
        if (result.died) this.gs.gameOver(this.gs.opponent());
        break;
      }
      case 'shield': {
        this.gs.speedometer.decrease(this.gs.currentPlayer());
        effects.push(`${this.gs.currentPlayer().name} -1 на спидометре`);
        break;
      }
      case 'bless': {
        this.gs.currentPlayer().hasBless = true;
        effects.push(`${this.gs.currentPlayer().name} под защитой Bless`);
        break;
      }
       case 'destroy': {
         const opponent = this.gs.opponent();
         if (opponent.trump) {
           effects.push(`Козырь ${opponent.trump.name} уничтожен`);
           opponent.trump = null;
         }
         break;
       }
       case 'bloodshed': {
         const opponent = this.gs.opponent();
         if (opponent.trump) {
           effects.push(`Козырь ${opponent.trump.name} уничтожен`);
           opponent.trump = null;
         }
         const r = this.gs.speedometer.increase(opponent);
         effects.push(`${opponent.name} +1 на спидометре`);
         if (r.died) this.gs.gameOver(opponent);
         break;
       }
       case 'reincarnation': {
         const opponent = this.gs.opponent();
         if (opponent.trump) {
           effects.push(`Козырь ${opponent.trump.name} уничтожен`);
           opponent.trump = null;
         }
         if (this.gs.trumpDeck.remaining > 0) {
           const newTrump = this.gs.trumpDeck.draw();
           this.gs.queuedTrumps.push({ player: this.gs.currentPlayer().id, trump: newTrump });
           effects.push(`${this.gs.currentPlayer().name} получает новый козырь`);
         }
         break;
       }
       case 'friendship': {
         for (let i = 0; i < 2; i++) {
           if (this.gs.trumpDeck.remaining > 0) {
             this.gs.queuedTrumps.push({ player: this.gs.currentPlayer().id, trump: this.gs.trumpDeck.draw() });
           }
           if (this.gs.trumpDeck.remaining > 0) {
             this.gs.queuedTrumps.push({ player: this.gs.opponent().id, trump: this.gs.trumpDeck.draw() });
           }
         }
         effects.push('Оба игрока получают по 2 козыря');
         break;
       }
    }

    if (effects.length === 0) effects.push('Эффект не сработал (условие не выполнено)');
    this.gs.lastTrumpEffect = effects.join('; ');

    if (callback) callback(trump, effects);
  }
}
