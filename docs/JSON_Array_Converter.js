const BASE = "https://www.skilldisplay.eu/api/v1";

async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
}

async function main() {
    // 1️ Focus SkillSet laden
    const focus = await fetchJson(`${BASE}/skillset/1096`);
    const focusIds = focus.skills.map(s => s.uid);

    console.log("=== Focus SkillSet (CMS Certified Developer 13) ===");
    console.log("focusIds =", focusIds);
    console.log(`Anzahl: ${focusIds.length}\n`);

    // 2 Beispielhafte Lernressource laden (z. B. UID 2849)
    const learner = await fetchJson(`${BASE}/skillset/2849`);
    const setB = learner.skills.map(s => s.uid);

    console.log("=== Beispiel Lernressource ===");
    console.log(`Name: ${learner.name}`);
    console.log(`UID: ${learner.uid}`);
    console.log("setB =", setB);
    console.log(`Anzahl: ${setB.length}\n`);

    console.log("Beispiel: jaccard(focusIds, setB)");
}

main().catch(err => console.error("Fehler:", err.message));
