import { writeFile } from 'node:fs/promises';
import {
    loadFocusAndLearningIds,
    focusIds,
    learningSkillsetIds
} from './JSON_Array_Converter.js';

await loadFocusAndLearningIds();

// JSON-Inhalt erzeugen
const jsonData = {
    focusIds
};

// Datei speichern
await writeFile(
    './focusWriting.json',
    JSON.stringify(jsonData, null, 2),   // pretty print
    'utf-8'
);

