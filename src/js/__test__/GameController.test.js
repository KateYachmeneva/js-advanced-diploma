import { beforeEach, expect, test } from '@jest/globals';
import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';
import Bowman from '../Characters/Bowman';
import Daemon from '../Characters/Daemon';
import PositionedCharacter from '../PositionedCharacter';

let gamePlay = null;
let stateService = null;
let gameCntrl = null;

// Выполняет функцию перед выполнением тестов в текущем файле.
// Если функция возвращает промис или является генератором,
// Jest ждет пока промис разрешится, а затем запускает тесты.
beforeEach(() => {
  const container = document.createElement('div');
  container.setAttribute('id', 'game-container');
  gamePlay = new GamePlay();
  gamePlay.bindToDOM(container);
  stateService = new GameStateService(localStorage);
  gameCntrl = new GameController(gamePlay, stateService);
  gameCntrl.gameState.playerTeam = [new PositionedCharacter(new Bowman(1), 0)];
  gameCntrl.gameState.enemyTeam = [new PositionedCharacter(new Daemon(1), 1)];
  const teams = [...gameCntrl.gameState.playerTeam, ...gameCntrl.gameState.enemyTeam];
  gameCntrl.init();
  gameCntrl.gamePlay.redrawPositions(teams);
});

test('Method getPlayerTeam должен возвращать игровых персонажей', () => {
  const referenceObject = [
    {
      character: {
        attack: 25,
        defence: 25,
        health: 50,
        isPlayer: true,
        level: 1,
        movedistance: 2,
        attackdistance: 2,
        type: 'bowman',
      },
      position: 0,
    },
  ];
  expect(gameCntrl.getPlayerTeam()).toEqual(referenceObject);
});
test('Метод getEnemyTeam должен возвращать npc персонажей', () => {
  const referenceObject = [
    {
      character: {
        attack: 10,
        defence: 40,
        health: 50,
        isPlayer: false,
        level: 1,
        attackdistance: 4,
        movedistance: 1,
        type: 'daemon',
      },
      position: 1,
    },
  ];
  expect(gameCntrl.getEnemyTeam()).toEqual(referenceObject);
});

test('Check method showCellTooltip works, during over the cell', () => {
  gameCntrl.gamePlay.showCellTooltip = jest.fn();
  gameCntrl.onCellEnter(0);
  expect(gameCntrl.gamePlay.showCellTooltip).toBeCalled();
});

test('Check method showCellTooltip not works, during over the EMPTY cell', () => {
  gameCntrl.gamePlay.showCellTooltip = jest.fn();
  gameCntrl.onCellEnter(2);
  expect(gameCntrl.gamePlay.showCellTooltip).toBeCalledTimes(0);
});

test('Method onCellEnter check possibility of movementmovement', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCntrl.gameState.selectedChar = gameCntrl.gameState.playerTeam[0];
  gameCntrl.gamePlay.selectCell = jest.fn();
  gameCntrl.gamePlay.setCursor = jest.fn();
  gameCntrl.onCellEnter(8);
  expect(gameCntrl.gamePlay.selectCell).toHaveBeenCalledWith(8, 'green');
  expect(gameCntrl.gamePlay.setCursor).toHaveBeenCalledWith('pointer');
});

test('if impossible to move movemen selectCell и setCursor will not be called', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCntrl.gameState.selectedChar = gameCntrl.gameState.playerTeam[0];
  gameCntrl.gamePlay.selectCell = jest.fn();
  gameCntrl.gamePlay.setCursor = jest.fn();
  gameCntrl.onCellEnter(38);
  expect(gameCntrl.gamePlay.selectCell).toBeCalledTimes(0);
  expect(gameCntrl.gamePlay.setCursor).toBeCalledTimes(0);
});

test('Method onCellEnter check possibility of attack', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCntrl.gameState.selectedChar = gameCntrl.gameState.playerTeam[0];
  gameCntrl.gamePlay.selectCell = jest.fn();
  gameCntrl.gamePlay.setCursor = jest.fn();
  gameCntrl.onCellEnter(1);

  expect(gameCntrl.gamePlay.selectCell).toHaveBeenCalledWith(1, 'red');
  expect(gameCntrl.gamePlay.setCursor).toHaveBeenCalledWith('crosshair');
});

test('if attack impossibille method selectCell not be called', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCntrl.gameState.selectedChar = gameCntrl.gameState.playerTeam[0];
  gameCntrl.gameState.selectedChar.position = 58;
  gameCntrl.gamePlay.selectCell = jest.fn();
  gameCntrl.gamePlay.setCursor = jest.fn();
  gameCntrl.onCellEnter(1);

  expect(gameCntrl.gamePlay.selectCell).toBeCalledTimes(0);
  expect(gameCntrl.gamePlay.setCursor).toBeCalled();
});

test('Method onCellClick will point and select character if it is in cell', () => {
  gameCntrl.gamePlay.selectCell = jest.fn();
  gameCntrl.gamePlay.setCursor = jest.fn();
  gameCntrl.onCellClick(0);
  expect(gameCntrl.gamePlay.selectCell).toHaveBeenCalledWith(0);
  expect(gameCntrl.gamePlay.setCursor).toHaveBeenCalledWith('pointer');
});

