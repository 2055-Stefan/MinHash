// measure.js
import { performance } from "node:perf_hooks";
import { minhashSimilarity } from "./minhash.js";
import { jaccardSimilarity } from "./jaccard.js";

// IDs sind fix
const IDS = [1, 3, 8, 55, 89];

// MinHash Parameter
const X_VALUES = [1, 32, 1024, 32768, 1048576];  // Array mit verschiedenen Werten für X
const Y = 10000;

// ------------------------------
// Warmup – nicht loggen
// ------------------------------
function warmup() {
    const dummyA = [1, 2, 3];
    const dummyB = [3, 4, 5];
    for (const X of X_VALUES) {  // Schleife für X-Werte
        minhashSimilarity(dummyA, dummyB, X, Y);
        jaccardSimilarity(dummyA, dummyB);
    }
}
warmup();

// DE-Komma statt Punkt
function de(num) {
    return String(num).replace(".", ",");
}

// ------------------------------
// Zeitmessung OHNE Memory
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
console.log("X\tA\tB\tMethode\tSimilarity\tZeit(ms)");

for (const X of X_VALUES) {  // Schleife für X-Werte
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

            // MinHash
            const minR = measure(() =>
                minhashSimilarity(arrA, arrB, X, Y)
            );

            // Jaccard
            const jacR = measure(() =>
                jaccardSimilarity(arrA, arrB)
            );

            console.log(`${X}\t${a}\t${b}\tMinHash\t${minR.similarity}\t${minR.time}`);
            console.log(`${X}\t${a}\t${b}\tJaccard\t${jacR.similarity}\t${jacR.time}`);
        }
    }
}
