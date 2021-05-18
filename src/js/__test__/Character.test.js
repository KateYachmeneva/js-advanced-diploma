import Character from '../Character';
import Vampire from '../Characters/Vampire';

test('unable to create instance of Character', () => {
  expect(() => new Character()).toThrowError();
});

test('Class should create instanse of Vampire', () => {
  const vampire = new Vampire(1);
  expect(vampire).toBeDefined();
});

test('Method levelUp() return object with correct parametrs and set health 100,if it is exceded 100', () => {
  const vampire = new Vampire(1);
  vampire.levelUp();
  const referenceObject = {
    attack: 33,
    defence: 33,
    health: 100,
    isPlayer: false,
    level: 2,
    movedistance: 2,
    attackdistance: 2,
    type: 'vampire',
  };
  expect(vampire).toEqual(referenceObject);
});
test('Method levelUp() should throw error for health = 0', () => {
  const vampire = new Vampire(1);
  vampire.health = 0;
  function levelUpError() {
    try {
      return vampire.levelUp();
    } catch (e) {
      throw new Error(e);
    }
  }
  expect(levelUpError).toThrow();
});

test('Method levelUp should set health = 100 if health = 10', () => {
  const vampire = new Vampire(1);
  vampire.health = 10;
  vampire.levelUp();
  expect(vampire.health).toBe(90);
});

test('Method damage should decrease healt correctly if health > 0', () => {
  const vampire = new Vampire(1);
  vampire.health = 50;
  vampire.damage(10);
  expect(vampire.health).toBe(40);
});

test('Method damage should decrease healt correctly if health < 0', () => {
  const vampire = new Vampire(1);
  vampire.health = -50;
  vampire.damage(10);
  expect(vampire.health).toBe(0);
});
