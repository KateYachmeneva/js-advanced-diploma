export default class GameState {
  constructor(playerTeam, enemyTeam, positions) {
    this.playerTeam = playerTeam;
    this.enemyTeam = enemyTeam;
    this.positions = positions;
    this.level = 1;
    this.score = 0;
    this.topScore = 0;
    this.stage = 'select';
    this.playerTurn = true;
  }

  static from(object) {
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
