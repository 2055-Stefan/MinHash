/**
 * measure.js
 * Arbeitspaket: 1.2.3.3 – Performance-Messung implementieren
 * Projekt: MinHash <HSH>
 * Autor: Stefan Scheer
 * Datum: 31.10.2025
 *
 * Zweck:
 * Führt reproduzierbare Performance-Messungen für Jaccard und MinHash durch.
 * Ergebnisse werden als JSON in /data/results/raw/ gespeichert.
 */

import { performance } from "node:perf_hooks";
import fs from "fs";
import path from "path";

// ------------------------------------------------------
// 1. Testkonfiguration
// ------------------------------------------------------
const CONFIG = {
  runs: 5,
  datasets: [1000, 5000, 10000],
  outputFile: path.resolve("./data/results/raw/performance_raw.json"),
};

// ------------------------------------------------------
// 2. Hilfsfunktionen
// ------------------------------------------------------
function simulateWorkload(size, algorithm) {
  // Platzhalter für echte Algorithmen.
  // In der finalen Version werden hier Jaccard und MinHash aufgerufen.
  let result = 0;
  for (let i = 0; i < size; i++) {
    result += Math.sin(i) * Math.cos(i / 10);
  }
  return result + (algorithm === "MinHash" ? 1 : 0);
}

function measureAlgorithm(algorithm, size) {
  const startMem = process.memoryUsage().heapUsed;
  const startTime = performance.now();

  simulateWorkload(size, algorithm);

  const endTime = performance.now();
  const endMem = process.memoryUsage().heapUsed;

  return {
    algorithm,
    dataset: size,
    t_total: +(endTime - startTime).toFixed(3),
    mem_used: +((endMem - startMem) / 1024 / 1024).toFixed(3),
  };
}

// ------------------------------------------------------
// 3. Hauptfunktion
// ------------------------------------------------------
function runMeasurements() {
  const allResults = [];

  for (const algorithm of ["Jaccard", "MinHash"]) {
    for (const size of CONFIG.datasets) {
      const series = [];

      for (let i = 0; i < CONFIG.runs; i++) {
        const result = measureAlgorithm(algorithm, size);
        series.push(result.t_total);
        allResults.push(result);
      }

      // Varianz und Median grob prüfen
      const avg =
        series.reduce((a, b) => a + b, 0) / CONFIG.runs;
      const variance =
        series.map(x => (x - avg) ** 2).reduce((a, b) => a + b, 0) /
        CONFIG.runs;
      const var_rel = +(Math.sqrt(variance) / avg * 100).toFixed(2);

      console.log(
        `${algorithm} | ${size} | Ø ${avg.toFixed(2)} ms | Varianz ${var_rel}%`
      );
    }
  }

  // Ergebnisse exportieren
  fs.mkdirSync(path.dirname(CONFIG.outputFile), { recursive: true });
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(allResults, null, 2));

  console.log(`\nErgebnisse gespeichert unter: ${CONFIG.outputFile}`);
}

// ------------------------------------------------------
// 4. Start
// ------------------------------------------------------
runMeasurements();