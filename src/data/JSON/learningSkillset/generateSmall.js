import fs from 'fs';

const data = JSON.parse(
  fs.readFileSync('learningSkillsetIds.medium.json', 'utf-8')
);

const medium = data.learningSkillsetIds;

const targetSize = Math.floor(medium.length * 3 / 8); // = 229

const small = medium.slice(0, targetSize);

fs.writeFileSync(
  'learningSkillsetIds.small.json',
  JSON.stringify({ learningSkillsetIds: small }, null, 2),
  'utf-8'
);

console.log(`✅ SMALL erzeugt: ${small.length} IDs`);
