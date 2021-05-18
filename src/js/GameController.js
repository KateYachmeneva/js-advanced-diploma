/* eslint-disable no-plusplus */
/* eslint-disable no-proto */
import { generateTeam, generateCoordinates } from './generators';
import { isAttackPossible, isStepPossible } from './utils';
import cursors from './cursors';
import themes from './themes';
import Team from './Team';
import GamePlay from './GamePlay';
import GameState from './GameState';
import Character from './Character';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerTeam = generateTeam(new Team().playerTeam, 1, 2, this.gamePlay.boardSize);
    this.enemyTeam = generateTeam(new Team().enemyTeam, 1, 2, this.gamePlay.boardSize);
    this.boardsize = 8;
    this.positions = [...Array(this.boardsize ** 2).keys()];
    // инициализация стейта
    this.gameState = new GameState(this.playerTeam, this.enemyTeam, this.positions);
  }
  // team.playerTeams.length на всех уровнях равно team.enemyTeams.length

  init() {
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions([...this.playerTeam, ...this.enemyTeam]);
    this.clickOnCells();
    this.enterOnCells();
    this.leaveOnCells();
    this.clickOnNewGame();
    this.clickOnSaveGame();
    this.clickOnLoadGame();
  }

  prepareGame() {
    this.gameState = new GameState(this.playerTeam, this.enemyTeam, this.positions);
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gameState.selectedChar = null;
    this.gameState.playerTurn = true;
    this.gamePlay.redrawPositions([...this.playerTeam, ...this.enemyTeam]);
  }

  // Подписки на события
  onCellEnter(index) {
    const isCharacter = this.haveCharacter(index);
    const currChar = this.findCharacter(index);
    // Если в ячейке пермонаж,показываем его бейдж
    if (isCharacter) {
      this.gamePlay.showCellTooltip(`🎖 ${currChar.character.level} ⚔ ${currChar.character.attack} 🛡 ${currChar.character.defence} ❤ ${currChar.character.health} `, index);
    }
    // Если есть выбранный персонаж и,наведенная ячейка пуста
    if (this.gameState.selectedChar && !isCharacter) {
    // проверяем возможно ли перемещение
      const { movedistance } = this.gameState.selectedChar.character;
      this.posStep = isStepPossible(this.gameState.selectedChar.position, index, movedistance);
      if (this.posStep) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor(cursors.pointer);
      }
    }
    // Если в наведенной ячейки персонаж команды Enemy (и выбран игрок)
    // Рассчитываем возможность атаки
    if (isCharacter) {
      if (this.gameState.selectedChar && !currChar.character.isPlayer) {
        const { attackdistance } = this.gameState.selectedChar.character;
        // eslint-disable-next-line max-len
        this.posAttac = isAttackPossible(this.gameState.selectedChar.position, index, attackdistance);
        if (this.posAttac) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellClick(index) {
    if (this.gameState.selectedChar) {
      this.gamePlay.deselectCell(this.gameState.selectedChar.position);
    }
    const isCharacter = this.haveCharacter(index);
    const currentChar = this.findCharacter(index);
    // Проверяем ячейку, есть ли персонаж.
    if (isCharacter) {
      // если персонаж команды Игроков,то присваиваем его в selectedCharacter
      if (currentChar && currentChar.character.isPlayer) {
        this.gameState.selectedChar = currentChar;
        this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-yellow'));
        this.gamePlay.selectCell(index);
        this.prevSelectedCharIndex = index;
        this.gamePlay.setCursor(cursors.pointer);
      }
    }
    // Если перемещение доступно,фильтруем стейт,добавляем измененного героя и рендерим поле
    if (this.gameState.selectedChar && this.posStep && !isCharacter) {
      this.gameState.playerTeam = this.filterCharacter(this.gameState.selectedChar);
      this.gameState.playerTeam = [...this.gameState.playerTeam, this.gameState.selectedChar];
      this.gameState.selectedChar.position = index;
      this.endOfTurn();
    }
    // Если возможна атака атакуем
    const selCharPos = this.gameState.selectedChar.position;
    if (this.posAttac && this.gameState.selectedChar && selCharPos !== index) {
      this.attackOtherSide(this.gameState.selectedChar, currentChar);
    }
    // если ходить на ячейку нельзя,выводим уведомление
    if (!this.posStep && !isCharacter && this.gameState.selectedChar) {
      this.gamePlay.showTooltip('Information', 'Impossible to go here!', 'warning');
      return;
    }
    // Если range атаки не достаточно, уведомляем о том что атаковать врага нельзя.
    if (isCharacter && this.gameState.selectedChar && !currentChar.character.isPlayer) {
      this.gamePlay.showTooltip('Information', 'To far...', 'warning');
      return;
    }

    // Если клик был произведен по ячейке с неигровым персонажей, уведомляем об этой пользователя
    if (isCharacter && !currentChar.character.isPlayer) {
      this.gamePlay.showTooltip('Information', 'This is not a playable character!', 'danger');
    }
  }

  onCellLeave(index) {
    this.gamePlay.setCursor(cursors.pointer);
    this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-green', 'selected-red'));
    this.gamePlay.hideCellTooltip(index);
  }

  // начать новую игру
  onNewGame() {
    this.gamePlay.unsubscribeAllMouseListeners();
    this.prepareGame();
    this.clickOnCells();
    this.enterOnCells();
    this.leaveOnCells();
    this.renderScore();
    this.gamePlay.showTooltip('Information', 'A new game has begun', 'info');
  }

  // Сохранить игру
  onSaveGame() {
    this.gamePlay.showTooltip('Information', 'Game saved', 'info');
    this.stateService.save(this.gameState);
  }

  // Загрузка игры
  onLoadGame() {
    this.gameState.selectedChar = null;
    let loadState = null;
    try {
      loadState = this.stateService.load();
    } catch (e) {
      this.gamePlay.showTooltip('Information', e, 'danger');
      return;
    }
    loadState.playerTeam = loadState.playerTeam.reduce((acc, prev) => {
      // eslint-disable-next-line no-param-reassign
      prev.character.__proto__ = Character.prototype;
      acc.push(prev);
      return acc;
    }, []);
    loadState.enemyTeam = loadState.enemyTeam.reduce((acc, prev) => {
      // eslint-disable-next-line no-param-reassign
      prev.character.__proto__ = Character.prototype;
      acc.push(prev);
      return acc;
    }, []);
    this.gameState.enemyTeam = loadState.enemyTeam;
    this.gameState.playerTeam = loadState.playerTeam;
    this.gameState.playerTurn = loadState.playerTurn;
    this.gameState.score = loadState.score;
    this.gameState.topscore = loadState.topscore;
    this.gameState.level = loadState.level;
    this.gamePlay.drawUi(themes[loadState.level]);
    this.gamePlay.redrawPositions([...this.gameState.playerTeam, ...this.gameState.enemyTeam]);
    this.renderScore();
    this.gamePlay.showTooltip('Information', 'Game loaded', 'info');
  }

  clickOnCells() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  enterOnCells() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
  }

  leaveOnCells() {
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  clickOnNewGame() {
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
  }

  clickOnSaveGame() {
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
  }

  clickOnLoadGame() {
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  // Получаем enemyteam

  getEnemyTeam() {
    return (this.gameState.enemyTeam.filter((char) => !char.character.isPlayer));
  }

  // Получаем playersteam
  getPlayerTeam() {
    return (this.gameState.playerTeam.filter((char) => char.character.isPlayer));
  }

  // Проверка ячейки на наличие в ней персонажа
  haveCharacter(index) {
    const concatTeams = [...this.gameState.enemyTeam, ...this.gameState.playerTeam];
    return concatTeams.some((char) => char.position === index);
  }
  // Ищем персонажа по индексу

  findCharacter(index) {
    let results;
    results = this.gameState.playerTeam.find((char) => char.position === index);
    if (!results) {
      results = this.gameState.enemyTeam.find((char) => char.position === index);
    }
    return results;
  }

  // фильтр персонажей ,кроме тех,что на той же позиции

  filterCharacter(character) {
    let results;
    if (character.character.isPlayer) {
      results = this.gameState.playerTeam.filter((char) => char.position !== character.position);
    } else {
      results = this.gameState.enemyTeam.filter((char) => char.position !== character.position);
    }

    return results;
  }

  // Универсальная атака для Enemy и Player
  attackOtherSide(attacker, sufferer) {
  // Отписка от событий клик,что бы не мешали атаке
    this.gamePlay.unsubscribe();
    if (!attacker || !sufferer) {
      return;
    }
    const enemy = sufferer;
    const attackPoints = +Math.max(
      attacker.character.attack - enemy.character.defence,
      attacker.character.attack * 0.1,
    ).toFixed();
    if (sufferer.character.isPlayer) {
      this.gameState.playerTeam = this.filterCharacter(sufferer);
    } else {
      this.gameState.enemyTeam = this.filterCharacter(sufferer);
    }
    enemy.character.damage(attackPoints);
    if (enemy.character.health > 0) {
      if (enemy.character.isPlayer) {
        this.gameState.playerTeam = [...this.gameState.playerTeam, enemy];
      } else {
        this.gameState.enemyTeam = [...this.gameState.enemyTeam, enemy];
      }
    }
    this.gamePlay.showDamage(sufferer.position, attackPoints)
      .then(() => {
        this.clickOnCells();
      })
      .then(() => this.endOfTurn());
  }

  // ход команды Enemy
  stepET() {
    if (!this.getEnemyTeam().length || !this.getPlayerTeam().length) {
      return;
    }
    const enemyTeam = this.getEnemyTeam();
    const playerTeam = this.getPlayerTeam();
    // Проверяем какой из enemy может атаковать персонажей коианды Игроков и создаем массив
    const canBeAttacked = enemyTeam.reduce((acc, prev) => {
      const playerChar = [];
      playerTeam.forEach((userChar, index) => {
        const attackDis = prev.character.attackdistance;
        const posAttac = isAttackPossible(prev.position, userChar.position, attackDis);
        if (posAttac) {
          playerChar.push(playerTeam[index]);
        }
      });
      if (playerChar.length > 0) {
        acc.push({
          enemy: prev,
          playerChar,
        });
      }
      return acc;
    }, []);
    // Выбираем рандомно персонажа для атаки
    const randomIndex = Math.floor(Math.random() * canBeAttacked.length);
    const attacker = canBeAttacked[randomIndex];
    // Если возможна атака - атакуем,
    // иначе находим куда сходить
    if (attacker) {
      const sufferer = attacker.playerChar[Math.floor(Math.random() * attacker.playerChar.length)];
      this.attackOtherSide(attacker.enemy, sufferer);
    } else {
      const enemy = enemyTeam[Math.floor(Math.random() * enemyTeam.length)];
      const concatTeams = [...this.gameState.playerTeam, ...this.gameState.enemyTeam];
      const occupiedPositions = concatTeams.reduce((acc, prev) => {
        acc.push(prev.position);
        return acc;
      }, []);

      const arrSuteCell = new Array(this.gamePlay.boardSize ** 2)
        .fill(0)
        // eslint-disable-next-line no-plusplus
        // eslint-disable-next-line no-param-reassign
        .map((e, i) => i++)
        .filter((position) => !occupiedPositions.includes(position));
      const indexStep = () => {
        const idx = Math.floor(Math.random() * arrSuteCell.length);
        const move = isStepPossible(enemy.position, arrSuteCell[idx], enemy.character.movedistance);
        if (!move) {
          arrSuteCell.splice(idx, 1);
          // и поехали дальше искать,куда двигать,пока ненайдем
          return indexStep();
        }
        return arrSuteCell[idx];
      };
      const indexSteps = indexStep();
      this.gameState.enemyTeam = this.filterCharacter(enemy);
      enemy.position = indexSteps;
      this.gameState.enemyTeam = [...this.gameState.enemyTeam, enemy];
      this.endOfTurn();
    }
  }

  // Переход хода
  endOfTurn() {
    // если игрока убили ,рендерим поле и зануляем свойство
    if (!this.gameState.selectedChar.character.health) {
      this.gameState.selectedChar = null;
      this.gamePlay.redrawPositions([...this.gameState.playerTeam, ...this.gameState.enemyTeam]);
    }
    // Если в команде игроков не осталось персонажей,выводим сообщение о проигрыше
    if (!this.getPlayerTeam().length) {
      this.gamePlay.redrawPositions([...this.gameState.playerTeam, ...this.gameState.enemyTeam]);
      GamePlay.showMessage('Вы проиграли!');
      this.gamePlay.unsubscribeAllMouseListeners();
      return;
    }
    // Если все персонажи команды врага убиты начинаем новый уровень
    if (!this.getEnemyTeam().length) {
      this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-yellow', 'selected-green', 'selected-red'));
      this.gamePlay.setCursor(cursors.auto);
      this.gameState.playerTurn = false;
      this.nextLevel();
      return;
    }
    this.prevSelectedCharIndex = null;
    this.gamePlay.cells.forEach((cell) => cell.classList.remove('selected-yellow'));
    this.gamePlay.redrawPositions([...this.gameState.playerTeam, ...this.gameState.enemyTeam]);
    if (this.gameState.selectedChar) {
      this.gamePlay.selectCell(this.gameState.selectedChar.position);
    }
    // если true передаем ход enemy ,иначе ходит player
    if (this.gameState.playerTurn) {
      this.gameState.playerTurn = false;
      this.stepET();
    } else {
      this.gameState.playerTurn = true;
    }
  }

  //  Переход на следующий уровень
  nextLevel() {
    this.gamePlay.unsubscribe();
    this.gameState.level += 1;
    if (this.gameState.level > 4) {
      this.endGame();
      return;
    }
    this.gamePlay.drawUi(themes[this.gameState.level]);
    const newScore = this.gameState.score
    + this.gameState.playerTeam.reduce((acc, prev) => acc + prev.character.health, 0);
    this.gameState.score = newScore;
    this.renderScore();
    const playerCoordinates = generateCoordinates('player', this.gamePlay.boardSize);
    const levelUpPlayers = this.gameState.playerTeam.reduce((acc, prev) => {
      prev.character.levelUp();
      acc.push(prev);
      return acc;
    }, []);
    this.gameState.playerTeam = levelUpPlayers;
    const quantityChar = this.gameState.level > 3 ? 2 : 1;
    const newPlayerTeam = generateTeam(
      new Team().playerTeam, this.gameState.level - 1, quantityChar,
    );
    const updatePlayers = [...this.gameState.playerTeam, ...newPlayerTeam].reduce((acc, prev) => {
      const idx = Math.floor(Math.random() * playerCoordinates.length);
      // eslint-disable-next-line no-param-reassign
      prev.position = playerCoordinates[idx];
      playerCoordinates.splice(idx, 1);
      acc.push(prev);
      return acc;
    }, []);
    this.gameState.playerTeam = updatePlayers;
    const newEnemyTeam = generateTeam(
      new Team().enemyTeam, this.gameState.level, this.getPlayerTeam().length,
    );
    const levelUpEnemy = newEnemyTeam.reduce((acc, prev) => {
      prev.character.levelUp();
      acc.push(prev);
      return acc;
    }, []);
    this.gameState.enemyTeam = levelUpEnemy;
    this.gamePlay.redrawPositions([...this.gameState.playerTeam, ...this.gameState.enemyTeam]);
    this.clickOnCells();
    this.enterOnCells();
    this.leaveOnCells();
    this.gamePlay.showTooltip('Information', 'Next level', 'info');
  }

  endGame() {
    this.gamePlay.redrawPositions([...this.gameState.playerTeam, ...this.gameState.enemyTeam]);
    const level = this.gameState.level - 1;
    const newScore = this.gameState.score
     + this.gameState.playerTeam.reduce((acc, prev) => acc + prev.character.health, 0);
    this.gameState.level = level;
    this.gameState.score = newScore;
    this.renderScore();
    GamePlay.showMessage('You Won!');
    this.gamePlay.unsubscribeAllMouseListeners();
  }

  // Отрисовка очков
  renderScore() {
    const levelElement = this.gamePlay.container.querySelector('.level-value');
    const scoreElement = this.gamePlay.container.querySelector('.score-value');
    const recordElement = this.gamePlay.container.querySelector('.record-value');
    levelElement.textContent = this.gameState.level;
    scoreElement.textContent = this.gameState.score;
    const newTopScore = this.gameState.topScore > this.gameState.score
      ? this.gameState.topScore : this.gameState.score;
    this.gameState.topScore = newTopScore;
    recordElement.textContent = this.gameState.topScore;
  }
}
