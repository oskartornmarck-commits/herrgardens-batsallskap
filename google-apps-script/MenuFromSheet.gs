/**
 * Läser meny OCH sidinnehåll från Google Sheets.
 *
 * Flik "Menu":     label | href | order | visible
 * Flik "Content":  pageId | heroTitle | heroKicker | heroLead | bodyHtml
 *
 * Anrop:
 *   ?page=om&callback=fn  → { menu: [...], content: {...} } (EN request, bäst för prestanda)
 *   ?type=content&page=om&callback=fn → endast content (objekt)
 *   ?callback=fn         → endast meny (array)
 */

var SHEET_ID = 'BYT_UT_MOT_DITT_SHEET_ID';
var MENU_SHEET_NAME = 'Menu';
var CONTENT_SHEET_NAME = 'Content';
var DEBUG = false; // Sätt till true vid felsökning

// Netlify Build Hook – anropas vid redigering så att innehåll publiceras automatiskt.
// Hämta URL från Netlify: Site settings → Build & deploy → Build hooks → Add build hook
var NETLIFY_BUILD_HOOK_URL = '';

function auktoriseraEnGang() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(MENU_SHEET_NAME);
  Logger.log('OK: Läsbehörighet finns. Flik: ' + (sheet ? sheet.getName() : 'saknas'));
}

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var callback = params.callback;
  var type = String(params.type || '').toLowerCase();
  var page = String(params.page || '').trim();

  if (type === 'content' && page) {
    return serveContent(page, callback);
  }

  if (page && callback) {
    return serveCombined(page, callback);
  }

  return serveMenu(callback);
}

function serveCombined(pageId, callback) {
  var menuItems = getMenuItems();
  var contentData = getContentForPage(pageId);
  var result = { menu: menuItems, content: contentData };
  return output(result, callback);
}

function getMenuItems() {
  var items = [];
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(MENU_SHEET_NAME);
    if (!sheet) return items;
    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) return items;
    var headers = values[0].map(function(h) { return String(h || '').trim().toLowerCase(); });
    var labelIdx = headers.indexOf('label');
    var hrefIdx = headers.indexOf('href');
    var orderIdx = headers.indexOf('order');
    var visibleIdx = headers.indexOf('visible');
    if (labelIdx === -1 || hrefIdx === -1) return items;
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
      items.push({ label: String(labelVal).trim(), href: String(hrefVal).trim(), order: order });
    }
    items.sort(function(a, b) {
      if (a.order !== b.order) return a.order - b.order;
      return a.label.localeCompare(b.label, 'sv');
    });
  } catch (err) {}
  return items;
}

function getContentForPage(pageId) {
  var result = {};
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(CONTENT_SHEET_NAME);
    if (!sheet) return result;
    var values = sheet.getDataRange().getValues();
    if (values.length <= 1) return result;
    var headers = values[0].map(function(h) { return String(h || '').trim().toLowerCase().replace(/\s+/g, ''); });
    var pageIdIdx = headers.indexOf('pageid');
    if (pageIdIdx === -1) return result;
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (String(row[pageIdIdx] || '').trim().toLowerCase() !== pageId.toLowerCase()) continue;
      for (var c = 0; c < headers.length; c++) {
        var key = headers[c];
        if (key && key !== 'pageid') result[key] = row[c] != null ? String(row[c]) : '';
      }
      break;
    }
  } catch (err) {}
  return result;
}

function serveContent(pageId, callback) {
  var result = getContentForPage(pageId);
  if (DEBUG && Object.keys(result).length === 0) result.debug = 'Ingen träff för pageId: ' + pageId;
  return output(result, callback);
}

function output(obj, callback) {
  var body = JSON.stringify(obj);
  if (callback) {
    body = callback + '(' + body + ')';
    return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function serveMenu(callback) {
  var items = getMenuItems();
  if (items.length === 0 && DEBUG) {
    items.push({ label: 'DEBUG: Endast rubrikrad eller fel', href: '#' });
  }
  return output(items, callback);
}

/**
 * Anropas när arket redigeras (installerbar trigger). Startar Netlify-deploy så att
 * innehållsredaktören får ändringarna ut utan att behöva deploya manuellt.
 *
 * Inställning: Triggers (klockikonen) → + Lägg till trigger →
 *   Händelse: Vid redigering i kalkylark
 *   Funktionsväljare: whenSheetEdited
 */
function whenSheetEdited(e) {
  if (!NETLIFY_BUILD_HOOK_URL) return;
  try {
    var sheet = e.range.getSheet();
    var name = sheet.getName();
    if (name !== MENU_SHEET_NAME && name !== CONTENT_SHEET_NAME) return;
    var props = PropertiesService.getScriptProperties();
    var last = Number(props.getProperty('lastDeployTrigger') || 0);
    if (Date.now() - last < 120000) return;
    props.setProperty('lastDeployTrigger', String(Date.now()));
    UrlFetchApp.fetch(NETLIFY_BUILD_HOOK_URL, { method: 'post' });
  } catch (err) {}
}
