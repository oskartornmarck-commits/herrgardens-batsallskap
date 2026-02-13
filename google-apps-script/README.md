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
