import Character from '../Character';

export default class Bowman extends Character {
  constructor(level) {
    super(level, 'bowman');
    this.attack = 25;
    this.defence = 25;
    this.movedistance = 2;
    this.attackdistance = 2;
    this.isPlayer = true;
  }
}
