const fs = require("fs");
const path = require("path");

const baseDir = process.env.OUTPUT_DIR || path.join(__dirname, "..", "results", "raw");
const outputPath = path.join(baseDir, "Learning_skillset.json");

const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("x-api-key", "");
myHeaders.append("Cookie", "sd_user_www=..."); // ⚠️ keine Secrets committen

const requestOptions = { method: "GET", headers: myHeaders, redirect: "follow" };

fetch("https://www.skilldisplay.eu/api/v1/organisation/1", requestOptions)
  .then((response) => response.text())
  .then((result) => {
    fs.mkdirSync(baseDir, { recursive: true });
    fs.writeFileSync(outputPath, result);
    console.log("✅ Learning Skillset gespeichert:", outputPath);
  })
  .catch((error) => console.error("❌ Learning Skillset Fehler:", error));
