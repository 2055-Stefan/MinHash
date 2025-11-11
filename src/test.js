const {MinHashFactory} = require('bloom-filters')

// create the MinHashFactory, to create several comparable MinHash sets
// it uses 10 random hash functions and expect to see a maximum value of 999
const factory = new MinHashFactory(10, 999)

// create two empty MinHash
const fistSet = factory.create()
const secondSet = factory.create()

// push some occurrences in the first set
fistSet.add(1)
fistSet.add(2)

// the MinHash class also supports bulk loading
secondSet.bulkLoad([1, 3, 4])

// estimate the jaccard similarity between the two sets
const jaccardSim = fistSet.compareWith(secondSet)
console.log(`The estimated Jaccard similarity is ${jaccardSim}`)