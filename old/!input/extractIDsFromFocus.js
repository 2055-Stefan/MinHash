import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname für ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// INPUT
const inputPath = path.join(
  __dirname,
  'results/raw/Focus_skillset.json'
);

// OUTPUT
const outputPath = path.join(
  __dirname,
  'results/processed/focusSkillIds.medium.json'
);

// Datei laden
const rawData = fs.readFileSync(inputPath, 'utf-8');
const data = JSON.parse(rawData);

// 🔑 NUR skills verwenden (recommendedSkills wird ignoriert)
if (!Array.isArray(data.skills)) {
  throw new Error('❌ data.skills ist kein Array');
}

// UIDs extrahieren
const focusSkillIds = data.skills
  .map(skill => skill.uid)
  .filter(Number.isInteger);

// speichern
fs.writeFileSync(
  outputPath,
  JSON.stringify({ focusSkillIds }, null, 2),
  'utf-8'
);

// Logging
console.log('SKILLS gesamt:', data.skills.length);
console.log('FOCUS SKILL IDS:', focusSkillIds.length);
