// Weihnachten weitererzählen (Annelie Hartwig) – lead collector for the bonus landing page.
// Paste this file as-is into Apps Script (no changes needed) and deploy it as a Web App.
// It writes to the "Lead" tab of your Google Sheet, creating the tab if it does not exist.
// One row per email AND book: the same person signing up again for the same book updates the row.

var SHARED_SECRET = "7QCmGoRkzL5PsntQ7LG8I0_bj0jasJZS";
var SHEET_ID = "1FzF4pa9ty86u3JR8L3sY2F62LrIMTeqp_tygKCPHyT8";
var TAB_NAME = "Lead";
var HEADERS = ["Data", "Nome", "Cognome", "Email", "Libro", "Ultimo accesso", "Accessi", "Lingua", "Consenso notizie"];

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  var ss;
  try { ss = SpreadsheetApp.openById(SHEET_ID); } catch (e) { ss = SpreadsheetApp.getActiveSpreadsheet(); }
  var sh = ss.getSheetByName(TAB_NAME);
  if (!sh) {
    sh = ss.insertSheet(TAB_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  } else {
    // tab created by the first version (7 columns): add the two new headings once
    var head = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    if (!head[7] || !head[8]) sh.getRange(1, 8, 1, 2).setValues([[HEADERS[7], HEADERS[8]]]);
  }
  return sh;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!data.secret || data.secret !== SHARED_SECRET) return json_({ ok: false, error: "unauthorized" });

    var email = String(data.email || "").trim().toLowerCase();
    var nome = String(data.nome || "").trim();
    var cognome = String(data.cognome || "").trim();
    var libro = String(data.libro || "");
    var lingua = String(data.lingua || "EN");
    var consenso = String(data.consenso || "");
    if (!email || !nome || !cognome) return json_({ ok: false, error: "missing fields" });

    lock.waitLock(10000);
    var sh = sheet_();
    var now = data.timestamp ? new Date(data.timestamp) : new Date();
    var last = sh.getLastRow();
    if (last > 1) {
      var rows = sh.getRange(2, 4, last - 1, 2).getValues(); // Email, Libro
      for (var i = 0; i < rows.length; i++) {
        var sameEmail = String(rows[i][0]).trim().toLowerCase() === email;
        var sameBook = String(rows[i][1]) === libro;
        if (sameEmail && sameBook) {
          var row = i + 2;
          var count = Number(sh.getRange(row, 7).getValue()) || 1;
          sh.getRange(row, 2, 1, 2).setValues([[nome, cognome]]);
          sh.getRange(row, 6, 1, 4).setValues([[now, count + 1, lingua, consenso]]);
          return json_({ ok: true, updated: true });
        }
      }
    }
    sh.appendRow([now, nome, cognome, email, libro, now, 1, lingua, consenso]);
    return json_({ ok: true, created: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function doGet() {
  return json_({ ok: true, info: "Lead collector is running. Use POST." });
}
