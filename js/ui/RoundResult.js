export class RoundResult {
  constructor() {
    this.modal = document.getElementById('result-modal');
    this.title = document.getElementById('result-title');
    this.body = document.getElementById('result-body');
    this.btnNext = document.getElementById('btn-next');
  }

  show(state) {
    if (!state.lastResult) { this.modal.classList.add('hidden'); return; }

    const r = state.lastResult;
    if (state.phase === 'result') {
      this.modal.classList.remove('hidden');
      if (r.draw) {
        this.title.textContent = 'НИЧЬЯ';
        this.body.innerHTML = `Оба игрока получают +1 на спидометре.<br>${state.players[0].name}: ${r.scores[0]} очков | ${state.players[1].name}: ${r.scores[1]} очков`;
      } else if (r.loser) {
        this.title.textContent = `${r.loser.name} ПРОИГРЫВАЕТ РАУНД!`;
        const loserState = state.players.find(p => p.name === r.loser.name);
        let text = `${state.players[0].name}: ${r.scores[0]} очков | ${state.players[1].name}: ${r.scores[1]} очков\n`;
        text += `${r.loser.name} получает ${r.penalty} на спидометре`;
        if (loserState && loserState.hasOverkill) text += ' (Overkill +1)';
        if (r.blessed) text += '\nBless сработал — стрелка остановлена!';
        if (r.died) text += '\n💀 СТРЕЛКА ДОСТИГЛА 8!';
        this.body.textContent = text;
      }
    } else {
      this.modal.classList.add('hidden');
    }
  }

  onNext(callback) {
    this.btnNext.addEventListener('click', callback);
  }
}
