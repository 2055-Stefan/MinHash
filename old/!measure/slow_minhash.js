// minhash.js

import pkg from 'bloom-filters';
const { MinHashFactory } = pkg;

export function minhashSimilarity(arrA, arrB, x, y) {

    // x = number of hash functions
    // y = max hash value
    const factory = new MinHashFactory(x, y);

    const setA = factory.create();
    const setB = factory.create();

    setA.bulkLoad(arrA);
    setB.bulkLoad(arrB);

    return setA.compareWith(setB);
}