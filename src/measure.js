import { performance } from "node:perf_hooks";
import { jaccardOptimized } from "./jaccard_new.js";
import { minhashSimilarity } from "./minhash.js";

// ------------------------------
// KONFIG
// ------------------------------
const X = 89; // fixer Datensatz
const K_VALUES = [1, 8, 32, 64, 256, 1024, 32768, 1048576]; // Hashfunktionen
const MAX_HASH = 2 ** 32;

// ------------------------------
// JSON laden
// ------------------------------
const focus = await import(
    `./data/JSON/focusSkillsetIds/focus_${X}.json`,
    { with: { type: "json" } }
);
const learning = await import(
    `./data/JSON/learningSkillsetIds/learning_${X}.json`,
    { with: { type: "json" } }
);

const arrA = focus.default.focusIds;
const arrB = learning.default.learningSkillsetIds;

// ------------------------------
// WARMUP (NICHT LOGGEN)
// ------------------------------
function warmup() {
    // Jaccard mehrfach
    for (let i = 0; i < 20; i++) {
        jaccardOptimized(arrA, arrB);
    }

    // MinHash einmal pro k
    for (const k of K_VALUES) {
        minhashSimilarity(arrA, arrB, k, MAX_HASH);
    }
}
warmup();

// ------------------------------
// Hilfsfunktionen
// ------------------------------
function measure(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    return {
        similarity: result,
        time: +(end - start).toFixed(5)
    };
}

function de(num) {
    return String(num).replace(".", ",");
}

// ------------------------------
// REFERENZ: Jaccard
// ------------------------------
const jac = measure(() =>
    jaccardOptimized(arrA, arrB)
);

// ------------------------------
// AUSGABE (Excel-ready)
// ------------------------------
console.log("Art\tk\tSimilarity\tZeit(ms)\tError");

console.log(
    `Jaccard_Optimized\t-\t${de(jac.similarity)}\t${de(jac.time)}\t0`
);

// ------------------------------
// MinHash-Messungen
// ------------------------------
for (const k of K_VALUES) {
    const mh = measure(() =>
        minhashSimilarity(arrA, arrB, k, MAX_HASH)
    );

    const error = Math.abs(jac.similarity - mh.similarity);

    console.log(
        `MinHash\t${k}\t${de(mh.similarity)}\t${de(mh.time)}\t${de(error)}`
    );
}
