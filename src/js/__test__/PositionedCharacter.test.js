import Vampire from '../Characters/Vampire';
import PositionedCharacter from '../PositionedCharacter';

test('should throw error if argument not instanse of Character', () => {
  const object = {};
  expect(() => new PositionedCharacter(object, 1)).toThrow();
});

test('should throw error if second argument not number', () => {
  const vampire = new Vampire(1);
  expect(() => new PositionedCharacter(vampire, '1')).toThrow();
});
