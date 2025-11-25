import pkg from 'bloom-filters';
const { MinHashFactory } = pkg;

import focusData from '../data/JSON/focusSkillsetIds/focus_1.json' with { type: "json" };
import learningData from '../data/JSON/learningSkillsetIds/learning_1.json' with { type: "json" };

const focusIds = focusData.focusIds;
const learningSkillsetIds = learningData.learningSkillsetIds;

import { performance } from "node:perf_hooks";

CalculateMinHash(focusIds,learningSkillsetIds);
function CalculateMinHash(arrA, arrB) {

    const factory = new MinHashFactory(100, 4000)

    const start = performance.now()

    const setA = factory.create()
    const setB = factory.create()

    setA.bulkLoad(arrA)
    setB.bulkLoad(arrB)

    const sim = setA.compareWith(setB)
    const end = performance.now()

    console.log("Estimated similarity (MinHash):", sim)
    console.log(`Time: ${(end - start).toFixed(5)} ms`)
}
