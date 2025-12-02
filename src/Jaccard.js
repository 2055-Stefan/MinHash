import focusData from '../data/JSON/focusSkillsetIds/focus_89.json' with { type: "json" };
import learningData from '../data/JSON/learningSkillsetIds/learning_89.json' with { type: "json" };

import { performance } from "node:perf_hooks";

const focusIds = focusData.focusIds;
const learningSkillsetIds = learningData.learningSkillsetIds;

// ---------------------
// Jaccard Function
// ---------------------
function jaccard(arrA, arrB) {
    const setA = new Set(arrA);
    const setB = new Set(arrB);

    let intersection = 0;

    for (const id of setA) {
        if (setB.has(id)) {
            intersection++;
        }
    }

    const union = new Set([...setA, ...setB]).size;

    return intersection / union;
}

// ---------------------
// Performance Measurement
// ---------------------
function CalculateJaccard(arrA, arrB) {

    const start = performance.now();

    const sim = jaccard(arrA, arrB);

    const end = performance.now();

    console.log("Exact similarity (Jaccard):", sim);
    console.log(`Time: ${(end - start).toFixed(5)} ms`);
}

// Run
CalculateJaccard(focusIds, learningSkillsetIds);
