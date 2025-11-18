const BASE = "https://www.skilldisplay.eu/api/v1";

async function fetchJson(url) {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
}

// --- Exportierte Arrays ---
export let focusIds = [];
export let learningSkillsetIds = [];

export async function loadFocusAndLearningIds() {
    // 1) Focus SkillSet laden
    const focus = await fetchJson(`${BASE}/skillset/1096`);
    focusIds = focus.skills.map(s => s.uid);

    // 2) Organisation laden und Learning SkillSets filtern
    const org = await fetchJson(`${BASE}/organisation/1`);
    learningSkillsetIds = (org.skillSets ?? [])
        .filter(ss =>
            ss.firstCategoryTitle === "Learner" ||
            ss.firstCategoryTitle === "Education"
        )
        .map(ss => ss.uid);

    // --- Ausgabe in der Konsole ---
    console.log("=== Focus Skill IDs ===");
    console.log(focusIds);
    console.log(`Anzahl: ${focusIds.length}\n`);

    console.log("=== Learning SkillSet IDs ===");
    console.log(learningSkillsetIds);
    console.log(`Anzahl: ${learningSkillsetIds.length}\n`);

    return { focusIds, learningSkillsetIds };
}

loadFocusAndLearningIds();
