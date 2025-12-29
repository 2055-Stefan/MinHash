import fs from 'fs';

// MEDIUM laden
const data = JSON.parse(
  fs.readFileSync('learningSkillsetIds.medium.json', 'utf-8')
);

const medium = data.learningSkillsetIds;

// ===== PARAMETER =====
const MULTIPLIER = 11;
const START_ID = 100; // 3-stellig, realistisch
// =====================

// Zielgröße
const targetSize = medium.length * MULTIPLIER;
const extraNeeded = targetSize - medium.length;

// vorhandene IDs merken
const used = new Set(medium);

// neue IDs erzeugen
const generated = [];
let candidate = START_ID;

while (generated.length < extraNeeded) {
  if (!used.has(candidate)) {
    generated.push(candidate);
    used.add(candidate);
  }
  candidate++;
}

// LARGE bauen
const large = [...medium, ...generated];

// speichern
fs.writeFileSync(
  'learningSkillsetIds.large.json',
  JSON.stringify({ learningSkillsetIds: large }, null, 2),
  'utf-8'
);

// Logging
console.log('MEDIUM:', medium.length);
console.log('GENERATED:', generated.length);
console.log('LARGE:', large.length);
