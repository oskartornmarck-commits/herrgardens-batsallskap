/**
 * Listar alla filer i en Google Drive-mapp och returnerar JSON.
 * Används av dokument.html för att visa en dynamisk fillista.
 *
 * SÅ Här sätter du upp:
 * 1. Gå till https://script.google.com
 * 2. Nytt projekt → klistra in koden nedan (ersätt FOLDER_ID om du vill använda en annan mapp).
 * 3. Spara (Ctrl+S). Ge projektet ett namn t.ex. "HBS Dokumentlista".
 * 4. Meny: Distribuera → Ny distribution.
 * 5. Typ: Webbapp. Beskrivning: valfritt.
 *    Kör som: Jag (din e-post).
 *    Åtkomst: Alla (vem som helst som har länken).
 * 6. Klicka Distribuera. Godkänn behörigheter om du blir tillfrågad.
 * 7. Kopiera "Webbapp-URL" (ser ut ungefär som https://script.google.com/macros/s/XXXX/exec).
 * 8. Klistra in den URL:en i dokument.html i variabeln DRIVE_LIST_SCRIPT_URL.
 */

var FOLDER_ID = '1CvLkxQ2u9AZbajQIQIod2r9yh_TV1QXv';

function doGet(e) {
  var callback = e && e.parameter && e.parameter.callback;
  var result = [];
  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      result.push({
        name: file.getName(),
        url: 'https://drive.google.com/file/d/' + file.getId() + '/view'
      });
    }
    result.sort(function(a, b) { return a.name.localeCompare(b.name, 'sv'); });
  } catch (err) {
    result = []; // Vid fel (t.ex. ogiltigt mapp-ID) returnera tom array
  }
  var body = JSON.stringify(result);
  if (callback) {
    body = callback + '(' + body + ')';
    return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
