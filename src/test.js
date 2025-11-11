import { Minhash, LshIndex } from 'minhash'; // If using Node.js

var s1 = ['minhash', 'is', 'a', 'probabilistic', 'data', 'structure', 'for',
    'estimating', 'the', 'similarity', 'between', 'datasets'];
var s2 = ['minhash', 'is', 'a', 'probability', 'data', 'structure', 'for',
    'estimating', 'the', 'similarity', 'between', 'documents'];
var s3 = ['cats', 'are', 'tall', 'and', 'have', 'been',
    'known', 'to', 'sing', 'quite', 'loudly'];

// generate a hash for each list of words
var m1 = new Minhash();
var m2 = new Minhash();
var m3 = new Minhash();

// update each hash
s1.map(function(w) { m1.update(w) });
s2.map(function(w) { m2.update(w) });
s3.map(function(w) { m3.update(w) });

// add each document to a Locality Sensitive Hashing index
var index = new LshIndex();
index.insert('m1', m1);
index.insert('m2', m2);
index.insert('m3', m3);

// query for documents that appear similar to a query document
var matches = index.query(m1);
console.log('Jaccard similarity >= 0.5 to m1:', matches);
console.log("Starting...");