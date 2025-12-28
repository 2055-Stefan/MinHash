import fs from 'fs';
import { performance } from 'perf_hooks';

/* ===============================
   Jaccard Similarity
================================ */
function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);

  let intersection = 0;
  for (const x of setA) {
    if (setB.has(x)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/* ===============================
   Input laden
================================ */
const focusSkills = JSON.parse(
  fs.readFileSync('./data/input/focus/focusSkillIds.medium.json', 'utf-8')
).focusSkillIds;

const learningResources = JSON.parse(
  fs.readFileSync('./data/input/learning/learningSkillsetIds.medium.json', 'utf-8')
).learningSkillsetIds;

const resourceSkillSets = learningResources.map(id => [id]);

/* ===============================
   Performance-Messung
================================ */
const t0 = performance.now();

// Vergleich
const scores = resourceSkillSets.map(resourceSkills =>
  jaccard(focusSkills, resourceSkills)
);

// Sortierung
scores.sort((a, b) => b - a);

const t1 = performance.now();

/* ===============================
   Statistik
================================ */
const totalTimeSec = (t1 - t0) / 1000;
const perResourceSec = totalTimeSec / resourceSkillSets.length;

const stats = {
  input: {
    focusSkills: focusSkills.length,
    learningResources: resourceSkillSets.length
  },
  jaccardPerformance: {
    totalTimeSeconds: totalTimeSec.toFixed(6),
    timePerResourceSeconds: perResourceSec.toExponential(3)
  }
};

/* ===============================
   Output
================================ */
fs.writeFileSync(
  './output/mz03/jaccard_performance.json',
  JSON.stringify(stats, null, 2),
  'utf-8'
);

console.log('MZ03 abgeschlossen');
console.table(stats.jaccardPerformance);
