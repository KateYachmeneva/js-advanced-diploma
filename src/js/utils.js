export function calcTileType(index, boardSize) {
  const fullboard = boardSize ** 2;
  const calcindex = index + 1;
  let result = '';
  if (calcindex <= boardSize) result += 'top-';
  if (calcindex > fullboard - boardSize) result += 'bottom-';
  switch (true) {
    case Number.isInteger((calcindex - 1) / boardSize):
      result += 'left'; break;
    case Number.isInteger(calcindex / boardSize):
      result += 'right'; break;
    default: result = result.slice(0, -1); break;
  }
  if (result !== '') return result;

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
/**
 * Функция генерирует массив координат в формате {x,y}
 * @returns {{diffX: number, diffY:number}}
 */
function calcDifferentPositions(positionA, positionB, boardSize) {
// представляем одномерный массив в виде массива обьектов с ключами x,y,index
  const coordinates = Array(boardSize ** 2)
    .fill(0)
    .map((e, i) => ({ x: i % boardSize, y: Math.floor(i / boardSize), index: i }));
  const currentXY = coordinates[positionA];
  const nextXY = coordinates[positionB];
  const diffX = Math.abs(nextXY.x - currentXY.x);
  const diffY = Math.abs(nextXY.y - currentXY.y);
  return {
    diffX,
    diffY,
  };
}
export function isStepPossible(curPosition, nextPosition, movedistance, boardSize = 8) {
  const diffCoordinates = calcDifferentPositions(curPosition, nextPosition, boardSize);
  if (diffCoordinates.diffX <= movedistance && diffCoordinates.diffY <= movedistance) {
    if (
      diffCoordinates.diffX === 0
      || diffCoordinates.diffY === 0
      || !Math.abs(diffCoordinates.diffX - diffCoordinates.diffY)
    ) {
      return true;
    }
  }
  return false;
}
/**
 * Функция рассчитывается,если атака возможна
 * @param {Number} curPosition текущая позиция героя
 * @param {Number} enemyPosition позиция врага
 * @param {Number} attackdistance расстояние для атаки
 * @param boardSize значение по умолчанию = 8
 * @returns {boolean} возращает результат
 */
export function isAttackPossible(curPosition, enemyPosition, attackdistance, boardSize = 8) {
  const diffCoordinates = calcDifferentPositions(curPosition, enemyPosition, boardSize);
  return diffCoordinates.diffX <= attackdistance && diffCoordinates.diffY <= attackdistance;
}
