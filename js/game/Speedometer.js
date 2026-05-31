export class Speedometer {
  constructor() {
    this.maxSpeed = 8;
  }

  increase(player, amount = 1) {
    if (player.hasBless && player.speed + amount >= this.maxSpeed) {
      player.speed = this.maxSpeed - 1;
      player.hasBless = false;
      return { died: false, blessed: true };
    }
    player.speed = Math.min(player.speed + amount, this.maxSpeed);
    if (player.speed >= this.maxSpeed) {
      player.isDead = true;
      return { died: true, blessed: false };
    }
    return { died: false, blessed: false };
  }

  decrease(player, amount = 1) {
    player.speed = Math.max(0, player.speed - amount);
  }
}
