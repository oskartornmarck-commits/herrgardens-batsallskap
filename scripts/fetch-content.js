/**
 * Hämtar meny och sidinnehåll från Google Apps Script och sparar till content-cache.json.
 * Körs vid deploy (Netlify build) – sidan laddar sedan från cache, inte Google.
 *
 * Användning: node scripts/fetch-content.js
 * Eller: npm run build
 */

var fs = require("fs");
var path = require("path");
var https = require("https");
var http = require("http");

var API_URL = process.env.HBS_MENU_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxFNs3wFEeDgR6nWyNSJ8rsirYWy6YMbmBi7IdvlK73FC0zZ7Zo8K5tBEnehgTxLFby/exec";
var PAGES = ["index", "om", "medlemsinformation", "kontakt", "dokument"];

function fetchPage(pageId) {
  var targetUrl = API_URL + "?page=" + encodeURIComponent(pageId) + "&callback=__cache";
  return new Promise(function(resolve, reject) {
    function doRequest(src) {
      var client = src.indexOf("https") === 0 ? https : http;
      client.get(src, function(res) {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doRequest(res.headers.location);
        }
        var text = "";
        res.on("data", function(c) { text += c; });
        res.on("end", function() {
          var match = text.match(/__cache\s*\(\s*(\{[\s\S]*\})\s*\)/);
          if (!match) return reject(new Error("Ogiltigt svar: " + text.slice(0, 80)));
          try {
            resolve(JSON.parse(match[1]));
          } catch (e) {
            reject(e);
          }
        });
      }).on("error", reject);
    }
    doRequest(targetUrl);
  });
}

async function main() {
  console.log("Hämtar innehåll från Google Sheets...");
  const first = await fetchPage("index");
  const cache = {
    menu: first.menu || [],
    pages: { index: first.content || {} },
  };

  for (const pageId of PAGES) {
    if (pageId === "index") continue;
    try {
      const data = await fetchPage(pageId);
      cache.pages[pageId] = data.content || {};
    } catch (err) {
      console.warn("Varning:", pageId, err.message);
      cache.pages[pageId] = {};
    }
  }

  const outPath = path.join(__dirname, "..", "content-cache.json");
  fs.writeFileSync(outPath, JSON.stringify(cache, null, 2), "utf8");
  console.log("Skrev", outPath);
}

main().catch(function(err) {
  console.error(err);
  process.exit(1);
});
