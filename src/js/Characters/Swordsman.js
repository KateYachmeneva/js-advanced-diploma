import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level) {
    super(level, 'swordsman');
    this.attack = 40;
    this.defence = 10;
    this.movedistance = 4;
    this.attackdistance = 1;
    this.isPlayer = true;
  }
}
