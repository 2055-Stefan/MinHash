// mz04.js
// MZ04: MinHash-Implementierung vorhanden + Vergleich mit Jaccard (Zeit + Similarity + Error)
// - nutzt bloom-filters MinHash über minhash.js (Factory-Cache + Precompute möglich)
// - nutzt Jaccard aus jaccard.js
// - Warmup integriert
// - misst MinHash sinnvoll: Precompute + Compare getrennt + Total
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
import { buildMinhashSet, compareMinhashSets } from "../../src/minhash.js";

/* ===============================
   Config
================================ */
const FOCUS_FILE = "./data/input/focus/focusSkillIds.medium.json";
const LEARNING_FILE = "./data/input/learning/learningSkillsetsWithSkills.medium.json";

const OUTPUT_DIR = "./data/output/mz04";

// k = number of hash functions (Signatur-Länge)
const K_VALUES = [1, 32, 256, 1024, 2048, 3072, 4096, 8192, 16384, 32768 /*, 1048576*/];

// max hash value parameter for MinHashFactory(k, maxHash)
const MAX_HASH = 2147483647;

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
if (N === 0) {
  throw new Error("Keine berücksichtigten Learning-SkillSets (alle skillIds leer?).");
}

/* ===============================
   Warmup
   - macht VM/JIT warm + initialisiert Library/Factory Cache
   - wichtig: warmup NICHT in Messwerte einrechnen
================================ */
function warmup() {
  const arrA = focusSkills;
  const arrB = considered[0].skillIds;

  for (let i = 0; i < 20; i++) {
    jaccardSimilarity(arrA, arrB);
  }

  for (const k of K_VALUES) {
    const setA = buildMinhashSet(arrA, k, MAX_HASH);
    const setB = buildMinhashSet(arrB, k, MAX_HASH);
    compareMinhashSets(setA, setB);
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
   MinHash: Precompute + Compare-only
================================ */
const rows = [];

// Jaccard Row
rows.push({
  algorithm: "Jaccard",
  k: "-",
  similarity: jaccardAvgSim,
  timeMs: jaccardTimeMs,
  errorMAE: 0,
  helpJaccardSim: jaccardAvgSim,

  precomputeMs: 0,
  compareMs: jaccardTimeMs,
  totalMs: jaccardTimeMs,

  secPerResourceTotal: (jaccardTimeMs / 1000) / N,
  secPerResourcePre: 0,
  secPerResourceCmp: (jaccardTimeMs / 1000) / N,
});


// MinHash Rows
for (const k of K_VALUES) {
  // 1) Precompute (Signaturen/Sets)
  const tPre0 = performance.now();

  const focusSet = buildMinhashSet(focusSkills, k, MAX_HASH);
  const resourceSets = considered.map((s) =>
    buildMinhashSet(s.skillIds, k, MAX_HASH)
  );

  const tPre1 = performance.now();

  // 2) Compare-only (sehr schnell, wenn Sets vorhanden)
  const tCmp0 = performance.now();

  const minhashScores = resourceSets.map((setB) =>
    compareMinhashSets(focusSet, setB)
  );

  const tCmp1 = performance.now();

  const precomputeMs = tPre1 - tPre0;
  const compareMs = tCmp1 - tCmp0;
  const totalMs = precomputeMs + compareMs;

  const avgSim = mean(minhashScores);
  const error = mae(minhashScores, jaccardScores);

  rows.push({
    algorithm: "MinHash",
    k,
    similarity: avgSim,
    timeMs: totalMs,
    errorMAE: error,
    helpJaccardSim: jaccardAvgSim,

    precomputeMs,
    compareMs,
    totalMs,

    secPerResourceTotal: (totalMs / 1000) / N,
    secPerResourcePre: (precomputeMs / 1000) / N,
    secPerResourceCmp: (compareMs / 1000) / N,
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
    minhashMeasurement: "totalMs = precomputeMs + compareMs",
  },
  results: rows,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf-8");

// TSV (Excel)
const header = [
  "Art",
  "k",
  "Similarity(avg)",
  "Zeit_compare(ms)",
  "Error(MAE)",
  "Hilf_Jaccard_Sim",
  "Sec/Res Compare",
].join("\t");


const tsvLines = [header].concat(
  rows.map((r) =>
    [
      r.algorithm,
      r.k,
      r.similarity,
      r.compareMs,
      r.errorMAE,
      r.helpJaccardSim,
      r.secPerResourceCmp ?? ((r.compareMs / 1000) / N),
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
    "Zeit_total(ms)": Number(r.timeMs.toFixed(4)),
    "Zeit_pre(ms)": Number(r.precomputeMs.toFixed(4)),
    "Zeit_cmp(ms)": Number(r.compareMs.toFixed(4)),
    "Error(MAE)": Number(r.errorMAE.toFixed(9)),
  }))
);

console.log("\n--- Per Unit (seconds per learning resource) ---");
console.table(
  rows.map((r) => ({
    Art: r.algorithm,
    k: r.k,
    "Sec/Res Total": Number(r.secPerResourceTotal.toExponential(3)),
    "Sec/Res Pre": Number(r.secPerResourcePre.toExponential(3)),
    "Sec/Res Cmp": Number(r.secPerResourceCmp.toExponential(3)),
  }))
);

