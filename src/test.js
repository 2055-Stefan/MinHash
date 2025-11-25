import pkg from 'bloom-filters';
const { MinHashFactory } = pkg;

import focusData from '../data/JSON/focusSkillsetIds/focus_1.json' with { type: "json" };
import learningData from '../data/JSON/learningSkillsetIds/learning_1.json' with { type: "json" };

const focusIds = focusData.focusIds;
const learningSkillsetIds = learningData.learningSkillsetIds;

import { performance } from "node:perf_hooks";

CalculateMinHash(focusIds, learningSkillsetIds);

function CalculateMinHash(arrA, arrB) {

    const memBefore = process.memoryUsage().heapUsed;

    const totalStart = performance.now();

    const compareStart = performance.now();

    const factory = new MinHashFactory(100, 4000);

    const setA = factory.create();
    const setB = factory.create();

    setA.bulkLoad(arrA);
    setB.bulkLoad(arrB);

    const sim = setA.compareWith(setB);

    const compareEnd = performance.now();

    const totalEnd = performance.now();

    const memAfter = process.memoryUsage().heapUsed;

    const t_total = (totalEnd - totalStart).toFixed(5);
    const t_compare = (compareEnd - compareStart).toFixed(5);
    const mem_used = ((memAfter - memBefore) / 1024 / 1024).toFixed(5); // MB

    console.log("Estimated similarity (MinHash):", sim);
    console.log(`t_total:   ${t_total} ms`);
    console.log(`t_compare: ${t_compare} ms`);
    console.log(`mem_used:  ${mem_used} MB`);
}