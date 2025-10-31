# Performance Results – MinHash <HSH>

---

**Projekttitel:** MinHash <HSH>  
**Auftraggeber*in:** Herr Prof. Weiss | Frau Prof. Scherer / HTL Rennweg  
**Auftragnehmer*in:** Stefan Scheer | Christian Kleeber | Julian Höher | Leonardo Lin / HTL Rennweg  
**Schuljahr:** 2025/26  **Klasse:** 4BI  

---

**VERSION:** v1.0  **DATUM:** (nach Durchführung eintragen)  **AUTORIN/AUTOR:** Stefan Scheer  **ÄNDERUNG:** Erste Messergebnisse dokumentiert

---

## 1. Ziel des Dokuments
Dieses Dokument fasst die Ergebnisse der im Arbeitspaket *1.2.3.3 – Performance-Messung implementieren* durchgeführten Messungen zusammen.  
Die Messgrößen basieren auf den Definitionen in `performance_metrics.md`.

---

## 2. Testumgebung
- Betriebssystem: Windows 11  
- Prozessor: Intel i5 / Ryzen 5 oder höher  
- Arbeitsspeicher: 16 GB RAM  
- Node.js-Version: v20 LTS  
- Datengrundlage: Demo-Daten aus `/data/demo/`  
- Anzahl der Messläufe: 5 pro Konfiguration  
- Auswertung: Median der Messläufe

---

## 3. Ergebnisse

### 3.1 Jaccard-Algorithmus
Datensatzgröße: 1 000  
Gesamtlaufzeit (t_total): … ms  
Speicherverbrauch (mem_used): … MB  
Durchsatz (throughput): … res/s  
Relative Varianz (var_rel): … %

Datensatzgröße: 5 000  
Gesamtlaufzeit: …  
Speicherverbrauch: …  
Durchsatz: …  
Varianz: …

Datensatzgröße: 10 000  
Gesamtlaufzeit: …  
Speicherverbrauch: …  
Durchsatz: …  
Varianz: …

---

### 3.2 MinHash-Algorithmus
Datensatzgröße: 1 000  
Gesamtlaufzeit: …  
Speicherverbrauch: …  
Durchsatz: …  
Varianz: …

Datensatzgröße: 5 000  
Gesamtlaufzeit: …  
Speicherverbrauch: …  
Durchsatz: …  
Varianz: …

Datensatzgröße: 10 000  
Gesamtlaufzeit: …  
Speicherverbrauch: …  
Durchsatz: …  
Varianz: …

---

## 4. Skalierungsanalyse
Jaccard – Verhältnis t(10 000)/t(1 000): …  
MinHash – Verhältnis t(10 000)/t(1 000): …  

Beobachtung: … (z. B. MinHash skaliert besser bei großen Datensätzen.)

---

## 5. Beobachtungen
- Unterschiede in der Performance zwischen Jaccard und MinHash  
- Einfluss der Datengröße auf Laufzeit und Speicher  
- Stabilität der Messungen (Varianz)  
- Anomalien oder Ausreißer  

---

## 6. Schlussfolgerung
Kurze Zusammenfassung der wichtigsten Erkenntnisse, z. B.:
- MinHash erreicht bei großen Datensätzen eine deutliche Laufzeitverbesserung.  
- Speicherverbrauch bleibt vergleichbar.  
- Messverfahren liefert reproduzierbare Werte.

---

## 7. Referenzen
- `performance_metrics.md` – Definition der Messgrößen  
- `environment_setup.md` – Beschreibung der Messumgebung  
- *HSH_Projektziele_v2.1* → MZ03 „Performance-Messung“

---

**Dateiablage:**  
`docs/metrics/performance_results.md`