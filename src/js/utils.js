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
