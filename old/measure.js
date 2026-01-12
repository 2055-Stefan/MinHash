// measure.js
// MZ04: MinHash vs Jaccard (Zeit + Similarity + Error)
// - Jaccard: exakt (Baseline)
// - MinHash: bloom-filters über minhash.js (Factory Cache + build/compare)
// - misst MinHash sinnvoll: Precompute einmal, Compare mehrfach -> Median
// - ruft global.gc() zwischen Precompute und Compare (nur wenn node --expose-gc)
//
// Inputs:
//  - ./data/input/focus/focusSkillIds.medium.json
//  - ./data/input/learning/learningSkillsetsWithSkills.medium.json
//
// Outputs (timestamped):
//  - ./data/output/mz04/<timestamp>_measure.json
//  - ./data/output/mz04/<timestamp>_measure.tsv

import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

import { jaccardSimilarity } from "./jaccard.js";
import { buildMinhashSet, compareMinhashSets } from "./minhash.js";

/* ===============================
   Config
================================ */
const FOCUS_FILE = "./data/input/focus/focusSkillIds.medium.json";
const LEARNING_FILE = "./data/input/learning/learningSkillsetsWithSkills.medium.json";

const OUTPUT_DIR = "./data/output/mz04";

// k = number of hash functions
const K_VALUES = [1,  32, 128, 256, 1024, 2048, 3072, 4096, 16384, 32768, /*1048576*/]; // 1048576 kann sehr lange dauern

// max hash value parameter for MinHashFactory(k, maxHash)
const MAX_HASH = 2147483647;

// Benchmark settings
const WARMUP_JACCARD_RUNS = 20;
const MEASURE_REPEATS = 20;        // wie oft Compare gemessen wird (Median daraus)
const INNER_COMPARE_LOOPS = 10;    // pro Messung wird Compare X-mal durchgeführt und dann normiert
const USE_GC_BETWEEN_PHASES = true;

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

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function maybeGC() {
  if (!USE_GC_BETWEEN_PHASES) return;
  if (typeof global.gc === "function") {
    global.gc();
  }
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

const considered = learningSkillsets.filter(
  (s) => Array.isArray(s.skillIds) && s.skillIds.length > 0
);

const N = considered.length;
if (N === 0) {
  throw new Error("Keine berücksichtigten Learning-SkillSets (alle skillIds leer?).");
}

/* ===============================
   Warmup
================================ */
function warmup() {
  const arrA = focusSkills;
  const arrB = considered[0].skillIds;

  for (let i = 0; i < WARMUP_JACCARD_RUNS; i++) {
    jaccardSimilarity(arrA, arrB);
  }

  for (const k of K_VALUES) {
    const setA = buildMinhashSet(arrA, k, MAX_HASH);
    const setB = buildMinhashSet(arrB, k, MAX_HASH);
    compareMinhashSets(setA, setB);
  }
}
warmup();

if (USE_GC_BETWEEN_PHASES && typeof global.gc !== "function") {
  console.log("⚠️ Hinweis: global.gc() nicht verfügbar. Starte mit: node --expose-gc measure.js");
}

/* ===============================
   Baseline: Jaccard (exakt)
   -> Wir brauchen Jaccard-Scores pro Ressource als Ground Truth
================================ */
const tJ0 = performance.now();
const jaccardScores = considered.map((s) => jaccardSimilarity(focusSkills, s.skillIds));
const tJ1 = performance.now();

const jaccardTotalMs = tJ1 - tJ0;
const jaccardAvgSim = mean(jaccardScores);
const jaccardSecPerRes = (jaccardTotalMs / 1000) / N;

/* ===============================
   Measure helper: Compare timing median (normalized)
================================ */
function measureCompareMedian(compareFn) {
  // compareFn() soll EINEN Compare-Pass über alle Ressourcen machen
  // wir führen pro Messung INNER_COMPARE_LOOPS Pässe aus und teilen danach wieder
  const samplesMs = [];

  for (let r = 0; r < MEASURE_REPEATS; r++) {
    maybeGC();
    const t0 = performance.now();

    let sink = 0; // verhindert, dass V8 alles wegoptimiert
    for (let loop = 0; loop < INNER_COMPARE_LOOPS; loop++) {
      sink += compareFn();
    }

    const t1 = performance.now();
    // normieren auf "ein Pass"
    const normalizedMs = (t1 - t0) / INNER_COMPARE_LOOPS;
    samplesMs.push(normalizedMs);

    // optional: minimal nutzen
    if (sink === 123456789) console.log("ignore", sink);
  }

  return {
    medianMs: median(samplesMs),
    samplesMs,
  };
}

/* ===============================
   Results rows
================================ */
const rows = [];

// Jaccard Row (TSV will "compare time" -> bei Jaccard = total)
rows.push({
  algorithm: "Jaccard",
  k: "-",
  similarityAvg: jaccardAvgSim,
  compareMs: jaccardTotalMs,
  errorMAE: 0,
  secPerResCompare: jaccardSecPerRes,
  details: {
    repeats: 1,
    innerLoops: 1,
  },
});

for (const k of K_VALUES) {
  // 1) Precompute (einmal)
  const tPre0 = performance.now();
  const focusSet = buildMinhashSet(focusSkills, k, MAX_HASH);
  const resourceSets = considered.map((s) => buildMinhashSet(s.skillIds, k, MAX_HASH));
  const tPre1 = performance.now();
  const precomputeMs = tPre1 - tPre0;

  // GC zwischen Precompute und Compare (damit Compare nicht zufällig GC "erbt")
  maybeGC();

  // 2) Einmal Scores berechnen (für Similarity + Error)
  const scoresOnce = resourceSets.map((setB) => compareMinhashSets(focusSet, setB));
  const avgSim = mean(scoresOnce);
  const error = mae(scoresOnce, jaccardScores);

  // 3) Compare median messen (nur Compare, ohne Precompute)
  const compareTiming = measureCompareMedian(() => {
    let acc = 0;
    for (const setB of resourceSets) acc += compareMinhashSets(focusSet, setB);
    return acc;
  });

  const compareMedianMs = compareTiming.medianMs;
  const secPerResCompare = (compareMedianMs / 1000) / N;

  rows.push({
    algorithm: "MinHash",
    k,
    similarityAvg: avgSim,
    compareMs: compareMedianMs, // << TSV soll nur Compare
    errorMAE: error,
    secPerResCompare,
    details: {
      precomputeMs,
      repeats: MEASURE_REPEATS,
      innerLoops: INNER_COMPARE_LOOPS,
      compareSamplesMs: compareTiming.samplesMs, // optional fürs Debug
    },
  });
}

/* ===============================
   Output files (timestamped)
================================ */
ensureDir(OUTPUT_DIR);
const TS = timestampForFilename();
const OUT_JSON = path.join(OUTPUT_DIR, `${TS}_measure.json`);
const OUT_TSV = path.join(OUTPUT_DIR, `${TS}_measure.tsv`);

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
    measureRepeats: MEASURE_REPEATS,
    innerCompareLoops: INNER_COMPARE_LOOPS,
    gcEnabled: USE_GC_BETWEEN_PHASES,
    note: "MinHash compareMs is median over repeats, normalized per one pass over all resources.",
  },
  results: rows,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf-8");

