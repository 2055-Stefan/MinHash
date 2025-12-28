// measure_mz02_03.js
import { performance } from "node:perf_hooks";
import fs from "fs";
import path from "path";

import { jaccardOptimized } from "./jaccard_new.js";

// ------------------------------
// KONFIG
// ------------------------------
const X_VALUES = [3, 8, 89];

const OUTPUT_DIR = "./data/results/processed";
const FILE_MZ02 = "mz02_sorted_results.tsv";
const FILE_MZ03 = "mz03_performance_breakdown.tsv";

// ------------------------------
// Hilfsfunktionen
// ------------------------------
function loadData(x) {
    return Promise.all([
        import(`./data/JSON/focusSkillsetIds/focus_${x}.json`, { with: { type: "json" } }),
        import(`./data/JSON/learningSkillsetIds/learning_${x}.json`, { with: { type: "json" } })
    ]);
}

// ------------------------------
// Ordner & Header vorbereiten
// ------------------------------
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

fs.writeFileSync(
    path.join(OUTPUT_DIR, FILE_MZ02),
    "X\tRank\tResourceSkillID\tSimilarity\n"
);

fs.writeFileSync(
    path.join(OUTPUT_DIR, FILE_MZ03),
    "X\tResources\tt_filter(ms)\tt_compare(ms)\tt_sort(ms)\tt_total(ms)\tt_per_resource(ms)\n"
);

// ------------------------------
// HAUPTLOGIK
// ------------------------------
for (const x of X_VALUES) {

    // ---------- DATEN LADEN ----------
    const tLoadStart = performance.now();
    const [focus, learning] = await loadData(x);
    const arrA = focus.default.focusIds;
    const resources = learning.default.learningSkillsetIds;
    const tFilterEnd = performance.now();

    // ---------- VERGLEICH ----------
    const tCompareStart = performance.now();

    const scoredResources = resources.map((skillId) => ({
        skillId,
        similarity: jaccardOptimized(arrA, [skillId]) // ✅ FIX
    }));

    const tCompareEnd = performance.now();

    // ---------- SORTIERUNG ----------
    const tSortStart = performance.now();
    scoredResources.sort((a, b) => b.similarity - a.similarity);
    const tSortEnd = performance.now();

    // ---------- MZ02 OUTPUT ----------
    scoredResources.forEach((res, rank) => {
        fs.appendFileSync(
            path.join(OUTPUT_DIR, FILE_MZ02),
            `${x}\t${rank + 1}\t${res.skillId}\t${res.similarity}\n`
        );
    });

    // ---------- MZ03 OUTPUT ----------
    const t_filter = tFilterEnd - tLoadStart;
    const t_compare = tCompareEnd - tCompareStart;
    const t_sort = tSortEnd - tSortStart;
    const t_total = t_filter + t_compare + t_sort;
    const t_per_resource = t_total / resources.length;

    fs.appendFileSync(
        path.join(OUTPUT_DIR, FILE_MZ03),
        `${x}\t${resources.length}\t` +
        `${t_filter.toFixed(5)}\t` +
        `${t_compare.toFixed(5)}\t` +
        `${t_sort.toFixed(5)}\t` +
        `${t_total.toFixed(5)}\t` +
        `${t_per_resource.toFixed(5)}\n`
    );
}
