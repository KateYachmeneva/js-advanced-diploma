import Character from '../Character';

export default class Vampire extends Character {
  constructor(level) {
    super(level, 'vampire');
    this.attack = 25;
    this.defence = 25;
    this.movedistance = 2;
    this.attackdistance = 2;
    this.isPlayer = false;
  }
}
