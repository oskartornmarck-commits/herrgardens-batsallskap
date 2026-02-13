/**
 * Läser meny-poster från ett Google Sheet och returnerar JSON/JSONP.
 *
 * Sheet-struktur (flik "Menu"):
 *  Rad 1: rubriker  label | href | order | visible
 *  Rader 2..n:      t.ex. "Start" | "index.html" | 1 | TRUE
 *
 * Så här sätter du upp:
 * 1. Skapa ett Google Sheet och döp en flik till "Menu"
 * 2. Rad 1: label, href, order, visible
 * 3. Rader 2..n: dina menyrader
 * 4. Hämta kalkylarkets ID från URL:en (mellan /d/ och /edit)
 * 5. Klistra in ID:t i SHEET_ID nedan
 * 6. Distribuera som webbapp (Kör som: Jag, Åtkomst: Alla)
 * 7. Använd webbapp-URL:en i script.js (MENU_SCRIPT_URL)
 */

var SHEET_ID = 'BYT_UT_MOT_DITT_SHEET_ID';
var MENU_SHEET_NAME = 'Menu';
var DEBUG = true; // Sätt till false när allt fungerar

/**
 * Kör denna funktion EN GÅNG från Apps Script-redigeraren (välj i listrutan, klicka Kör)
 * för att ge skriptet behörighet till kalkylarket.
 */
function auktoriseraEnGang() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(MENU_SHEET_NAME);
  Logger.log('OK: Läsbehörighet finns. Flik: ' + (sheet ? sheet.getName() : 'saknas'));
}

function doGet(e) {
  var callback = e && e.parameter && e.parameter.callback;
  var items = [];

  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(MENU_SHEET_NAME);

    if (!sheet) {
      throw new Error('Fliken "' + MENU_SHEET_NAME + '" saknas i kalkylarket');
    }

    var values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      if (DEBUG) {
        items.push({ label: 'DEBUG: Endast rubrikrad hittad, lägg till minst en datarad', href: '#' });
      }
    } else {
      var headers = values[0].map(function(h) {
        return String(h || '').trim().toLowerCase();
      });

      var labelIdx = headers.indexOf('label');
      var hrefIdx = headers.indexOf('href');
      var orderIdx = headers.indexOf('order');
      var visibleIdx = headers.indexOf('visible');

      if (labelIdx === -1 || hrefIdx === -1) {
        throw new Error('Rubrikraden måste innehålla kolumner "label" och "href"');
      }

      for (var i = 1; i < values.length; i++) {
        var row = values[i];
        var labelVal = row[labelIdx];
        var hrefVal = row[hrefIdx];

        if (!labelVal || !hrefVal) continue;

        var visible = true;
        if (visibleIdx !== -1) {
          var v = row[visibleIdx];
          visible = v === true || v === 'TRUE' || v === 'true' || String(v).toUpperCase() === 'TRUE' || v === 1;
        }
        if (!visible) continue;

        var order = orderIdx !== -1 ? Number(row[orderIdx]) || 0 : i;

        items.push({
          label: String(labelVal).trim(),
          href: String(hrefVal).trim(),
          order: order
        });
      }

      items.sort(function(a, b) {
        if (a.order !== b.order) return a.order - b.order;
        return a.label.localeCompare(b.label, 'sv');
      });
    }
  } catch (err) {
    if (DEBUG) {
      items.push({ label: 'DEBUG: ' + err.message, href: '#' });
    }
  }

  var body = JSON.stringify(items);

  if (callback) {
    body = callback + '(' + body + ')';
    return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
