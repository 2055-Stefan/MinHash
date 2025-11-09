const fs = require("fs");
const path = require("path");

const baseDir = process.env.OUTPUT_DIR || path.join(__dirname, "..", "results", "raw");
const outputPath = path.join(baseDir, "Verifications.json");

const myHeaders = new Headers();
myHeaders.append("Accept", "application/json");
myHeaders.append("Cookie", "-Cookie-");

const requestOptions = { method: "GET", headers: myHeaders, redirect: "follow" };

fetch("https://www.skilldisplay.eu/api/v1/verification/history", requestOptions)
  .then((response) => response.text())
  .then((result) => {
    fs.mkdirSync(baseDir, { recursive: true });
    fs.writeFileSync(outputPath, result);
    console.log("✅ Verifications gespeichert:", outputPath);
  })
  .catch((error) => console.error("❌ Verifications Fehler:", error));
