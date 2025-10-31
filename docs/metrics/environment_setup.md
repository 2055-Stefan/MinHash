# Environment Setup – Performance Measurements (MinHash <HSH>)

---

**Projekttitel:** MinHash <HSH>  
**Auftraggeber*in:** Herr Prof. Weiss | Frau Prof. Scherer / HTL Rennweg  
**Auftragnehmer*in:** Stefan Scheer | Christian Kleeber | Julian Höher | Leonardo Lin / HTL Rennweg  
**Schuljahr:** 2025/26  **Klasse:** 4BI  

---

**VERSION:** v1.0  **DATUM:** 31.10.2025  **AUTORIN/AUTOR:** Stefan Scheer  **ÄNDERUNG:** Erstellung

---

## 1. Ziel des Dokuments
Dieses Dokument beschreibt die technische Umgebung, Softwarevoraussetzungen und Werkzeuge, die für die Durchführung der Performance-Messungen im Projekt *MinHash <HSH>* erforderlich sind.  
Es dient als Referenz für reproduzierbare Tests gemäß den Vorgaben aus `performance_metrics.md`.

---

## 2. Hardware
- Prozessor: Intel i5 / AMD Ryzen 5 oder höher  
- Arbeitsspeicher: mindestens 8 GB RAM  
- Datenträger: SSD empfohlen (Lese-/Schreibgeschwindigkeit > 400 MB/s)  
- Stromversorgung: stabil, keine Energiesparmodi während der Messung  
- Netzwerkanbindung: nicht erforderlich (Offline-Testdaten)

---

## 3. Software
- Betriebssystem: Windows 10/11 oder Ubuntu 22.04 LTS  
- Node.js: Version 20 LTS  
- npm: Version 10 oder höher  
- Editor: VS Code oder WebStorm (beliebig)  
- Versionsverwaltung: Git / GitHub  
- Zusatzpakete:  
  - `perf_hooks` (integriert in Node.js)  
  - `fs` (Dateizugriff für Rohdatenexport)

---

## 4. Projektstruktur
Empfohlene Verzeichnisstruktur für die lokale Entwicklungsumgebung:

project-root/
├─ docs/
│ └─ metrics/
│ ├─ performance_metrics.md
│ ├─ performance_results.md
│ └─ environment_setup.md
├─ data/
│ ├─ demo/
│ │ ├─ resources.json
│ │ └─ skills.json
│ └─ results/
│ ├─ raw/
│ └─ processed/
├─ src/
│ ├─ algorithms/
│ │ ├─ jaccard.js
│ │ └─ minhash.js
│ └─ measure.js
├─ package.json
└─ README.md


---

## 5. Einrichtungsschritte

1. Repository klonen  
   `git clone <repo-url>`  

2. Abhängigkeiten installieren  
   `npm install`

3. Datenstruktur prüfen  
   Vergewissere dich, dass die Demo-Daten in `/data/demo/` vorhanden sind.

4. Testskript vorbereiten  
   In `src/measure.js` Zeit- und Speicher-Messung implementieren.

5. Messung starten  
   `node src/measure.js`

6. Ergebnisse prüfen  
   - Rohdaten unter `/data/results/raw/`  
   - Auswertung in `/data/results/processed/`

---

## 6. Validierung der Umgebung
Vor jeder Messreihe:  
- Node.js-Version prüfen: `node -v`  
- CPU-Auslastung unter 90 % halten  
- keine parallelen Prozesse (Browser, IDE-Tasks)  
- identische Startbedingungen für Jaccard- und MinHash-Tests

---

## 7. Pflege und Versionierung
- Änderungen an dieser Datei nur nach Absprache mit der Projektleitung  
- Versionsnummer erhöhen bei jeder Anpassung der Umgebung  
- Freigabe über Jour Fixe dokumentieren

---

## 8. Referenzen
- `performance_metrics.md` – Definition der Messgrößen  
- `performance_results.md` – Messergebnisse  
- *HSH_Spielregeln_v2.1* – Dokumentenablage und Versionierung  
- *HSH_Projektziele_v2.1* → MZ03 „Performance-Messung“

---

**Dateiablage:**  
`docs/metrics/environment_setup.md`

