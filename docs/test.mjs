// Run with: node --experimental-fetch script.mjs   (Node 18+ hat global fetch)
// Falls du CommonJS nutzt: speichere als .mjs oder verwende dynamic import('node-fetch').

// ---------------------------
// 1) Hilfsfunktionen
// ---------------------------
async function fetchJson(url) {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return res.json();
}

function chunk(array, size) {
    const out = [];
    for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
    return out;
}

// ---------------------------
// 2) Jaccard wie in deiner App
// ---------------------------
/**
 * Calculates the Jaccard Index for a given Focus and Learning SkillSet
 * (Deine Originalfunktion – unverändert übernommen)
 */
function jaccard(skillset, desiredSkillIdsWithoutVerification) {
    if (skillset.skills === undefined) {
        return 0;
    }
    const setB = skillset.skills.map(skill => skill.uid);
    const intersectionSizeAB = desiredSkillIdsWithoutVerification.filter(value => setB.includes(value)).length;
    const unionSizeAB = new Set([...desiredSkillIdsWithoutVerification, ...setB]).size;
    const jaccardIndex = intersectionSizeAB / unionSizeAB;
    return jaccardIndex;
}

// ---------------------------
// 3) Kernlogik
// ---------------------------
const BASE = "https://www.skilldisplay.eu/api/v1";

async function getFocusSkillIds(focusSkillsetUid = 1096) {
    const focus = await fetchJson(`${BASE}/skillset/${focusSkillsetUid}`);
    if (!focus?.skills || !Array.isArray(focus.skills)) {
        throw new Error("Focus SkillSet hat keine 'skills'-Liste.");
    }
    // Array eindeutiger Skill-UIDs (Zahlen)
    const ids = [...new Set(focus.skills.map(s => s.uid))];
    return { focus, ids };
}

async function getLearnerOrEducationSkillsets(orgUid = 1) {
    const org = await fetchJson(`${BASE}/organisation/${orgUid}`);
    const all = org?.skillSets ?? [];
    // nur Lernressourcen
    const learners = all.filter(s =>
        s.firstCategoryTitle === "Learner" || s.firstCategoryTitle === "Education"
    );
    // Für jeden brauchen wir die Details (inkl. skills[])
    return learners.map(s => ({ uid: s.uid, name: s.name, firstCategoryTitle: s.firstCategoryTitle }));
}

async function hydrateSkillsetDetails(skillsets, { concurrency = 10 } = {}) {
    const results = [];
    const batches = chunk(skillsets, concurrency);
    for (const batch of batches) {
        const fetched = await Promise.allSettled(
            batch.map(async meta => {
                const detail = await fetchJson(`${BASE}/skillset/${meta.uid}`);
                return { meta, detail };
            })
        );
        for (const f of fetched) {
            if (f.status === "fulfilled") {
                results.push({ ...f.value.meta, detail: f.value.detail });
            } else {
                // robust gegenüber 404/Netzfehlern → wir behalten den Eintrag mit leerem Detail
                results.push({ ...batch[results.length] /* rough fallback */, detail: { uid: batch[results.length]?.uid, name: batch[results.length]?.name, skills: [] } });
            }
        }
    }
    return results;
}

function computeMatches(focusIds, learnerDetails) {
    const out = [];
    for (const item of learnerDetails) {
        const skillset = item.detail;
        const score = jaccard(skillset, focusIds);
        const setB = Array.isArray(skillset.skills) ? skillset.skills.map(s => s.uid) : [];
        const intersection = focusIds.filter(id => setB.includes(id));
        const unionSize = new Set([...focusIds, ...setB]).size;
        out.push({
            uid: item.uid,
            name: item.name || skillset.name,
            category: item.firstCategoryTitle,
            jaccard: score,
            counts: {
                intersection: intersection.length,
                union: unionSize,
                focus: focusIds.length,
                learning: setB.length
            },
            // Optional: Liste gemeinsamer Skill-IDs (kann groß werden)
            commonSkillIds: intersection
        });
    }
    // absteigend nach Score
    out.sort((a, b) => b.jaccard - a.jaccard || a.name.localeCompare(b.name));
    return out;
}

// ---------------------------
// 4) Ausführen & Ausgabe
// ---------------------------
(async () => {
    try {
        // a) Focus laden
        const { focus, ids: focusIds } = await getFocusSkillIds(1096);

        // b) Lernressourcen (nur Learner/Education) auflisten
        const learnerList = await getLearnerOrEducationSkillsets(1);

        // c) Details (inkl. skills[]) für jede Lernressource holen
        const learnerDetails = await hydrateSkillsetDetails(learnerList, { concurrency: 8 });

        // d) Jaccard pro Lernressource berechnen
        const matches = computeMatches(focusIds, learnerDetails);

        // e) Ausgabe
        console.log(`Focus: ${focus.name} (UID ${focus.uid}) – ${focusIds.length} Skills`);
        console.log(`Verglichene Lernressourcen: ${matches.length}\n`);

        // Top 20 kompakt ausgeben
        const topN = 20;
        for (const [i, m] of matches.slice(0, topN).entries()) {
            const pct = (m.jaccard * 100).toFixed(2).padStart(6, " ");
            const inter = `${m.counts.intersection}/${m.counts.union}`;
            console.log(
                `${String(i + 1).padStart(2, " ")}. [${pct}%]  ${m.name}  (UID ${m.uid}, ${m.category})  ∩/∪=${inter}`
            );
        }

        // Falls du die komplette Liste brauchst:
        // await fs.promises.writeFile('skilldisplay_jaccard_results.json', JSON.stringify(matches, null, 2));

    } catch (err) {
        console.error("Fehler:", err);
        process.exitCode = 1;
    }
})();
