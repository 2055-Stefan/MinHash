import fs from 'fs';

const data = JSON.parse(
  fs.readFileSync('focusSkillIds.medium.json', 'utf-8')
);

const medium = data.focusSkillIds;

const factor = 3 / 8;
const targetSize = Math.round(medium.length * factor);

const small = medium.slice(0, targetSize);

fs.writeFileSync(
  'focusSkillIds.small.json',
  JSON.stringify({ focusSkillIds: small }, null, 2),
  'utf-8'
);

console.log('FOCUS MEDIUM:', medium.length);
console.log('FOCUS SMALL :', small.length);
