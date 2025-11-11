# Performance Metrics – MinHash <HSH>

---

**Projekttitel:** MinHash <HSH>  
**Auftraggeber*in:** Herr Prof. Weiss | Frau Prof. Scherer / HTL Rennweg  
**Auftragnehmer*in:** Stefan Scheer | Julian Höher | Leonardo Lin / HTL Rennweg  
**Schuljahr:** 2025/26  **Klasse:** 4BI  

---
**VERSION:** v1.0  **DATUM:** 31.10.2025  **AUTORIN/AUTOR:** Stefan Scheer  **ÄNDERUNG:** Erstellung  
**VERSION:** v1.1  **DATUM:** 11.11.2025  **AUTOR:** Stefan Scheer  **ÄNDERUNG:** Anpassung an aktualisiertes Grundsetup und Node-Compose-Umgebung  

---


## 1. Anmerkungen zur Bearbeitung von *performance_metrics*

**Allgemein**  
- Aufgrund der Volatilität des Projekts werden manche Dokumente im technischen Bereich (Setup, Metrics, Results) angepasst oder erweitert.  
- Das Dokument *HSH_PerformanceMetrics_x.y* (aktuell v1.1) dient nur zur **Abgabeversion** und befindet sich auf Teams.  
- Die Datei *performance_metrics.md* im Ordner `/docs/metrics` ist die **aktuellste und gültige Arbeitsversion** und wird in GitHub gepflegt.  
- Änderungen an Messmethodik oder Kennzahlen sind mit der Projektleitung abzustimmen (siehe *HSH_Spielregeln_v2.1*, Abschnitt 2.2 – Veränderungsmanagement).

---

## 2. Ziel des Dokuments

Dieses Dokument definiert die Messgrößen, Messmethodik und Testumgebung zur Bewertung der Performance der Algorithmen **Jaccard** und **MinHash**.  
Es bildet die Grundlage für reproduzierbare Performance-Messungen im Arbeitspaket **1.2.2.3 – „Messgrößen definieren“**.

---

## 3. Übersicht der Messgrößen

**Laufzeit (t_total)**  
Gesamtlaufzeit für den kompletten Abgleich (Filterung + Vergleich + Sortierung).  
Einheit: Millisekunden  
Messmethode: `performance.now()` (Start-/End-Differenz)  
Bedeutung: Primäre Kennzahl der Performance.

**t_filter**  
Zeit für Filterung irrelevanter Ressourcen.  
Einheit: Millisekunden  
Messmethode: Zeitmessung vor/nach Filterung.

**t_compare**  
Zeit für Vergleichsalgorithmus (Jaccard bzw. MinHash).  
Einheit: Millisekunden  
Messmethode: Abschnittsweise Messung innerhalb `measure.js`.

**t_sort**  
Zeit für Sortierung der Ergebnisse.  
Einheit: Millisekunden.

**mem_used**  
Veränderung des belegten Heapspeichers während der Berechnung.  
Einheit: Megabyte  
Messmethode: `process.memoryUsage().heapUsed`.

**throughput**  
Verarbeitete Ressourcen pro Sekunde.  
Formel: `Anzahl / (t_total / 1000)`  
Einheit: Ressourcen / s.

**scalability**  
Verhältnis der Laufzeiten bei steigender Datenmenge.  
Formel: `t(10 000) / t(1 000)`.

**var_rel**  
Relative Varianz zwischen Messläufen.  
Formel: `σ / μ × 100 %`  
Bewertung der Reproduzierbarkeit.

---

## 4. Messumgebung

**Hardware:**  
- Prozessor: Intel i5 / Ryzen 5 oder höher  
- Arbeitsspeicher: mind. 8 GB  
- Datenträger: SSD (> 400 MB/s)  
- Stromversorgung: stabil, keine Energiesparmodi  

**Software:**  
- Betriebssystem: Windows 10/11 oder Ubuntu 22.04 LTS  
- Node.js v22 LTS, npm ≥ 10  
- Docker Compose v2 oder höher  
- JavaScript (ES6, Node-Standardbibliotheken)  

**Datenbasis:**  
- JSON-Dateien aus `/data/results/raw/<timestamp>/`  
- erstellt über `fetchAll.js` (Automatischer API-Abruf von SkillDisplay)  
- Messgrößen-Samples: 1 000 / 5 000 / 10 000 Ressourcen  
- pro Messreihe: 5 Wiederholungen → Medianwert verwenden  

**Ergebnisse:**  
- Rohdaten → `data/results/raw/<timestamp>/performance_raw.json`  
- Zusammenfassung → `data/results/processed/performance_summary.json`

---

## 5. Vergleichsschema Jaccard ↔ MinHash

| Abschnitt | Erwartetes Verhalten |
|------------|----------------------|
| **Filterung** | nahezu identische Laufzeit |
| **Vergleich** | MinHash effizienter bei großen Datenmengen |
| **Sortierung** | minimale Differenzen |
| **Gesamtlaufzeit** | Hauptvergleichsmetrik |
| **Speicherverbrauch** | Effizienzbewertung |
| **Skalierung** | Zeitwachstum pro Datenmenge |

---

## 6. Messablauf

1. Demodaten bzw. Timestamp-Ordner laden  
2. Filterung ausführen  
3. Vergleichsalgorithmus (Jaccard / MinHash) anwenden  
4. Ergebnisse sortieren  
5. Zeit- und Speicherverbrauch erfassen  
6. Schritte 1–5 fünfmal wiederholen  
7. Medianwerte bilden  
8. Ergebnisse als JSON speichern und dokumentieren  

---

## 7. Validierung

Ein Testlauf mit den Demodaten überprüft:
- Varianz < 5 % zwischen den Läufen  
- identische Startbedingungen (Node v22, Docker-Container „node“)  
- gleiche Datengrundlage (Timestamp-Ordner)  
- Messlogik reproduzierbar für spätere Arbeitspakete  

---

## 8. Referenzen

- *HSH_Projektziele_v2.1* → MZ03 „Performance-Messung“  
- *HSH_Machbarkeitsanalyse_v1.3* → Bewertung der Performance  
- *HSH_Spielregeln_v2.1* → Dokumentenablage und Versionierung  
- *environment_setup.md* → Systemumgebung und Verzeichnisstruktur  

---

**Dateiablage:**  
Teams: `03_technischePlanung/abnahme/HSH_perfomance_metrics_v1.1.md`  
GitHub: `docs/metrics/performance_metrics.md`