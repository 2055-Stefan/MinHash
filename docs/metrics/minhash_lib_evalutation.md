# Evaluation geeigneter MinHash-Bibliotheken – MinHash <HSH>

---

**Projekttitel:** MinHash <HSH>  
**Auftraggeber*in:** Herr Prof. Weiss | Frau Prof. Scherer / HTL Rennweg  
**Auftragnehmer*in:** Stefan Scheer | Christian Kleeber | Julian Höher | Leonardo Lin / HTL Rennweg  
**Schuljahr:** 2025/26  **Klasse:** 4BI  

---

**VERSION:** v1.0  **DATUM:** 01.11.2025  **AUTORIN/AUTOR:** Stefan Scheer  **ÄNDERUNG:** Erstellung der Bibliotheksbewertung

---

## 1. Ziel des Dokuments
Ziel dieses Arbeitspakets (1.2.2.4) ist die Recherche und Bewertung geeigneter JavaScript-Bibliotheken für den Einsatz eines MinHash-Algorithmus im Projekt *MinHash <HSH>*.  
Die Untersuchung umfasst mindestens drei Bibliotheken und bewertet sie nach den Kriterien  
**Performance, Lizenz, Wartung und Kompatibilität mit SkillDisplay-APIs**.  
Die Ergebnisse dienen als Entscheidungsgrundlage für das nachfolgende Arbeitspaket *1.2.3.4 – MinHash-Bibliothek integrieren und anpassen*.

---

## 2. Vorgehensweise

1. Recherche auf **npm** und **GitHub** nach JavaScript-Bibliotheken, die MinHash oder verwandte Hashing-Verfahren implementieren.  
2. Sichtung der jeweiligen **Dokumentation**, **API-Beispiele** und **Community-Aktivität**.  
3. Analyse der **Lizenzbedingungen** (MIT, Apache, ISC etc.) auf Kompatibilität mit den Schulprojektrichtlinien.  
4. Bewertung anhand der Kriterien aus der Projektdefinition.  
5. Erstellung einer Empfehlung zur Integration in das Projekt.

---

## 3. Bewertungskriterien

- **Performance:** Algorithmische Effizienz, Laufzeit- und Speicherverhalten (theoretisch und praktisch).  
- **Lizenz:** Rechtliche Eignung für schulische und ggf. kommerzielle Nutzung (bevorzugt MIT/Apache 2.0).  
- **Wartung & Community:** Aktualität, Release-Historie, Anzahl an Commits/Issues.  
- **Kompatibilität:** Einsetzbarkeit in Node.js und Browser, einfache JSON-Verarbeitung, keine nativen Abhängigkeiten.  

---

## 4. Evaluierte Bibliotheken

### 4.1 duhaime/minhash (npm: `minhash`)
- **Funktionalität:** MinHash-Signatur und LSH-Index.  
- **Lizenz:** MIT.  
- **Wartung:** Stabil, letzte Version 2018, geringe Aktivität.  
- **Kompatibilität:** Reines JavaScript, funktioniert in Node und Browser.  
- **Einschätzung:** Sehr geeignet für prototypische Integration, einfacher Einstieg, kein Build-Overhead.  

---

### 4.2 F4llis/minhashjs (npm: `minhashjs`)
- **Funktionalität:** Portierung der Python-Bibliothek *datasketch*, bietet LSH-Forest-Funktionen.  
- **Lizenz:** Im README als *ISC*, auf GitHub als *MIT* angegeben → Klärung empfohlen.  
- **Wartung:** Geringe Community-Aktivität, aber nachvollziehbarer Code.  
- **Kompatibilität:** Reines JavaScript, einfache Einbindung möglich.  
- **Einschätzung:** Technisch brauchbar, aber geringe Reife und unklare Lizenz.

---

### 4.3 wherefortravel/minhash-node-rs (npm: `minhash-node-rs`)
- **Funktionalität:** Hochperformante Implementierung in Rust (Node-Addon), inkl. LSH-Index.  
- **Lizenz:** Offen, genaue Lizenz im Repository prüfen.  
- **Wartung:** Regelmäßige Releases (z. B. 2022), produktiv bei WhereTo.com eingesetzt.  
- **Kompatibilität:** Nur für Node-Umgebung, kein Browser-Support.  
- **Einschätzung:** Sehr gute Performance, jedoch zusätzlicher Build-Aufwand.

---

### 4.4 grouped-oph (npm)
- **Funktionalität:** Implementiert Grouped One-Permutation-Hashing (optimierte Variante von MinHash).  
- **Lizenz:** Noch prüfen, Paket neu (Veröffentlichung August 2025).  
- **Wartung:** Sehr jung, daher noch unbewertet.  
- **Kompatibilität:** Potenziell effizient, aber ungetestet.  
- **Einschätzung:** Forschungs- bzw. Testkandidat, nicht für Produktion vorgesehen.

---

## 5. Abgrenzung
Nicht berücksichtigt wurden **SimHash-Bibliotheken** (`simhash`, `simhash-js`), da sie auf einer anderen Ähnlichkeitsmethode basieren und kein MinHash-Verfahren implementieren.

---

## 6. Bewertung (Kurzfassung)

- **duhaime/minhash:** +Einfach, +Browser/Node, +MIT, –ältere Wartung  
- **minhashjs:** +API-ähnlich, –Lizenz unklar, –wenig getestet  
- **minhash-node-rs:** +Schnell, +aktiv, –nur Node, –Build nötig  
- **grouped-oph:** +modern, –neu, –geringe Stabilität  

---

## 7. Empfehlung
Für das Projekt *MinHash <HSH>* wird empfohlen, zunächst die Bibliothek  
**`duhaime/minhash`** zu integrieren, da sie:  
- eine **klare MIT-Lizenz** besitzt,  
- **Node und Browser** unterstützt,  
- eine **einfache API** mit LSH-Funktionen bietet,  
- **keine nativen Abhängigkeiten** erfordert.  

Für spätere Optimierungen kann **`minhash-node-rs`** als performantere, serverseitige Alternative untersucht werden.  
Die Pakete **`minhashjs`** und **`grouped-oph`** werden derzeit nicht weiterverfolgt.

---

## 8. Ergebnisprotokoll / Fortschritt
- 0 % – Voraussetzungen erfüllt, Zugriff auf npm und Demo-Daten vorhanden.  
- 25 % – Bibliotheken recherchiert, Bewertungskriterien definiert.  
- 50 % – API-Tests und Dokumentationsprüfung abgeschlossen.  
- 75 % – Lizenzprüfung und Bewertung abgeschlossen.  
- 100 % – Empfehlung dokumentiert und zur Abnahme bereitgestellt.

---

## 9. Referenzen
- npm Registry (Stand: 01.11.2025)  
- GitHub Repositories der Bibliotheken  
- *HSH_Projektziele_v2.1* → MZ03 „Performance-Messung“  
- *HSH_Machbarkeitsanalyse_v1.3* → Bewertung der Performance  
- Arbeitspaket 1.2.2.7 – „Geeignete MinHash-Bibliothek recherchieren und evaluieren“

---

**Dateiablage:**  
Teams: `03_technischePlanung/abnahme/minhash_lib_evaluation.md`  
GitHub: `docs/metrics/minhash_lib_evaluation.md`