// TSV: NUR compare time (+ Similarity + Error), wie gewünscht

function toExcelDE(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    return String(value).replace(".", ",");
  }
  return String(value);
}

const header = [
  "Art",
  "k",
  "Similarity(avg)",
  "Zeit_compare_median(ms)",
  "Error(MAE)",
  "Sec/Res Compare",
].join("\t");

const tsvLines = [header].concat(
  rows.map((r) =>
    [
      r.algorithm,
      r.k, // "-" oder Zahl
      toExcelDE(r.similarityAvg),
      toExcelDE(r.compareMs),
      toExcelDE(r.errorMAE),
      toExcelDE(r.secPerResCompare),
    ].join("\t")
  )
);

fs.writeFileSync(OUT_TSV, tsvLines.join("\n"), "utf-8");

/* ===============================
   Console output
================================ */
console.log("✅ measure.js abgeschlossen (MZ04)");
console.log("Focus skills:", focusSkills.length);
console.log("Learning resources (considered):", N);
console.log("Outputs:", OUT_JSON, "and", OUT_TSV);

console.table(
  rows.map((r) => ({
    Art: r.algorithm,
    k: r.k,
    Similarity: Number(r.similarityAvg.toFixed(9)),
    "Zeit_cmp_median(ms)": Number(r.compareMs.toFixed(4)),
    "Error(MAE)": Number(r.errorMAE.toFixed(9)),
  }))
);

console.log("\n--- Per Unit (Compare only) ---");
console.table(
  rows.map((r) => ({
    Art: r.algorithm,
    k: r.k,
    "Sec/Res Compare": Number(r.secPerResCompare.toExponential(3)),
  }))
);
