import Bowman from './Characters/Bowman';
import Daemon from './Characters/Daemon';
import Magician from './Characters/Magician';
import Swordsman from './Characters/Swordsman';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';

export default class Team {
  constructor() {
    this.playerTeam = [Bowman, Swordsman, Magician];
    this.enemyTeam = [Daemon, Undead, Vampire];
  }
}
