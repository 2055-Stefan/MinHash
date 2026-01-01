// generateSmall.js
import fs from "fs";

const INPUT_FILE = "learningSkillsetsWithSkills.medium.json";
const OUTPUT_FILE = "learningSkillsetsWithSkills.small.json";

const SCALE_NUMERATOR = 3;
const SCALE_DENOMINATOR = 8;

// ------------------------------
// Laden
// ------------------------------
const raw = fs.readFileSync(INPUT_FILE, "utf-8");
const data = JSON.parse(raw);

// ------------------------------
// Verkleinern (abschneiden)
// ------------------------------
const originalCount = data.skillsets.length;
const newCount = Math.floor(originalCount * SCALE_NUMERATOR / SCALE_DENOMINATOR);

data.skillsets = data.skillsets.slice(0, newCount);

// ------------------------------
// Counts anpassen
// ------------------------------
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

console.log(`✔ SMALL erzeugt: ${newCount}/${originalCount} Skillsets`);
