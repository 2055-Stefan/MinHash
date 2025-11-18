const { MinHashFactory } = require('bloom-filters')
function CalculateMinHash(arrA, arrB) {

const factory = new MinHashFactory(100, 4000)

const { performance } = require('node:perf_hooks')
const start = performance.now()

const setA = factory.create()
const setB = factory.create()

setA.bulkLoad(arrA)
setB.bulkLoad(arrB)

const sim = setA.compareWith(setB)
const end = performance.now()

console.log("Estimated Jaccard similarity:", sim)
console.log(`Time: ${(end - start).toFixed(5)} ms`)
}