test('Method onCellClick check, if it is possible to move, if so , move', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCntrl.gameState.selectedChar = gameCntrl.gameState.playerTeam[0];
  gameCntrl.posStep = true;
  gameCntrl.gamePlay.showTooltip = jest.fn();
  gameCntrl.endOfTurn = jest.fn();
  gameCntrl.onCellClick(8);
  expect(gameCntrl.endOfTurn).toBeCalled();
});
test('Method onCellClick check, if it is impossible to move, inform', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCntrl.gameState.selectedChar = gameCntrl.gameState.playerTeam[0];
  gameCntrl.posStep = false;
  gameCntrl.gamePlay.showTooltip = jest.fn();
  gameCntrl.onCellClick(40);
  expect(gameCntrl.gamePlay.showTooltip).toHaveBeenCalledWith(
    'Information',
    'Impossible to go here!',
    'warning',
  );
});

// test('Method onCellClick check, if it is possible to attack, if so , attack', () => {
//   // eslint-disable-next-line prefer-destructuring
//   gameCntrl.gameState.selectedChar = gameCntrl.gameState.playerTeam[0];
//   gameCntrl.posStep = true;
//   gameCntrl.posAttac = true;
//   gameCntrl.attackOtherSide = jest.fn();
//   gameCntrl.onCellClick(1);
//   expect(gameCntrl.attackOtherSide).toBeCalled();
// });
test(
  'Method onCellClick check the movedistance ,if attack imposible, inform user',
  () => {
    // eslint-disable-next-line prefer-destructuring
    gameCntrl.gameState.selectedChar = gameCntrl.gameState.playerTeam[0];
    gameCntrl.gameState.selectedChar.character.movedistance = 0;
    gameCntrl.posStep = true;
    gameCntrl.posAttac = false;
    gameCntrl.gamePlay.showTooltip = jest.fn();
    gameCntrl.onCellClick(1);
    expect(gameCntrl.gamePlay.showTooltip).toHaveBeenCalledWith(
      'Information',
      'To far...',
      'warning',
    );
  },
);

test('method onCellLeave calls hideCellTooltip', () => {
  gameCntrl.gamePlay.hideCellTooltip = jest.fn();
  gameCntrl.onCellLeave(1);
  expect(gameCntrl.gamePlay.hideCellTooltip).toBeCalled();
});
test('Method onNewGame calls  unsubscribeAllMouseListeners, prepareGame, clickOnCells, overOnCells, leaveOnCells, renderScore, gamePlay.showTooltip', () => {
  gameCntrl.gamePlay.unsubscribeAllMouseListeners = jest.fn();
  gameCntrl.prepareGame = jest.fn();
  gameCntrl.clickOnCells = jest.fn();
  gameCntrl.enterOnCells = jest.fn();
  gameCntrl.leaveOnCells = jest.fn();
  gameCntrl.renderScore = jest.fn();
  gameCntrl.gamePlay.showTooltip = jest.fn();
  gameCntrl.onNewGame();
  expect(gameCntrl.gamePlay.unsubscribeAllMouseListeners).toBeCalled();
  expect(gameCntrl.prepareGame).toBeCalled();
  expect(gameCntrl.clickOnCells).toBeCalled();
  expect(gameCntrl.enterOnCells).toBeCalled();
  expect(gameCntrl.leaveOnCells).toBeCalled();
  expect(gameCntrl.renderScore).toBeCalled();
  expect(gameCntrl.gamePlay.showTooltip).toHaveBeenCalledWith(
    'Information',
    'A new game has begun',
    'info',
  );
});
test('Method onSaveGame calls method save', () => {
  gameCntrl.stateService.save = jest.fn();
  gameCntrl.gamePlay.showTooltip = jest.fn();
  gameCntrl.onSaveGame();
  expect(gameCntrl.stateService.save).toBeCalled();
  expect(gameCntrl.gamePlay.showTooltip).toHaveBeenCalledWith('Information', 'Game saved', 'info');
});

test('Method onLoadGame calls method load, gamePlay.redrawPositions, showTooltip', () => {
  gameCntrl.gamePlay.redrawPositions = jest.fn();
  gameCntrl.renderScore = jest.fn();
  gameCntrl.gamePlay.showTooltip = jest.fn();
  gameCntrl.onSaveGame();
  gameCntrl.onLoadGame();
  expect(gameCntrl.renderScore).toBeCalled();
  expect(gameCntrl.gamePlay.showTooltip).toHaveBeenCalledWith('Information', 'Game loaded', 'info');
});

test('Method onLoadGame calls method load, if method load throw error, catch it', () => {
  gameCntrl.stateService.storage = { getItem: () => new Error() };
  expect(() => gameCntrl.onLoadGame()).toThrow();
});

