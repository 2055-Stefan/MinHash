# Environment Setup – Performance Measurements

## 1. Systemumgebung
- CPU: Intel i5 / Ryzen 5 oder höher  
- RAM: 8 GB oder mehr  
- Betriebssystem: Windows 10/11 oder Ubuntu 22.04 LTS  
- Node.js: v20 LTS  
- npm: ≥ 10  

## 2. Projektkonfiguration
- Repository-Klon  
- Installation: `npm install`
- Start: `npm run start`  
- Testdaten: `/data/demo/skills.json`, `/data/demo/resources.json`

## 3. Messframework
- Zeitmessung: `performance.now()`  
- Speicher: `process.memoryUsage()`  
- Wiederholungen: 5 Läufe, Medianwert bilden  

## 4. Validierung
- Prüfe, ob bei 5 Wiederholungen <5 % Varianz  
- Ergebnisse nach `/data/results/raw/` speichern