export class TrumpDisplay {
  constructor() {
    this.nameEl = document.getElementById('trump-name');
    this.descEl = document.getElementById('trump-desc');
    this.overlay = document.getElementById('trump-effect-overlay');
    this.overlayContent = document.getElementById('trump-effect-content');
  }

  update(state) {
    if (state.activeTrump) {
      this.nameEl.textContent = state.activeTrump.name;
      this.descEl.textContent = state.activeTrump.desc;
      this.nameEl.style.color = this._categoryColor(state.activeTrump.category);
    } else {
      this.nameEl.textContent = '-';
      this.descEl.textContent = 'Ожидание...';
    }
  }

  showEffect(text) {
    this.overlayContent.textContent = text;
    this.overlay.classList.remove('hidden');
    setTimeout(() => {
      this.overlay.classList.add('hidden');
    }, 2000);
  }

  _categoryColor(cat) {
    const colors = {
      card: '#c49a3c',
      target: '#8b0000',
      stake: '#ff6644',
      defense: '#44aaff',
      interactive: '#aa44ff'
    };
    return colors[cat] || '#ffffff';
  }
}
