const BASE = "https://www.skilldisplay.eu/api/v1";
async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
}

async function main() {
    console.log("== SkillDisplay Array-Konvertierung mit Zeitmessung ==\n");

    console.time("Focus SkillSet: JSON → Array");
    const focus = await fetchJson(`${BASE}/skillset/1096`);
    const focusIds = focus.skills.map(s => s.uid);
    console.timeEnd("Focus SkillSet: JSON → Array");

    console.time("Lernressource: JSON → Array");
    const learner = await fetchJson(`${BASE}/skillset/2849`);
    const setB = learner.skills.map(s => s.uid);
    console.timeEnd("Lernressource: JSON → Array");

}

main().catch(err => console.error("Fehler:", err.message));
