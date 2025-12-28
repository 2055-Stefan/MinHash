import fs from 'fs';

const data = JSON.parse(
  fs.readFileSync('focusSkillIds.medium.json', 'utf-8')
);

const medium = data.focusSkillIds;

// ===== PARAMETER =====
const MULTIPLIER = 11;
const START_ID = 100;
// =====================

const targetSize = medium.length * MULTIPLIER;
const extraNeeded = targetSize - medium.length;

const used = new Set(medium);

const generated = [];
let candidate = START_ID;

while (generated.length < extraNeeded) {
  if (!used.has(candidate)) {
    generated.push(candidate);
    used.add(candidate);
  }
  candidate++;
}

const large = [...medium, ...generated];

fs.writeFileSync(
  'focusSkillIds.large.json',
  JSON.stringify({ focusSkillIds: large }, null, 2),
  'utf-8'
);

console.log('FOCUS MEDIUM:', medium.length);
console.log('GENERATED   :', generated.length);
console.log('FOCUS LARGE :', large.length);
