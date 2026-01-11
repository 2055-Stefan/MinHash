// buildFocusFromSkillset.js
// Holt die Skill-IDs (skills[].uid) aus einem SkillSet und speichert sie als
// ./data/input/focus/focusSkillIds.medium.json
//
// Usage:
//   node buildFocusFromSkillset.js              -> default 1096
//   node buildFocusFromSkillset.js 1096         -> SkillSet 1096
//   node buildFocusFromSkillset.js --id=1096    -> SkillSet 1096
//
// Optional Auth (falls jemals nötig):
//   set SKILLDISPLAY_TOKEN=...   (Windows: $env:SKILLDISPLAY_TOKEN="...")

import fs from "fs";
import path from "path";

const DEFAULT_SKILLSET_ID = 1096;

// Output genau so, wie deine anderen Scripts es erwarten:
const OUTPUT_FILE = "./focusSkillIds.medium.json";

const TOKEN = process.env.SKILLDISPLAY_TOKEN;

const MAX_RETRIES = 4;

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseSkillsetIdFromArgs() {
  // erlaubt: positional oder --id=...
  const argId = process.argv.find((a) => a.startsWith("--id="));
  if (argId) {
    const v = Number(argId.split("=")[1]);
    return Number.isInteger(v) ? v : DEFAULT_SKILLSET_ID;
  }

  const positional = process.argv[2];
  if (!positional) return DEFAULT_SKILLSET_ID;

  const v = Number(positional);
  return Number.isInteger(v) ? v : DEFAULT_SKILLSET_ID;
}

async function fetchJsonWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : undefined,
    });

    // Retry bei RateLimit / Serverfehler
    if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
      const backoff = 250 * attempt;
      await sleep(backoff);
      continue;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} for ${url}\n${text}`);
    }

    return res.json();
  }

  throw new Error(`Failed after ${retries} retries: ${url}`);
}

async function main() {
  const skillsetId = parseSkillsetIdFromArgs();
  const url = `https://www.skilldisplay.eu/api/v1/skillset/${skillsetId}`;

  console.log(`📥 Lade SkillSet ${skillsetId}: ${url}`);
  const data = await fetchJsonWithRetry(url);

  // Skill-IDs extrahieren
  const focusSkillIds = Array.isArray(data.skills)
    ? data.skills.map((s) => s.uid).filter(Number.isInteger)
    : [];

  if (focusSkillIds.length === 0) {
    console.log("⚠️ Hinweis: Keine skills[] gefunden oder leer.");
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: url,
    skillsetId,
    skillsetName: data.name ?? null,
    focusSkillIds,
  };

  ensureDir(OUTPUT_FILE);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), "utf-8");

  console.log(`✅ Gespeichert: ${OUTPUT_FILE}`);
  console.log(`Focus skills: ${focusSkillIds.length}`);
  console.log(`SkillSet name: ${out.skillsetName ?? "-"}`);
}

main().catch((err) => {
  console.error("\nFehler:", err.message);
  process.exit(1);
});
