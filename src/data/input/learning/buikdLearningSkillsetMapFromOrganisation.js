import fs from "fs";
import path from "path";

const ORG_ID = 1;

const OUTPUT_FILE =
  "./data/output/learning/learningSkillsetsWithSkills.medium.json";

const ORG_URL = `https://www.skilldisplay.eu/api/v1/organisation/${ORG_ID}`;
const SKILLSET_URL = (id) => `https://www.skilldisplay.eu/api/v1/skillset/${id}`;

// nicht zu hoch, sonst 429 Rate Limit
const CONCURRENCY = 6;
const MAX_RETRIES = 4;
const WAVE_DELAY_MS = 150;

// Optional: Falls Auth benötigt werden sollte
const TOKEN = process.env.SKILLDISPLAY_TOKEN;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function main() {
  console.log(` Lade Organisation ${ORG_ID}: ${ORG_URL}`);
  const orgData = await fetchJsonWithRetry(ORG_URL);

  if (!Array.isArray(orgData.skillSets)) {
    throw new Error("Organisation-Response enthält kein Array: skillSets");
  }

  // Nur Lernressourcen (laut Prof: Learner oder Education)
  const learningSkillSets = orgData.skillSets.filter(
    (s) => s.firstCategoryTitle === "Learner" || s.firstCategoryTitle === "Education"
  );

  const ids = [...new Set(learningSkillSets.map((s) => s.uid))].filter(
    Number.isInteger
  );

  console.log(
    `Gefilterte Lernressourcen: ${ids.length} (Learner/Education)`
  );

  const results = [];
  let index = 0;

  while (index < ids.length) {
    const slice = ids.slice(index, index + CONCURRENCY);

    const wave = await Promise.all(
      slice.map(async (id) => {
        const data = await fetchJsonWithRetry(SKILLSET_URL(id));

        // HIER werden die echten Skill-IDs rausgeholt:
        const skillIds = Array.isArray(data.skills)
          ? data.skills.map((s) => s.uid).filter(Number.isInteger)
          : [];

        return {
          skillsetId: id,                 // SkillSet-UID (Lernressource)
          name: data.name ?? null,
          firstCategoryTitle: data.firstCategoryTitle ?? null,
          skillIds,                       // Skill-UIDs (für Jaccard wichtig)
          skillCountFromApi: skillIds.length,
        };
      })
    );

    results.push(...wave);
    index += CONCURRENCY;

    // kleine Pause, um die API zu schonen
    await sleep(WAVE_DELAY_MS);
    console.log(`… verarbeitet: ${Math.min(index, ids.length)}/${ids.length}`);
  }

  // Output schreiben
  ensureDir(OUTPUT_FILE);

  const out = {
    generatedAt: new Date().toISOString(),
    source: {
      organisation: ORG_URL,
      skillsetDetails: "https://www.skilldisplay.eu/api/v1/skillset/{id}",
      filterFirstCategoryTitle: ["Learner", "Education"],
    },
    organisation: {
      uid: orgData.organisation?.uid ?? ORG_ID,
      name: orgData.organisation?.name ?? null,
    },
    counts: {
      totalSkillSetsInOrganisation: orgData.skillSets.length,
      learningSkillSetsFiltered: ids.length,
      skillSetsWithAtLeastOneSkill: results.filter((r) => r.skillIds.length > 0).length,
    },
    skillsets: results,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(out, null, 2), "utf-8");

  console.log(`\nFertig! Datei gespeichert: ${OUTPUT_FILE}`);
  console.log(
    `SkillSets mit >=1 Skill: ${out.counts.skillSetsWithAtLeastOneSkill}/${out.counts.learningSkillSetsFiltered}`
  );
}

main().catch((err) => {
  console.error("\nFehler:", err.message);
  process.exit(1);
});
