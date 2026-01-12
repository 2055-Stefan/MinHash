// jaccard.js 

// Vorgegebene Logik (SkillSet + desired IDs)
function jaccardSkillset(skillset, desiredSkillIdsWithoutVerification) {
    if (skillset.skills === undefined) {
        return 0;
    }

    const setB = skillset.skills.map(skill => skill.uid);

    const intersectionSizeAB =
        desiredSkillIdsWithoutVerification.filter(value =>
            setB.includes(value)
        ).length;

    const unionSizeAB =
        new Set([...desiredSkillIdsWithoutVerification, ...setB]).size;

    return intersectionSizeAB / unionSizeAB;
}

// Adapter für measure.js (Array + Array)
export function jaccardSimilarity(arrA, arrB) {
    const fakeSkillset = {
        skills: arrB.map(uid => ({ uid }))
    };

    return jaccardSkillset(fakeSkillset, arrA);
}
