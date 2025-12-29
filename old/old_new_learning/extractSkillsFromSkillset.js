import fs from "fs";
import path from "path";

const INPUT_FILE = "learningSkillsetIds.medium.json";
const OUTPUT_FILE = "learningSkillsetsWithSkills.medium.json";

const API_BASE = "https://www.skilldisplay.eu/api/v1/skillset/";

// Wie viele Requests parallel laufen dürfen (nicht zu hoch!)
const CONCURRENCY = 6;
// Retry bei 429/5xx
const MAX_RETRIES = 4;
// Kleine Pause zwischen Wellen (ms)
const WAVE_DELAY_MS = 150;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url);

    // Rate limit / Serverfehler → retry
    if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
      const backoff = 250 * attempt; // simple backoff
      await sleep(backoff);
      continue;
    }

    if (!res.ok) {
      // andere Fehler: nicht retry-spammen, sondern abbrechen
      throw new Error(`HTTP ${res.status} for ${url}`);
    }

    return res.json();
  }

  throw new Error(`Failed after ${retries} retries: ${url}`);
}

function loadSkillsetIds() {
  const raw = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

  // akzeptiere beide Keys, falls du mal umbenennst
  const ids =
    raw.learningSkillsetIds ??
    raw.learningSkillsetIdsMedium ??
    raw.skillsetIds;

  if (!Array.isArray(ids)) {
    throw new Error("Input JSON hat kein Array learningSkillsetIds");
  }

  // Duplikate raus
  return [...new Set(ids)].filter(Number.isInteger);
}

async function processBatch(ids) {
  const results = [];

  let index = 0;
  while (index < ids.length) {
    const slice = ids.slice(index, index + CONCURRENCY);

    const wave = await Promise.all(
      slice.map(async (id) => {
        const url = `${API_BASE}${id}`;
        const data = await fetchWithRetry(url);

        // Skills extrahieren (falls Feld anders heißt, gleich hier anpassen)
        const skillIds = Array.isArray(data.skills)
          ? data.skills.map((s) => s.uid).filter(Number.isInteger)
          : [];

        return {
          skillsetId: id,
          skillIds,
          skillCountFromApi: skillIds.length,
          name: data.name ?? null,
          firstCategoryTitle: data.firstCategoryTitle ?? null,
        };
      })
    );

    results.push(...wave);

    index += CONCURRENCY;
    await sleep(WAVE_DELAY_MS);
  }

  return results;
}

async function main() {
  // Output-Ordner sicherstellen
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  const ids = loadSkillsetIds();
  console.log(`IDs geladen: ${ids.length}`);

  const skillsets = await processBatch(ids);

  const out = {
    generatedAt: new Date().toISOString(),
    source: "SkillDisplay API: /skillset/{id}",
    inputCount: ids.length,
    skillsets,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), "utf-8");

  const withSkills = skillsets.filter((s) => s.skillIds.length > 0).length;
  console.log(`Fertig. Output: ${OUTPUT_FILE}`);
  console.log(`SkillSets mit >=1 Skill: ${withSkills}/${skillsets.length}`);
}

main().catch((err) => {
  console.error("Fehler:", err.message);
  process.exit(1);
});
