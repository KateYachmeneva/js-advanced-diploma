import Character from '../js/Character';
import { classGenerator, characterGenerator } from '../js/generators';

test('unable to create instance of Character', () => {
  expect(() => new Character()).toThrowError();
});

test('should create correct instance of Character', () => {
  const options = [{ attack: 40, defence: 10, type: 'swordsman' }];
  const type = [...classGenerator(options)];
  const char = [...characterGenerator(type, 1)];
  expect(char[0] instanceof Character).toBe(true);
});
