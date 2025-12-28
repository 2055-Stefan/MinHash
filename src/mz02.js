import fs from 'fs';
import { jaccardSimilarity } from './jaccard.js';

/* ===============================
   Input laden
================================ */
const focusSkills = JSON.parse(
  fs.readFileSync('./data/input/focus/focusSkillIds.medium.json', 'utf-8')
).focusSkillIds;

const learningResources = JSON.parse(
  fs.readFileSync('./data/input/learning/learningSkillsetIds.medium.json', 'utf-8')
).learningSkillsetIds;

// Annahme: jede Lernressource besitzt genau einen Skill
const resourceSkillSets = learningResources.map(id => [id]);

/* ===============================
   Jaccard Vergleich (MZ02)
================================ */
const results = resourceSkillSets.map(resourceSkills => ({
  resourceSkills,
  jaccardScore: jaccardSimilarity(focusSkills, resourceSkills)
}));

// Sortierung nach Relevanz (absteigend)
results.sort((a, b) => b.jaccardScore - a.jaccardScore);

/* ===============================
   Output
================================ */
fs.writeFileSync(
  './data/output/mz02/jaccard_sorted.json',
  JSON.stringify(results, null, 2),
  'utf-8'
);

console.log('✅ MZ02 abgeschlossen');
console.log('Lernressourcen:', results.length);