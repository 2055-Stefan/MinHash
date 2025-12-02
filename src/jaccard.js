// jaccard.js

export function jaccardSimilarity(arrA, arrB) {
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
