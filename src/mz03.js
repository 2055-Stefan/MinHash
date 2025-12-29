// mz03.js
// MZ03: Performance-Messung (nur Jaccard) – misst Filterung, Vergleich, Sortierung
// Inputs:
//  - ./data/input/focus/focusSkillIds.medium.json
//  - ./data/output/learning/learningSkillsetsWithSkills.medium.json
// Output:
//  - ./data/output/mz03/jaccard_performance.json

import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";
import { jaccardSimilarity } from "./jaccard.js";

/* ===============================
   Helpers
================================ */
function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function nowSec() {
  return performance.now() / 1000;
}

function isNonEmptyIntArray(arr) {
  return Array.isArray(arr) && arr.length > 0 && arr.every(Number.isInteger);
}

/* ===============================
   Paths
================================ */
const FOCUS_FILE = "./data/input/focus/focusSkillIds.medium.json";
const LEARNING_WITH_SKILLS_FILE =
  "./data/input/learning/learningSkillsetsWithSkills.medium.json";
const OUTPUT_FILE = "./data/output/mz03/jaccard_performance.json";

/* ===============================
   Load Inputs
================================ */
const focusSkills = JSON.parse(fs.readFileSync(FOCUS_FILE, "utf-8")).focusSkillIds;
if (!isNonEmptyIntArray(focusSkills)) {
  throw new Error("focusSkillIds fehlen oder sind leer/ungültig.");
}

const learningData = JSON.parse(
  fs.readFileSync(LEARNING_WITH_SKILLS_FILE, "utf-8")
);

const learningSkillsets = learningData.skillsets;
if (!Array.isArray(learningSkillsets) || learningSkillsets.length === 0) {
  throw new Error("learningData.skillsets fehlt oder ist leer.");
}

/* ===============================
   MZ03 Timings
   - Filterung: welche Lernressourcen werden berücksichtigt?
   - Vergleich: Jaccard berechnen
   - Sortierung: nach Score sortieren
================================ */

// 1) Filterung (z.B. SkillSets ohne Skills raus)
const tFilterStart = nowSec();

const considered = learningSkillsets.filter(
  (s) => Array.isArray(s.skillIds) && s.skillIds.length > 0
);

const tFilterEnd = nowSec();

// 2) Vergleich (Jaccard über alle berücksichtigten Ressourcen)
const tCompareStart = nowSec();

const compared = considered.map((s) => {
  const score = jaccardSimilarity(focusSkills, s.skillIds);
  return {
    skillsetId: s.skillsetId ?? null,
    jaccardScore: score,
  };
});

const tCompareEnd = nowSec();

// 3) Sortierung (Relevanz)
const tSortStart = nowSec();

compared.sort((a, b) => b.jaccardScore - a.jaccardScore);

const tSortEnd = nowSec();

/* ===============================
   Stats
================================ */
const filterTime = tFilterEnd - tFilterStart;
const compareTime = tCompareEnd - tCompareStart;
const sortTime = tSortEnd - tSortStart;

const totalTime = filterTime + compareTime + sortTime;

const consideredCount = considered.length;
const perResourceSeconds =
  consideredCount === 0 ? 0 : totalTime / consideredCount;

const stats = {
  generatedAt: new Date().toISOString(),
  inputs: {
    focusFile: FOCUS_FILE,
    learningFile: LEARNING_WITH_SKILLS_FILE,
    focusSkillCount: focusSkills.length,
    learningSkillsetCount: learningSkillsets.length,
  },
  considered: {
    consideredLearningResources: consideredCount,
    ignoredLearningResources: learningSkillsets.length - consideredCount,
    reasonIgnored: "skillIds missing or empty",
  },
  timingsSeconds: {
    filtering: Number(filterTime.toFixed(6)),
    comparison: Number(compareTime.toFixed(6)),
    sorting: Number(sortTime.toFixed(6)),
    total: Number(totalTime.toFixed(6)),
  },
  perUnit: {
    secondsPerLearningResource: Number(perResourceSeconds.toExponential(3)),
  },
};

/* ===============================
   Output
================================ */
ensureDir(OUTPUT_FILE);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(stats, null, 2), "utf-8");

console.log("✅ MZ03 abgeschlossen");
console.log("Focus skills:", focusSkills.length);
console.log("Learning skillsets (raw):", learningSkillsets.length);
console.log("Learning resources (considered):", consideredCount);
console.log("Output:", OUTPUT_FILE);
console.table(stats.timingsSeconds);
