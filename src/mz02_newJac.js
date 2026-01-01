import fs from "fs";
import path from "path";
import { jaccardNew } from "./jaccard_new.js";

/* ===============================
   Helpers
================================ */
function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function intersectionCount(arrA, arrB) {
  const setB = new Set(arrB);
  let cnt = 0;
  for (const x of arrA) if (setB.has(x)) cnt++;
  return cnt;
}

/* ===============================
   Input Paths
================================ */
const FOCUS_FILE = "./data/input/focus/focusSkillIds.medium.json";

// Diese Datei hast du mit buildLearningSkillsetMapFromOrganisation.js erzeugt:
const LEARNING_WITH_SKILLS_FILE =
  "./data/input/learning/learningSkillsetsWithSkills.medium.json";

const OUTPUT_FILE = "./data/output/mz02/new_jaccard_sorted.json";

/* ===============================
   Load Focus
================================ */
const focusSkills = JSON.parse(fs.readFileSync(FOCUS_FILE, "utf-8")).focusSkillIds;

if (!Array.isArray(focusSkills) || focusSkills.length === 0) {
  throw new Error("focusSkillIds fehlen oder sind leer.");
}

/* ===============================
   Load Learning SkillSets with Skills
================================ */
const learningData = JSON.parse(
  fs.readFileSync(LEARNING_WITH_SKILLS_FILE, "utf-8")
);

const learningSkillsets = learningData.skillsets;

if (!Array.isArray(learningSkillsets) || learningSkillsets.length === 0) {
  throw new Error("learning skillsets fehlen oder sind leer (learningData.skillsets).");
}

/* ===============================
   Jaccard Compare + Sort (MZ02)
================================ */
const results = learningSkillsets.map((s) => {
  const skillIds = Array.isArray(s.skillIds) ? s.skillIds : [];

  const score = jaccardNew(focusSkills, skillIds);

  // optional: fürs Debug/Erklärung (ändert NICHT den Score)
  const matches = intersectionCount(focusSkills, skillIds);

  return {
    skillsetId: s.skillsetId ?? null,
    name: s.name ?? null,
    firstCategoryTitle: s.firstCategoryTitle ?? null,
    skillCount: skillIds.length,
    matchedFocusSkills: matches,
    jaccardScore: score,
  };
});

// Sortierung nach Relevanz (absteigend)
results.sort((a, b) => b.jaccardScore - a.jaccardScore);

/* ===============================
   Output
================================ */
ensureDir(OUTPUT_FILE);

const out = {
  generatedAt: new Date().toISOString(),
  inputs: {
    focusFile: FOCUS_FILE,
    learningFile: LEARNING_WITH_SKILLS_FILE,
    focusSkillCount: focusSkills.length,
    learningSkillsetCount: learningSkillsets.length,
  },
  results,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), "utf-8");

console.log("MZ02 abgeschlossen");
console.log("Focus skills:", focusSkills.length);
console.log("Learning skillsets:", learningSkillsets.length);
console.log("Output:", OUTPUT_FILE);
