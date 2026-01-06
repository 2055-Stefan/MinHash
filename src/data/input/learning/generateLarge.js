// generateLarge.js
// Large erzeugen, indem skillsets vervielfacht werden UND skillIds neu erfunden werden.
// Skillset-IDs egal; wichtig: skillIds sollen überwiegend 3-4-stellig sein.

import fs from "fs";

const INPUT_FILE = "learningSkillsetsWithSkills.medium.json";
const OUTPUT_FILE = "learningSkillsetsWithSkills.large.json";

const MULTIPLIER = 11;

// Skill-ID Range (3-4-stellig)
const MIN_3_4 = 100;
const MAX_3_4 = 9999;

// optional ein paar 5-stellige
const FIVE_DIGIT_RATIO = 0.05; // 5% der neuen IDs 5-stellig
const MIN_5 = 10000;
const MAX_5 = 99999;

/* ------------------------------
   Load
------------------------------ */
const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
const original = data.skillsets ?? data.skillSets;

if (!Array.isArray(original) || original.length === 0) {
  throw new Error("Keine skillsets gefunden (data.skillsets / data.skillSets).");
}

/* ------------------------------
   Collect already used skillIds
------------------------------ */
const usedSkillIds = new Set();
for (const s of original) {
  if (Array.isArray(s.skillIds)) {
    for (const id of s.skillIds) {
      if (Number.isInteger(id)) usedSkillIds.add(id);
    }
  }
}

/* ------------------------------
   Random ID helper (unique)
------------------------------ */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextNewSkillId() {
  // versuche zunächst bevorzugten Bereich (3-4-stellig),
  // mit kleiner Wahrscheinlichkeit 5-stellig
  for (let tries = 0; tries < 50000; tries++) {
    const use5 = Math.random() < FIVE_DIGIT_RATIO;
    const id = use5 ? randInt(MIN_5, MAX_5) : randInt(MIN_3_4, MAX_3_4);

    if (!usedSkillIds.has(id)) {
      usedSkillIds.add(id);
      return id;
    }
  }
  // Falls es extrem voll ist: sequentiell nach oben gehen
  let fallback = MAX_5 + 1;
  while (usedSkillIds.has(fallback)) fallback++;
  usedSkillIds.add(fallback);
  return fallback;
}

/* ------------------------------
   Build large dataset
   - Original bleibt (damit echte IDs noch vorkommen)
   - Kopien: skillIds werden neu vergeben (gleiche Anzahl pro Skillset)
------------------------------ */
const largeSkillsets = [];

// 0) Original übernehmen (mit echten skillIds)
for (const s of original) {
  largeSkillsets.push({ ...s });
}

// 1) Kopien erzeugen
for (let copy = 1; copy < MULTIPLIER; copy++) {
  for (const s of original) {
    const oldSkillIds = Array.isArray(s.skillIds) ? s.skillIds : [];

    // gleiche Anzahl an Skills behalten
    const newSkillIds = oldSkillIds.map(() => nextNewSkillId());

    largeSkillsets.push({
      ...s,
      // skillsetId darf ruhig anders sein, ist egal
      skillsetId: (s.skillsetId ?? s.uid ?? 0) * 100 + copy,
      // wichtig: skillIds aufblasen
      skillIds: newSkillIds,
    });
  }
}

/* ------------------------------
   Write back (keep key)
------------------------------ */
if (Array.isArray(data.skillsets)) data.skillsets = largeSkillsets;
else data.skillSets = largeSkillsets;

/* ------------------------------
   counts + meta
------------------------------ */
const newCount = largeSkillsets.length;
data.counts = data.counts ?? {};
data.counts.learningSkillSetsFiltered = newCount;
data.counts.skillSetsWithAtLeastOneSkill = newCount;
data.generatedAt = new Date().toISOString();

/* ------------------------------
   Save
------------------------------ */
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), "utf-8");

console.log(`✔ LARGE erzeugt: ${newCount} (${MULTIPLIER}× ${original.length}) Skillsets`);
console.log(`✔ Neue Skill-ID-Anzahl (global): ${usedSkillIds.size}`);
console.log(`✔ Output: ${OUTPUT_FILE}`);
