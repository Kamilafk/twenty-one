export class Speedometer3D {
  constructor() {
    this.canvas = document.getElementById('speedo-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.p1Label = document.getElementById('speedo-p1');
    this.p2Label = document.getElementById('speedo-p2');
  }

  update(state) {
    const p1 = state.players[0];
    const p2 = state.players[1];
    this._draw(p1.speed, p2.speed);
    this.p1Label.textContent = `P1: ${p1.speed}/8`;
    this.p2Label.textContent = `P2: ${p2.speed}/8`;
  }

  _draw(speed1, speed2) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h - 10;
    const radius = 120;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;

    // Arc background
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 20;
    ctx.stroke();

    // Tick marks (1-8)
    for (let i = 1; i <= 8; i++) {
      const angle = startAngle + ((endAngle - startAngle) * i) / 8;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = i === 8 ? '#8b0000' : '#3a3a3a';
      ctx.fill();

      ctx.fillStyle = i === 8 ? '#8b0000' : '#666';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelX = cx + Math.cos(angle) * (radius - 14);
      const labelY = cy + Math.sin(angle) * (radius - 14);
      ctx.fillText(i, labelX, labelY);
    }

    // Player 1 arrow (red)
    this._drawArrow(ctx, cx, cy, radius, speed1, '#ff4444', 3);
    // Player 2 arrow (blue)
    this._drawArrow(ctx, cx, cy, radius, speed2, '#4488ff', 3);
  }

  _drawArrow(ctx, cx, cy, radius, speed, color, width) {
    const maxAngle = Math.PI;
    const angle = Math.PI + (maxAngle * speed) / 8;
    const len = radius - 8;

    const x = cx + Math.cos(angle) * len;
    const y = cy + Math.sin(angle) * len;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Arrow head
    const headLen = 8;
    const headAngle = 0.4;
    const hx1 = x - Math.cos(angle - headAngle) * headLen;
    const hy1 = y - Math.sin(angle - headAngle) * headLen;
    const hx2 = x - Math.cos(angle + headAngle) * headLen;
    const hy2 = y - Math.sin(angle + headAngle) * headLen;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(hx1, hy1);
    ctx.lineTo(hx2, hy2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}
