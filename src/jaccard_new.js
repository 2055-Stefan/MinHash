// Jaccard similarity using Sets
export function jaccardNew(arrA, arrB) {
    const setA = new Set(arrA);
    const setB = new Set(arrB);

    let intersection = 0;

    for (const value of setA) {
        if (setB.has(value)) {
            intersection++;
        }
    }

    const unionSize = new Set([...setA, ...setB]).size;

    return intersection / unionSize;
}
