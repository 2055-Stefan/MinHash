// measure.js
import { performance } from "node:perf_hooks";
import { jaccardSimilarity } from "./jaccard.js";
import { jaccardOptimized } from "./jaccard_new.js";

// IDs sind fix (nur diese Dateien existieren)
const IDS = [1, 3, 8, 55, 89];

// ------------------------------
// Warmup – nicht loggen
// ------------------------------
function warmup() {
    const dummyA = [1, 2, 3];
    const dummyB = [3, 4, 5];
    jaccardSimilarity(dummyA, dummyB);
    jaccardOptimized(dummyA, dummyB);
}
warmup();

// DE-Komma statt Punkt
function de(num) {
    return String(num).replace(".", ",");
}

// ------------------------------
// Zeitmessung
// ------------------------------
function measure(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    return {
        similarity: de(result),
        time: de((end - start).toFixed(5))
    };
}

// ------------------------------
// Hauptausgabe – Excel-ready
// ------------------------------
console.log("A\tB\tMethode\tSimilarity\tZeit(ms)");

for (const a of IDS) {

    const focusA = await import(
        `./data/JSON/focusSkillsetIds/focus_${a}.json`,
        { with: { type: "json" } }
    );
    const arrA = focusA.default.focusIds;

    for (const b of IDS) {

        const learningB = await import(
            `./data/JSON/learningSkillsetIds/learning_${b}.json`,
            { with: { type: "json" } }
        );
        const arrB = learningB.default.learningSkillsetIds;

        // Jaccard (vorgegeben)
        const jacOld = measure(() =>
            jaccardSimilarity(arrA, arrB)
        );

        // Jaccard (optimiert)
        const jacNew = measure(() =>
            jaccardOptimized(arrA, arrB)
        );

        console.log(`${a}\t${b}\jaccardSimilarity\t${jacOld.similarity}\t${jacOld.time}`);
        console.log(`${a}\t${b}\tJaccard_Optimized\t${jacNew.similarity}\t${jacNew.time}`);
    }
}
