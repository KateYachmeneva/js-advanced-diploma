export default class Character {
  constructor(level, type = 'generic') {
    if (new.target.name === 'Character') {
      throw new Error('Forbidden to create Character class instance');
    }
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
  }

  levelUp() {
    if (!this.health) {
      throw new Error('can not upgrade death character');
    }
    this.attack = Math.max(this.attack, Math.round(this.attack * (0.8 + this.health / 100)));
    this.defence = Math.max(this.defence, Math.round(this.defence * (0.8 + this.health / 100)));
    this.level += 1;
    this.health += 80;
    if (this.health > 100) {
      this.health = 100;
    }
  }

  damage(points) {
    if (this.health > 0) {
      this.health -= points;
    }
    if (this.health < 0) {
      this.health = 0;
    }
  }
}
