/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
import Character from './Character';

export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const randomType = Math.floor(Math.random() * allowedTypes.length);
    const randomLevel = 1 + Math.floor(Math.random() * maxLevel);
    yield new allowedTypes[randomType](randomLevel);
  }
}

export function* classGenerator(options) {
  for (let i = 0; i < options.length; i += 1) {
    const option = options[i];
    yield class extends Character {
      constructor(level) {
        super(level);
        this.attack = option.attack;
        this.defence = option.defence;
        this.type = option.type;
        this.atkradius = option.atkradius;
        this.moveradius = option.moveradius;
      }
    };
  }
}

// const options = [
//   { attack: 25, defence: 25, type: 'Bowman' },
//   { attack: 40, defence: 10, type: 'Swordsman' },
//   { attack: 10, defence: 40, type: 'Magician' },
//   { attack: 25, defence: 25, type: 'Vampire' },
//   { attack: 40, defence: 10, type: 'Undead' },
//   { attack: 10, defence: 40, type: 'Daemon' },
// ];
// export function increaseLevel(char) {
//   char.levelUp();
//   char.level += 1;
//   char.health = 50;
// }
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  for (let i = 0; i < characterCount; i += 1) {
    const char = characterGenerator(allowedTypes, maxLevel).next().value;
    if (maxLevel === 1) { allowedTypes.splice(2); }
    team.push(char);
  }
  return team;
  // TODO: write logic here
}
// const options = [{ attack: 40, defence: 10, type: 'swordsman' }];
// const type = [...classGenerator(options)];
// const char = [...characterGenerator(type, 1)];
// console.log(type);
// console.log(char);