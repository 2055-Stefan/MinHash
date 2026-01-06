// mz04.js
// MZ04: MinHash-Implementierung vorhanden + Vergleich mit Jaccard (Zeit + Similarity + Error)
// - nutzt vorhandene minhash.js (bloom-filters)
// - nutzt normalen Jaccard aus jaccard.js
// - Warmup integriert
//
// Inputs:
//  - ./data/input/focus/focusSkillIds.medium.json
//  - ./data/input/learning/learningSkillsetsWithSkills.medium.json
//
// Outputs (timestamped):
//  - ./data/output/mz04/<timestamp>_mz04_results.json
//  - ./data/output/mz04/<timestamp>_mz04_results.tsv

import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

import { jaccardSimilarity } from "../../src/jaccard.js";
import { minhashSimilarity } from "./slow_minhash.js";

/* ===============================
   Config
================================ */
const FOCUS_FILE = "./data/input/focus/focusSkillIds.medium.json";
const LEARNING_FILE = "./data/input/learning/learningSkillsetsWithSkills.medium.json";

const OUTPUT_DIR = "./data/output/mz04";

// k = number of hash functions
const K_VALUES = [1, 8, 32, 64, 256, 1024, 32768];

// max hash value parameter for MinHashFactory(x, y)
const MAX_HASH = 2147483647; // 2^31-1 (solider Standard)

/* ===============================
   Helpers
================================ */
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function timestampForFilename(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_` +
    `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
  );
}

function isNonEmptyIntArray(arr) {
  return Array.isArray(arr) && arr.length > 0 && arr.every(Number.isInteger);
}

function mean(arr) {
  if (!arr.length) return 0;
  let s = 0;
  for (const x of arr) s += x;
  return s / arr.length;
}

function mae(arrApprox, arrExact) {
  const n = Math.min(arrApprox.length, arrExact.length);
  if (n === 0) return 0;
  let s = 0;
  for (let i = 0; i < n; i++) s += Math.abs(arrApprox[i] - arrExact[i]);
  return s / n;
}

/* ===============================
   Load Inputs
================================ */
const focusSkills = JSON.parse(fs.readFileSync(FOCUS_FILE, "utf-8")).focusSkillIds;
if (!isNonEmptyIntArray(focusSkills)) {
  throw new Error("focusSkillIds fehlen oder sind leer/ungültig.");
}

const learningData = JSON.parse(fs.readFileSync(LEARNING_FILE, "utf-8"));
const learningSkillsets = learningData.skillsets;

if (!Array.isArray(learningSkillsets) || learningSkillsets.length === 0) {
  throw new Error("learningData.skillsets fehlt oder ist leer.");
}

// nur SkillSets berücksichtigen, die wirklich Skill-IDs haben
const considered = learningSkillsets.filter(
  (s) => Array.isArray(s.skillIds) && s.skillIds.length > 0
);

const N = considered.length;
if (N === 0) throw new Error("Keine berücksichtigten Learning-SkillSets (alle skillIds leer?).");

/* ===============================
   Warmup
   - Jaccard mehrfach
   - MinHash einmal pro k
================================ */
function warmup() {
  const arrA = focusSkills;
  const arrB = considered[0].skillIds; // irgendein Beispiel (1. Lernressource)

  for (let i = 0; i < 20; i++) {
    jaccardSimilarity(arrA, arrB);
  }

  for (const k of K_VALUES) {
    // einmal pro k "anwerfen", damit JIT + Library Setup nicht in Messung reinfunkt
    minhashSimilarity(arrA, arrB, k, MAX_HASH);
  }
}
warmup();

/* ===============================
   Baseline: Jaccard (exakt)
================================ */
const tJ0 = performance.now();

const jaccardScores = considered.map((s) =>
  jaccardSimilarity(focusSkills, s.skillIds)
);

const tJ1 = performance.now();

const jaccardTimeMs = tJ1 - tJ0;
const jaccardAvgSim = mean(jaccardScores);
const jaccardSecPerResource = (jaccardTimeMs / 1000) / N;

/* ===============================
   MinHash: verschiedene k
================================ */
const rows = [];

// Row für Jaccard (Vergleichsbasis)
rows.push({
  algorithm: "Jaccard",
  k: "-",
  similarity: jaccardAvgSim,
  timeMs: jaccardTimeMs,
  errorMAE: 0,
  helpJaccardSim: jaccardAvgSim,
  secPerResource: jaccardSecPerResource,
});

for (const k of K_VALUES) {
  const tM0 = performance.now();

  const minhashScores = considered.map((s) =>
    minhashSimilarity(focusSkills, s.skillIds, k, MAX_HASH)
  );

  const tM1 = performance.now();

  const timeMs = tM1 - tM0;
  const avgSim = mean(minhashScores);
  const error = mae(minhashScores, jaccardScores);
  const secPerResource = (timeMs / 1000) / N;

  rows.push({
    algorithm: "MinHash",
    k,
    similarity: avgSim,
    timeMs,
    errorMAE: error,
    helpJaccardSim: jaccardAvgSim,
    secPerResource,
  });
}

/* ===============================
   Output files (timestamped)
================================ */
ensureDir(OUTPUT_DIR);
const TS = timestampForFilename();
const OUT_JSON = path.join(OUTPUT_DIR, `${TS}_mz04_results.json`);
const OUT_TSV = path.join(OUTPUT_DIR, `${TS}_mz04_results.tsv`);

const out = {
  generatedAt: new Date().toISOString(),
  inputs: {
    focusFile: FOCUS_FILE,
    learningFile: LEARNING_FILE,
    focusSkillCount: focusSkills.length,
    learningSkillsetCountRaw: learningSkillsets.length,
    learningResourcesConsidered: N,
  },
  config: {
    kValues: K_VALUES,
    maxHash: MAX_HASH,
  },
  results: rows,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf-8");

// TSV (Excel)
const header = [
  "Art",
  "k",
  "Similarity",
  "Zeit(ms)",
  "Error(MAE)",
  "Hilf_Jaccard_Sim",
  "Sec/Resource",
].join("\t");

const tsvLines = [header].concat(
  rows.map((r) =>
    [
      r.algorithm,
      r.k,
      r.similarity,
      r.timeMs,
      r.errorMAE,
      r.helpJaccardSim,
      r.secPerResource,
    ].join("\t")
  )
);

fs.writeFileSync(OUT_TSV, tsvLines.join("\n"), "utf-8");

/* ===============================
   Console output
================================ */
console.log("MZ04 abgeschlossen");
console.log("Focus skills:", focusSkills.length);
console.log("Learning resources (considered):", N);
console.log("Outputs:", OUT_JSON, "and", OUT_TSV);

console.table(
  rows.map((r) => ({
    Art: r.algorithm,
    k: r.k,
    Similarity: Number(r.similarity.toFixed(9)),
    "Zeit(ms)": Number(r.timeMs.toFixed(4)),
    "Error(MAE)": Number(r.errorMAE.toFixed(9)),
    "Hilf_Jaccard_Sim": Number(r.helpJaccardSim.toFixed(9)),
  }))
);

console.log("\n--- Per Unit ---");
console.table(
  rows.map((r) => ({
    Art: r.algorithm,
    k: r.k,
    "Sec/Resource": Number(r.secPerResource.toExponential(3)),
  }))
);
