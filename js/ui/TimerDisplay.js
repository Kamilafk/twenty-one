export class TimerDisplay {
  constructor() {
    this.el = document.getElementById('timer');
    this._lastValue = -1;
  }

  update(state) {
    if (state.timer.active && state.timer.isRunning) {
      const val = state.timer.secondsLeft;
      this.el.textContent = val;
      this.el.classList.toggle('urgent', val <= 3);
    } else {
      this.el.textContent = '';
      this.el.classList.remove('urgent');
    }
  }
}
