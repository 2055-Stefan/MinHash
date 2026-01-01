// generateLarge.js
import fs from "fs";

const INPUT_FILE = "learningSkillsetsWithSkills.medium.json";
const OUTPUT_FILE = "learningSkillsetsWithSkills.large.json";

const MULTIPLIER = 11;

// ------------------------------
// Laden
// ------------------------------
const raw = fs.readFileSync(INPUT_FILE, "utf-8");
const data = JSON.parse(raw);

const originalSkillsets = data.skillsets;
const originalCount = originalSkillsets.length;

// ------------------------------
// Vergrößern (vervielfachen)
// ------------------------------
const largeSkillsets = [];

for (let i = 0; i < MULTIPLIER; i++) {
  for (const skillset of originalSkillsets) {
    largeSkillsets.push({
      ...skillset,
      // eindeutige ID erzeugen
      skillsetId: skillset.skillsetId * 100 + i
    });
  }
}

data.skillsets = largeSkillsets;

// ------------------------------
// Counts anpassen
// ------------------------------
const newCount = largeSkillsets.length;
data.counts.learningSkillSetsFiltered = newCount;
data.counts.skillSetsWithAtLeastOneSkill = newCount;

// ------------------------------
// Meta
// ------------------------------
data.generatedAt = new Date().toISOString();

// ------------------------------
// Schreiben
// ------------------------------
fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(data, null, 2),
  "utf-8"
);

console.log(`✔ LARGE erzeugt: ${newCount} (${MULTIPLIER}× ${originalCount}) Skillsets`);
