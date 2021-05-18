/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */

import PositionedCharacter from './PositionedCharacter';

export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const randomType = Math.floor(Math.random() * allowedTypes.length);
    const randomLevel = 1 + Math.floor(Math.random() * maxLevel);
    yield new allowedTypes[randomType](randomLevel);
  }
}

export function generateCoordinates(side, boardsize = 8) {
  const positions = [...Array(boardsize ** 2).keys()];
  let allowedPositions;
  if (side === 'player') {
    allowedPositions = positions.filter((pos) => (pos % boardsize === 0 || pos % boardsize === 1));
  } else {
    allowedPositions = positions.filter((pos) => (pos % boardsize === 7 || pos % boardsize === 6));
  }
  return allowedPositions;
}

export function generateTeam(allowedTypes, maxLevel, characterCount, boardSize) {
  const playerCoordinates = generateCoordinates('player', boardSize);
  const enemyCoordinates = generateCoordinates('enemy', boardSize);
  let position;
  let idx;
  const teams = [];
  for (let i = 0; i < characterCount; i += 1) {
    const char = characterGenerator(allowedTypes, maxLevel).next().value;
    if (char.isPlayer) {
      idx = Math.floor(Math.random() * playerCoordinates.length);
      position = playerCoordinates[idx];
      playerCoordinates.slice(idx, 1);
    } else {
      idx = Math.floor(Math.random() * enemyCoordinates.length);
      position = enemyCoordinates[idx];
      enemyCoordinates.slice(idx, 1);
    }
    teams.push(new PositionedCharacter(char, position));
  }
  return teams;
  // TODO: write logic here
}
