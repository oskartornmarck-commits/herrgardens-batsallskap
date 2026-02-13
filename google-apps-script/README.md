# Dynamisk dokumentlista från Google Drive

Sidan **dokument.html** hämtar fillistan från en Google Apps Script-webbapp så att alla filer i mappen listas automatiskt.

## Steg 1: Skapa webbappen i Google

1. Öppna [script.google.com](https://script.google.com) och logga in med det Google-konto som **äger** (eller har redigeringsrätt till) Drive-mappen.
2. Klicka **Nytt projekt**.
3. Ersätt all kod i redigeraren med innehållet från **ListDriveFolder.gs** (i denna mapp). Spara med Ctrl+S.
4. I menyn: **Distribuera** → **Ny distribution**.
5. Vid **Välj typ**: klicka på kugghjulet och välj **Webbapp**.
6. Ställ in:
   - **Beskrivning**: t.ex. "HBS dokumentlista" (valfritt).
   - **Kör som**: **Jag** (din e-post).
   - **Åtkomst**: **Alla** – vem som helst som har länken kan anropa (sidan behöver bara läsa fillistan).
7. Klicka **Distribuera**. Godkänn behörigheter om Google frågar.
8. Kopiera **Webbapp-URL** (liknar `https://script.google.com/macros/s/.../exec`). Den ska **inte** sluta med `/dev` – använd den som visas efter "Distribuera".

## Steg 2: Koppla URL till webbplatsen

1. Öppna **dokument.html** i din redigerare.
2. Sök efter `DRIVE_LIST_SCRIPT_URL`.
3. Klistra in din Webbapp-URL mellan citattecknen, t.ex.  
   `var DRIVE_LIST_SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";`
4. Spara filen.

Därefter listas alla filer som läggs i Drive-mappen automatiskt på dokumentsidan. Mappens ägare behöver inte ändra något i koden när nya filer läggs till.

---

## Steg 2: Skapa webbapp för meny (Google Sheets som mini-CMS)

1. Skapa ett Google Sheet, t.ex. "HBS Webb Config".
2. Skapa en flik som heter **`Menu`**.
3. Rad 1 (rubriker):

   | label | href | order | visible |
   |-------|------|-------|---------|

4. Rader 2..n, t.ex.:

   | label              | href                   | order | visible |
   |--------------------|------------------------|-------|---------|
   | Start              | index.html             | 1     | TRUE    |
   | Om föreningen      | om.html                | 2     | TRUE    |
   | Medlemsinformation | medlemsinformation.html| 3     | TRUE    |
   | Dokument           | dokument.html          | 4     | TRUE    |
   | Kontakt            | kontakt.html           | 5     | TRUE    |

5. Hämta **kalkylarkets ID** från adressfältet i Google Sheets (mellan `/d/` och `/edit`).
6. Öppna **MenuFromSheet.gs** i denna mapp och klistra in ID:t i `SHEET_ID`.
7. Skapa ett nytt Apps Script-projekt via [script.google.com](https://script.google.com) och klistra in innehållet från **MenuFromSheet.gs**.
8. Kör funktionen `auktoriseraEnGang()` en gång (Välj funktion i menyn → Kör) för att ge scriptet läsbehörighet till arket.
9. Distribuera som **webbapp** på samma sätt som för dokument-listan:
   - Kör som: **Jag**
   - Åtkomst: **Alla**
10. Kopiera webbapp-URL:en (ser ut som `https://script.google.com/macros/s/.../exec`).

### Steg 3: Koppla meny-webbappen till webbplatsen

1. Öppna **`config.js`** och uppdatera `menuScriptUrl` med din webbapp-URL.
2. Detta används av både preload (snabb första laddning) och huvudlogiken i `script.js`.

Menyn och sidinnehållet hämtas nu från Google Sheets.

---

## Steg 4: Sidinnehåll (flik "Content")

Samma webbapp och URL hanterar även sidinnehåll. Skapa en flik **`Content`** i samma kalkylark:

1. Rad 1 (rubriker):

   | pageId | heroTitle | heroKicker | heroLead | bodyHtml |
   |--------|-----------|------------|----------|----------|

2. Rader 2..n – en rad per sida. `pageId` måste matcha filnamnet (utan .html):
   - `index` = index.html
   - `om` = om.html
   - `medlemsinformation` = medlemsinformation.html
   - `kontakt` = kontakt.html
   - `dokument` = dokument.html

3. **bodyHtml** kan innehålla enkel HTML: `<p>...</p>`, `<h2>...</h2>`, `<ul><li>...</li></ul>`, `<a href="...">...</a>`

Exempel på en rad för Om-sidan:

| pageId | heroTitle       | heroKicker | heroLead                         | bodyHtml |
|--------|-----------------|------------|----------------------------------|----------|
| om     | Om föreningen   | (tom)      | En ideell förening som verkar... | `<p>Herrgårdens Båtsällskap är...</p><h2>Styrelse</h2><ul><li>Ordförande – Erik</li>...</ul>` |

- **heroTitle**: rubrik i sidhuvudet
- **heroKicker**: liten text ovanför rubriken (valfritt, tom om inte används)
- **heroLead**: ingress under rubriken (valfritt)
- **bodyHtml**: huvudinnehållet (HTML)

Om en rad saknas för en sida används det statiska innehållet från HTML-filen.

---

## Content-cache (snabb laddning utan väntan på Google)

Sidan laddar först innehåll från **`content-cache.json`** (genereras vid deploy). Detta gör att besökare inte behöver vänta på Google API:t.

**För Netlify:** Byggkommandot `npm run build` körs automatiskt vid deploy och hämtar innehåll från Sheets till `content-cache.json`.

**Uppdatera efter ändringar i Sheets:** Gör en ny deploy (push till Git eller "Trigger deploy" i Netlify). Detta kör build-scriptet och hämtar nytt innehåll.

**Lokalt:** Kör `npm run fetch-content` när du vill uppdatera cachen innan du testar.

---

## Automatisk deploy vid redigering (för innehållsredaktörer)

Om den som uppdaterar Sheets inte kan deploya själv kan du aktivera automatisk deploy vid redigering:

1. **Skapa Build Hook i Netlify:** Site settings → Build & deploy → Build hooks → Add build hook. Namnge den (t.ex. "Sheet-ändring") och kopiera URL:en.

2. **Uppdatera MenuFromSheet.gs:** Sätt `NETLIFY_BUILD_HOOK_URL` till Build Hook-URL:en (inom citattecken).

3. **Lägg till trigger i Apps Script:** Klicka på klockikonen (Utlösare) → + Lägg till utlösare →
   - Välj händelse: **Vid redigering i kalkylark**
   - Välj funktion: **whenSheetEdited**
   - Spara

4. **Välj rätt kalkylark** när du lägger till trigger – det ska vara samma ark som har flikarna Menu och Content.

När någon redigerar Menu- eller Content-fliken startar en Netlify-deploy automatiskt. Ytterligare ändringar inom 2 minuter hoppas över (för att undvika många deploys).

---

## Viktigt: Uppdatera distributionen när du ändrat scriptet

**Ändringar i Sheets syns direkt**, men **ändringar i Apps Script-koden** kräver en ny distribution:

1. Öppna ditt Apps Script-projekt på [script.google.com](https://script.google.com).
2. Gå till **Distribuera** → **Hantera distributioner**.
3. Klicka på pennikonen (Redigera) vid din webbapp.
4. Under **Version** väljer du **Ny version** (inte "Head").
5. Klicka **Distribuera**.

Webbappen kommer nu att köra den senaste koden. URL:en ändras inte.
