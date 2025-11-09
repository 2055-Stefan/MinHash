// Läuft alle Fetch-Skripte nacheinander und schreibt in einen Zeitstempel-Ordner
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// z.B. 2025-11-09_18-42-03
const now = new Date();
const stamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0")
].join("-") + "_" +
[
  String(now.getHours()).padStart(2, "0"),
  String(now.getMinutes()).padStart(2, "0"),
  String(now.getSeconds()).padStart(2, "0")
].join("-");

const outDir = path.join(__dirname, "..", "results", "raw", stamp);
fs.mkdirSync(outDir, { recursive: true });

const scripts = [
  path.join(__dirname, "Focus_Skillsets.js"),
  path.join(__dirname, "Learning_Skillsets.js"),
  path.join(__dirname, "Verifications.js"),
];

for (const script of scripts) {
  console.log(`\n🚀 Running ${path.basename(script)} → ${outDir}`);
  try {
    // Übergibt OUTPUT_DIR als Env-Variable an das Kind
    execSync(`node "${script}"`, {
      stdio: "inherit",
      env: { ...process.env, OUTPUT_DIR: outDir }
    });
  } catch (err) {
    console.error(`❌ Fehler in ${path.basename(script)}:`, err.message);
  }
}

console.log(`\n✅ Fertig. Rohdaten liegen in: ${outDir}`);
