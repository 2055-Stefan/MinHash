# Grundsetup

---

**Projekttitel:** MinHash <HSH>  
**Auftraggeber*in:** Herr Prof. Weiss | Frau Prof. Scherer / HTL Rennweg  
**Auftragnehmer*in:** Stefan Scheer | Christian Kleeber | Julian Höher | Leonardo Lin / HTL Rennweg  
**Schuljahr:** 2025/26  **Klasse:** 4BI  

---

**VERSION:** v1.0  **DATUM:** 31.10.2025  **AUTOR:** Stefan Scheer  **ÄNDERUNG:** Erstellung  
**VERSION:** v1.1  **DATUM:** 09.11.2025  **AUTOR:** Stefan Scheer  **ÄNDERUNG:** Erweiterung VCS-Struktur sowie Bearbeitung einzelner hier abgebildeter Dateien  

---

## 1. Anmerkungen zur Bearbeitung von *environment_setup*
**Allgemein**
- Aufgrund der Volatilität des Projekts werden manche Dokumente im Setup geändert werden
- Das Dokument *HSH_EnvironmentSetup_x.y* (x.y entspricht jetzt 1.1) dient nur zur Abgabe und befindet sich auf Teams
- Das Dokument *environment_setup* im Ordner /docs/metrics ist die zu verwendene und aktuellste Version des Dokuments und befindet sich auf GitHub (bzw. nach git clone auch lokal)
- Bei Änderungen (z.B. Erstellung neuer Ordner im Root VZ; Anpassung D) im Grundsetup, welche die Anpassung des environment_setups erfordern, soll der Projektleiter konsultiert werden - siehe HSH_Spielregeln_v.2.1 im Abschnitt 2.2 Veränderungsmanagement

**Christian Kleeber**  
- Erstellung der ursprünglichen Dateien zur Datenaufbereitung (jetzt in `src/data/fetch/` enthalten).  
- Aufbau der ersten API-Fetches zu SkillDisplay.  

**Julian Höher**  
- Erstellung des NodeJS-Docker-Setup in /src
- Erstellung `package.json`  
- Überarbeitung GitHub-Struktur und Projektarchitektur.  

---

## 2. Ziel des Dokuments

Dieses Dokument beschreibt die technische Umgebung, Software-Voraussetzungen und Projektstruktur für das Projekt MinHash insbesondere im Bereich *Performance Measurements*.  
Es dient als Referenz, um eine einheitliche Entwicklungsumgebung sicherzustellen und die Messergebnisse reproduzierbar zu halten.

---

## 3. Hardware

- **CPU:** Intel i5 / Ryzen 5 oder höher  
- **RAM:** ≥ 8 GB  
- **Datenträger:** SSD (> 400 MB/s)  
- **Stromversorgung:** stabil, keine Energiesparmodi  
- **Netzwerk:** erforderlich für SkillDisplay-API

---

## 4. Software

- **Betriebssystem:** Windows 10/11 oder Ubuntu 22.04 LTS  
- **Node JS:** Version 22 LTS  
- **npm:** 10 oder höher  
- **Editor:** VS Code / WebStorm  
- **Versionsverwaltung:** Git (GitHub Repository MinHash <HSH>)  
- **Docker Compose:** v2 oder höher  
- **Automatisch installierte Pakete:**  
  - `node-fetch` (HTTP-Requests)  
  - `fs` (Dateioperationen)

---

## 5. Projektstruktur (Stand v1.1)

```
MINHASH/
├─ data/
│  ├─ demo/
│  ├─ fetch/
│  │  ├─ Focus_Skillsets.js
│  │  ├─ Learning_Skillsets.js
│  │  └─ Verifications.js
│  └─ results/
│     ├─ raw/
│     │  └─ <timestamp>/
│     │     ├─ Focus_skillset.json
│     │     ├─ Learning_skillset.json
│     │     └─ Verifications.json
│     └─ processed/
├─ docs/
│  └─ metrics/
│     ├─ environment_setup.md
│     ├─ performance_metrics.md
│     ├─ performance_results.md
│     └─ minhash_lib_evaluation.md
├─ src/
│  ├─ algorithms/
│  │  ├─ jaccard.js
│  │  └─ minhash.js
│  ├─ data/
│  │  └─ fetchAll.js
│  ├─ docker-compose.yaml
│  ├─ measure.js
│  ├─ package.json
│  └─ test.js
└─ README.md
```

---

## 6. Docker Compose Setup

```yaml
services:
  node:
    image: "node:22"
    user: "node"
    working_dir: /home/node/app
    environment:
      - NODE_ENV=production
    volumes:
      - ./:/home/node/app
    ports:
      - "8888:8888"
    command: ["sh", "-c", "npm install && npm start"]
```

**Start:**  
```bash
docker-compose up
```
➡ Automatischer Durchlauf aller Fetch-Skripte, Speicherung im aktuellen Zeitstempel-Ordner.

---

## 7. Einrichtungsschritte

1. Repository klonen  
   ```bash
   git clone https://github.com/2055-Stefan/MinHash.git
   cd MinHash
   ```
2. Container starten  
   ```bash
   docker-compose up
   ```
3. Ergebnisse prüfen  
   → JSON-Dateien unter `data/results/raw/<timestamp>/`  
4. Performance-Messung vorbereiten  
   → `measure.js` verarbeitet diese Daten für MZ03

---

## 8. Validierung der Umgebung

- Node-Version prüfen (`node -v`)  
- CPU-Auslastung < 90 %  
- keine parallelen Prozesse  
- identische Testbedingungen für Jaccard und MinHash

---

## 9. Referenzen

- *HSH_Projektziele_v2.1* – MZ03 „Performance-Messung“  
- *HSH_Machbarkeitsanalyse_v1.3* – Alternative 3 „externe Bibliothek“  
- *HSH_Spielregeln_v2.1* – Dokumentenablage und Versionierung  

---

**Dateiablage:** `docs/metrics/environment_setup.md`