test('Method attackOtherSide will not work, if player or enemy character were not setted', () => {
  gameCntrl.attackOtherSide(null, null);
  expect(gameCntrl.attackOtherSide(null, null)).toBe(undefined);
});

test('Method attackOtherSide calls showDamage', () => {
  gameCntrl.gamePlay.showDamage = jest.fn(() => Promise.resolve('test'));
  gameCntrl.attackOtherSide(gameCntrl.gameState.playerTeam[0], gameCntrl.gameState.enemyTeam[0]);
  expect(gameCntrl.gamePlay.showDamage).toBeCalled();
});

test('Метод stepET calls method attackOtherSide, if enemy can attack player', () => {
  gameCntrl.attackOtherSide = jest.fn();
  gameCntrl.stepET();
  expect(gameCntrl.attackOtherSide).toBeCalled();
});

test('Method stepET will finish call,if there is no characters', () => {
  gameCntrl.gameState.enemyTeam = [];
  gameCntrl.stepET();
  expect(gameCntrl.stepET()).toBe(undefined);
});

test('Method stepET will call endOfTurn, if enemyTeam can not attack, but can move.', () => {
  gameCntrl.gameState.enemyTeam[0].position = 55;
  gameCntrl.endOfTurn = jest.fn();
  gameCntrl.posStep = jest.fn(() => 54);
  gameCntrl.stepET();
  expect(gameCntrl.endOfTurn).toBeCalled();
});
test('Method endOfTurn must return redrawPositions, if enemy kills player', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCntrl.gameState.selectedChar = gameCntrl.gameState.enemyTeam[0];
  gameCntrl.gameState.selectedChar.character.health = 0;
  gameCntrl.gamePlay.redrawPositions = jest.fn();
  gameCntrl.endOfTurn();
  expect(gameCntrl.gamePlay.redrawPositions).toBeCalled();
});

test('Method endOfTurn must call GamePlay.showMessage, if in playerTeam there are no characters', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCntrl.gameState.selectedChar = gameCntrl.gameState.enemyTeam[0];
  gameCntrl.gameState.selectedChar.character.health = 0;
  gameCntrl.getPlayerTeam = jest.fn(() => []);
  GamePlay.showMessage = jest.fn();
  gameCntrl.endOfTurn();
  expect(GamePlay.showMessage).toBeCalled();
});

test('Method endOfTurn set playerTurn in true, if brfore it was enemy turn', () => {
  // eslint-disable-next-line prefer-destructuring
  gameCntrl.gameState.selectedChar = gameCntrl.gameState.enemyTeam[0];
  gameCntrl.nextLevel = jest.fn();
  gameCntrl.gameState.playerTurn = false;
  gameCntrl.endOfTurn();
  expect(gameCntrl.gameState.playerTurn).toBeTruthy();
});

test('Method nextLevel, should call method unsubscribe', () => {
  gameCntrl.gamePlay.showTooltip = jest.fn();
  gameCntrl.gamePlay.unsubscribe = jest.fn();
  gameCntrl.nextLevel();
  expect(gameCntrl.gamePlay.unsubscribe).toBeCalled();
});

test('Method nextLevel, should call method endGame, if all levels done', () => {
  gameCntrl.gameState.level = 5;
  gameCntrl.gamePlay.showTooltip = jest.fn();
  gameCntrl.endGame = jest.fn();
  gameCntrl.gamePlay.unsubscribe = jest.fn();
  gameCntrl.nextLevel();
  expect(gameCntrl.endGame).toBeCalled();
});
test('Method nextLevel, should call methods, if exced next level', () => {
  gameCntrl.clickOnCells = jest.fn();
  gameCntrl.enterOnCells = jest.fn();
  gameCntrl.leaveOnCells = jest.fn();
  gameCntrl.gamePlay.redrawPositions = jest.fn();
  gameCntrl.gamePlay.showTooltip = jest.fn();
  gameCntrl.gamePlay.unsubscribe = jest.fn();
  gameCntrl.nextLevel();
  expect(gameCntrl.clickOnCells).toBeCalled();
  expect(gameCntrl.leaveOnCells).toBeCalled();
  expect(gameCntrl.enterOnCells).toBeCalled();
  expect(gameCntrl.gamePlay.unsubscribe).toBeCalled();
  expect(gameCntrl.gamePlay.showTooltip).toHaveBeenCalledWith('Information', 'Next level', 'info');
});
test('Method endGame, should call renderScore, GamePlay.showMessage and GamePlay.unsubscribeAllMouseListeners if player win', () => {
  gameCntrl.gameState.level = 5;
  gameCntrl.gamePlay.showTooltip = jest.fn();
  gameCntrl.renderScore = jest.fn();
  gameCntrl.gamePlay.unsubscribeAllMouseListeners = jest.fn();
  GamePlay.showMessage = jest.fn();
  gameCntrl.endGame();
  expect(gameCntrl.renderScore).toBeCalled();
  expect(gameCntrl.gamePlay.unsubscribeAllMouseListeners).toBeCalled();
  expect(GamePlay.showMessage).toHaveBeenCalledWith('You Won!');
});
