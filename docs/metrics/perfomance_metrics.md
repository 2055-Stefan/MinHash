# Performance Metrics – MinHash <HSH>

---

**Projekttitel:** MinHash <HSH>  
**Auftraggeber*in:** Herr Prof. Weiss | Frau Prof. Scherer / HTL Rennweg  
**Auftragnehmer*in:** Stefan Scheer | Christian Kleeber | Julian Höher | Leonardo Lin / HTL Rennweg  
**Schuljahr:** 2025/26  **Klasse:** 4BI  

---

**VERSION:** v1.0  **DATUM:** 31.10.2025  **AUTORIN/AUTOR:** Stefan Scheer  **ÄNDERUNG:** Erstellung


## 1. Ziel des Dokuments
Dieses Dokument definiert die Messgrößen, Messmethodik und Testumgebung zur Bewertung der Performance der Algorithmen Jaccard und MinHash.  
Es bildet die Grundlage für reproduzierbare Performance-Messungen im Arbeitspaket 1.2.2.3 – „Messgrößen definieren“.

---

## 2. Übersicht der Messgrößen

**Laufzeit (t_total)**  
Gesamtlaufzeit für den kompletten Abgleich (Filterung + Vergleich + Sortierung).  
Einheit: Millisekunden  
Messmethode: `performance.now()` Start-/End-Differenz  
Bedeutung: Primäre Kennzahl der Performance.

**t_filter**  
Zeit für Filterung irrelevanter Ressourcen.  
Einheit: Millisekunden  
Messmethode: Zeitmessung vor/nach Filter.

**t_compare**  
Zeit für Vergleichsalgorithmus (Jaccard bzw. MinHash).  
Einheit: Millisekunden  
Messmethode: Abschnittsweise Messung.

**t_sort**  
Zeit für Sortierung der Ergebnisse.  
Einheit: Millisekunden.

**mem_used**  
Veränderung des belegten Heapspeichers während der Berechnung.  
Einheit: Megabyte  
Messmethode: `process.memoryUsage().heapUsed`.

**throughput**  
Verarbeitete Ressourcen pro Sekunde.  
Formel: Anzahl / (t_total / 1000)  
Einheit: Ressourcen / s.

**scalability**  
Verhältnis der Laufzeiten bei steigender Datenmenge.  
Formel: t(10 000) / t(1 000).

**var_rel**  
Relative Varianz zwischen Messläufen.  
Formel: σ / μ × 100 %  
Bewertung der Reproduzierbarkeit.

---

## 3. Messumgebung

Hardware:  
- PC oder Laptop mit Intel i5 / Ryzen 5 oder höher  
- 8 GB RAM  
- stabile Stromversorgung  

Software:  
- Windows 10/11 oder Ubuntu 22.04 LTS  
- Node.js v20 LTS, npm ≥ 10  
- JavaScript (ES6)

Daten:  
- JSON-Demodaten aus Arbeitspaket 1.2.2.1 „Datenbasis prüfen“  
- 1 000 / 5 000 / 10 000 Ressourcen  
- je 5 Wiederholungen, Medianwert verwenden

Ergebnisse:  
- Rohdaten → `results/performance_raw.json`

---

## 4. Vergleichsschema Jaccard ↔ MinHash

- **Filterung:** sollte identische Zeiten liefern  
- **Vergleich:** MinHash erwartet schneller bei großen Datenmengen  
- **Sortierung:** kaum Differenzen  
- **Gesamtlaufzeit:** Hauptmetrik  
- **Speicherverbrauch:** Effizienzvergleich  
- **Skalierung:** zeigt Zeitwachstum pro Datenmenge

---

## 5. Messablauf

1. Demo-Daten laden  
2. Filterung ausführen  
3. Vergleichsalgorithmus (Jaccard / MinHash) anwenden  
4. Ergebnisse sortieren  
5. Zeit- und Speicherwerte erfassen  
6. Schritte 1–5 fünfmal wiederholen  
7. Medianwerte bilden  
8. Resultate dokumentieren

---

## 6. Validierung

Ein Testlauf mit den Demo-Daten prüft:
- Varianz unter 5 % zwischen Läufen  
- identische Bedingungen für beide Algorithmen  
- Messlogik reproduzierbar im nächsten AP nutzbar

---

## 7. Verantwortlichkeiten

- Definition der Kennzahlen: **Stefan Scheer**  
- Aufbau der Messumgebung: **Stefan Scheer**  
- Validierung & Rücksprache: Projektleitung (Scheer)  
- Review & Ablage: gesamtes Team im Jour Fixe

---

## 8. Ablage

**Teams:**  
`03_technischePlanung/abnahme/performance_metrics.md`

**GitHub-Empfehlung:**  

docs
 ├─ /metrics
 │   ├─ performance_metrics.md        → Definition der Metriken
 │   ├─ performance_results.md        → Messergebnisse (später)
 │   └─ environment_setup.md          → System- und Toolbeschreibung
data
 └─ /results
     ├─ performance_raw.json          → Rohdaten
     └─ performance_summary.json      → Ausgewertete Statistik


**Erläuterung:**  
- `/docs/metrics` enthält alle konzeptionellen Dokumente.  
- `/data/results` speichert Messdaten getrennt in *raw* und *processed*, um Reproduzierbarkeit zu gewährleisten.  
- Die Trennung zwischen Dokumentation und Daten erleichtert CI-Auswertungen und spätere Analysen.

---

## 9. Referenzen
- *HSH_Projektziele_v2.1* → MZ03 „Performance-Messung“  
- *HSH_Machbarkeitsanalyse_v1.3* → Bewertung der Performance  
- *Arbeitspaket 1.2.2.3 – Messgrößen definieren*