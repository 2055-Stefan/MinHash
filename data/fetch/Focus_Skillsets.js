const fs = require("fs");
const path = require("path");

// Ziel-Datei (mit Fallback, falls ohne fetchAll ausgeführt)
const baseDir = process.env.OUTPUT_DIR || path.join(__dirname, "..", "results", "raw");
const outputPath = path.join(baseDir, "Focus_skillset.json");

const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("x-api-key", "");
myHeaders.append("Cookie", "-Cookie-");

const requestOptions = { method: "GET", headers: myHeaders, redirect: "follow" };

fetch("https://www.skilldisplay.eu/api/v1/skillset/1096", requestOptions)
  .then((response) => response.text())
  .then((result) => {
    fs.mkdirSync(baseDir, { recursive: true });
    fs.writeFileSync(outputPath, result);
    console.log("✅ Focus Skillset gespeichert:", outputPath);
  })
  .catch((error) => console.error("❌ Focus Skillset Fehler:", error));
