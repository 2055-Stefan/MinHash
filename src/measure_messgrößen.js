// measure_messgrößen.js
import { performance } from "node:perf_hooks";
import fs from "fs";
import path from "path";

import { jaccardOptimized } from "./jaccard_new.js";
import { minhashSimilarity } from "./minhash.js";

// ------------------------------
// KONFIG
// ------------------------------
const X_VALUES = [3, 8, 89];          // Anzahl Ressourcen
const K_VALUES = [1, 8, 32, 256, 1024]; // Hashfunktionen
const MAX_HASH = 2 ** 32;

const OUTPUT_DIR = "./data/results/processed";
const OUTPUT_FILE = "results.tsv";

// ------------------------------
// Hilfsfunktionen
// ------------------------------
function measure(fn) {
    global.gc?.(); // falls Node mit --expose-gc gestartet wurde

    const memBefore = process.memoryUsage().heapUsed;
    const tStart = performance.now();

    const result = fn();

    const tEnd = performance.now();
    const memAfter = process.memoryUsage().heapUsed;

    return {
        result,
        t_compare: +(tEnd - tStart).toFixed(5),
        mem_used: memAfter - memBefore
    };
}

function loadData(x) {
    return Promise.all([
        import(`./data/JSON/focusSkillsetIds/focus_${x}.json`, { with: { type: "json" } }),
        import(`./data/JSON/learningSkillsetIds/learning_${x}.json`, { with: { type: "json" } })
    ]);
}

// ------------------------------
// Ordner vorbereiten
// ------------------------------
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const outPath = path.join(OUTPUT_DIR, OUTPUT_FILE);

// Header
fs.writeFileSync(
    outPath,
    "Art\tX\tk\tSimilarity\tt_total(ms)\tt_compare(ms)\tmem_used(bytes)\n"
);

// ------------------------------
// MESSUNGEN
// ------------------------------
for (const x of X_VALUES) {

    const tTotalStart = performance.now();

    const [focus, learning] = await loadData(x);
    const arrA = focus.default.focusIds;
    const arrB = learning.default.learningSkillsetIds;

    // -------- JACCARD --------
    const jac = measure(() =>
        jaccardOptimized(arrA, arrB)
    );

    const tTotalJac = performance.now() - tTotalStart;

    fs.appendFileSync(
        outPath,
        `Jaccard_Optimized\t${x}\t-\t${jac.result}\t${tTotalJac.toFixed(5)}\t${jac.t_compare}\t${jac.mem_used}\n`
    );

    // -------- MINHASH --------
    for (const k of K_VALUES) {

        const tTotalMHStart = performance.now();

        const mh = measure(() =>
            minhashSimilarity(arrA, arrB, k, MAX_HASH)
        );

        const tTotalMH = performance.now() - tTotalMHStart;

        fs.appendFileSync(
            outPath,
            `MinHash\t${x}\t${k}\t${mh.result}\t${tTotalMH.toFixed(5)}\t${mh.t_compare}\t${mh.mem_used}\n`
        );
    }
}
