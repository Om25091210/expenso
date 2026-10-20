/**
 * Money Plan sync backend. Paste into a Google Sheet's Apps Script (Extensions > Apps Script).
 * Keeps the whole app state as one JSON document in the "data" sheet:
 *   A1 = revision number, B1 = last saved time, A2..An = the JSON split into 45,000-character chunks
 * Protocol (POST, JSON body as text/plain so browsers skip the CORS preflight):
 *   { op:"get", key }                    -> { status:200, rev, updatedAt, data }   (rev 0 / data null when empty)
 *   { op:"put", key, baseRev, data }     -> { status:200, rev, updatedAt }         saved
 *                                           { status:409, rev, updatedAt, data }   someone saved since baseRev
 * Apps Script cannot set HTTP status codes, so "status" lives in the body.
 * Access control is optional: if Project Settings > Script properties has SYNC_PASSPHRASE, every request must
 * carry it. If that property does not exist, the endpoint is open to anyone who has the web app URL.
 */
var SHEET_NAME = 'data';
var CHUNK = 45000;          // Sheets caps a cell at 50,000 characters
var MAX_CHARS = 900000;

function doGet() {
  return ContentService.createTextOutput('Money Plan sync is running.');
}

function doPost(e) {
  var out;
  try {
    out = handle_(JSON.parse(e.postData.contents));
  } catch (err) {
    out = { status: 400, error: 'bad_request' };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function hash_(s) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s)));
}

function sheet_() {
  var ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function read_(sh) {
  var rev = Number(sh.getRange('A1').getValue()) || 0;
  var rows = sh.getLastRow();
  if (!rev || rows < 2) return { rev: 0, updatedAt: null, data: null };
  var json = sh.getRange(2, 1, rows - 1, 1).getValues().map(function (r) { return r[0]; }).join('');
  return { rev: rev, updatedAt: String(sh.getRange('B1').getValue()) || null, data: JSON.parse(json) };
}

function handle_(req) {
  var pass = PropertiesService.getScriptProperties().getProperty('SYNC_PASSPHRASE');
  if (pass && hash_(req.key || '') !== hash_(pass)) {
    Utilities.sleep(500);   // slow down guessing
    return { status: 401, error: 'bad_key' };
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var sh = sheet_();
    var cur = read_(sh);

    if (req.op === 'get') return { status: 200, rev: cur.rev, updatedAt: cur.updatedAt, data: cur.data };

    if (req.op === 'put') {
      if (typeof req.baseRev !== 'number' || req.baseRev % 1 !== 0 || req.baseRev < 0 ||
          !req.data || typeof req.data !== 'object' || !Array.isArray(req.data.accounts)) {
        return { status: 400, error: 'bad_body' };
      }
      if (cur.rev !== req.baseRev) return { status: 409, rev: cur.rev, updatedAt: cur.updatedAt, data: cur.data };

      var json = JSON.stringify(req.data);
      if (json.length > MAX_CHARS) return { status: 413, error: 'too_large' };

      var chunks = [];
      for (var i = 0; i < json.length; i += CHUNK) chunks.push([json.slice(i, i + CHUNK)]);
      var needRows = chunks.length + 1;
      var oldRows = sh.getLastRow();

      if (sh.getMaxRows() < needRows) sh.insertRowsAfter(sh.getMaxRows(), needRows - sh.getMaxRows());
      sh.getRange(1, 1, needRows, 2).setNumberFormat('@');          // plain text, so a chunk starting with "=" isn't a formula
      sh.getRange(2, 1, chunks.length, 1).setValues(chunks);
      if (oldRows > needRows) sh.getRange(needRows + 1, 1, oldRows - needRows, 2).clearContent();

      var rev = cur.rev + 1, at = new Date().toISOString();
      sh.getRange('A1:B1').setValues([[String(rev), at]]);           // written last: the commit marker
      SpreadsheetApp.flush();
      return { status: 200, rev: rev, updatedAt: at };
    }
    return { status: 400, error: 'bad_op' };
  } finally {
    lock.releaseLock();
  }
}
