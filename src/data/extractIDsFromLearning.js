import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ __filename & __dirname selbst definieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// INPUT
const inputPath = path.join(
  __dirname,
  'results/raw/Learning_skillset.json'
);

// OUTPUT
const outputPath = path.join(
  __dirname,
  'results/processed/learningSkillsetIds.json'
);

// Datei lesen
const rawData = fs.readFileSync(inputPath, 'utf-8');
const data = JSON.parse(rawData);

// SkillSet-UIDs extrahieren (622 wird ignoriert!)
const learningSkillsetIds = data.skillSets
  .map(({ uid }) => uid)
  .filter(Number.isInteger);

// Ergebnis schreiben
fs.writeFileSync(
  outputPath,
  JSON.stringify({ learningSkillsetIds }, null, 2),
  'utf-8'
);

console.log('✅ Fertig! Datei gespeichert unter:', outputPath);
