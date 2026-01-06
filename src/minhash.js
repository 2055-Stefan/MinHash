// minhash.js
//
// Optimiert für Benchmarks:
// - MinHashFactory wird pro (k,maxHash) wiederverwendet (Cache)
// - Zusätzlich: Signature/MinHash-Set kann vorab erzeugt und wiederverwendet werden
//
// Exported:
// 1) minhashSimilarity(arrA, arrB, k, maxHash)         -> kompatibel zu vorher
// 2) getMinhashFactory(k, maxHash)                     -> Factory-Reuse
// 3) buildMinhashSet(arr, k, maxHash)                  -> "Signature" einmal bauen
// 4) compareMinhashSets(setA, setB)                    -> schneller Vergleich

import pkg from "bloom-filters";
const { MinHashFactory } = pkg;

// Cache: key = `${k}:${maxHash}` -> factory
const FACTORY_CACHE = new Map();

export function getMinhashFactory(k, maxHash) {
  const key = `${k}:${maxHash}`;
  const cached = FACTORY_CACHE.get(key);
  if (cached) return cached;

  const factory = new MinHashFactory(k, maxHash);
  FACTORY_CACHE.set(key, factory);
  return factory;
}

export function buildMinhashSet(arr, k, maxHash) {
  const factory = getMinhashFactory(k, maxHash);
  const set = factory.create();
  set.bulkLoad(arr);
  return set;
}

export function compareMinhashSets(setA, setB) {
  return setA.compareWith(setB);
}

// Backwards-compatible API (wie vorher), aber mit Factory-Reuse:
export function minhashSimilarity(arrA, arrB, k, maxHash) {
  const setA = buildMinhashSet(arrA, k, maxHash);
  const setB = buildMinhashSet(arrB, k, maxHash);
  return compareMinhashSets(setA, setB);
}
