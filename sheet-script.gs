// Customer Saver → Google Sheet  (v2)
// Ye code Google Sheet ke Apps Script me paste karo (steps: SHEET.md)
// - Number sirf 10 digit (bina +91)
// - Ek number ki sirf ek row (duplicate kabhi nahi; purani +91 wali rows bhi merge ho jaati hain)
// - Naam sirf tab badalta hai jab asli naam aaye ("Customer 0007" jaisa naam sheet ke asli naam ko overwrite nahi karta)

var HEADER = ["Number", "Name", "Regular", "Total calls", "This month", "Last call", "Saved on", "Source", "Updated"];

function key(n) {                      // last 10 digits = row identity
  var d = String(n == null ? "" : n).replace(/\D/g, "");
  return d.length > 10 ? d.slice(-10) : d;
}

function isPlaceholder(name) {         // "Customer 0007", "Grahak 12", "0042"
  var s = String(name || "").replace("⭐", "").trim();
  return s === "" || /^\D*\d{1,6}$/.test(s);
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Customers") || ss.insertSheet("Customers");
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADER);
    sh.getRange(1, 1, 1, HEADER.length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  sh.getRange("A:A").setNumberFormat("@");   // keep numbers as text
  return sh;
}

// Reads all rows, merges duplicates (same last-10-digit number), rewrites numbers as 10 digits.
function loadAndDedupe(sh) {
  var last = sh.getLastRow();
  if (last < 2) return { rows: [], index: {} };
  var data = sh.getRange(2, 1, last - 1, HEADER.length).getValues();
  var rows = [], index = {}, changed = false;
  data.forEach(function (r) {
    var k = key(r[0]);
    if (!k) { changed = true; return; }
    if (index[k] !== undefined) {           // duplicate → merge into the first one
      var keep = rows[index[k]];
      if (isPlaceholder(keep[1]) && !isPlaceholder(r[1])) keep[1] = r[1];
      for (var i = 2; i < HEADER.length; i++) if (!keep[i] && r[i]) keep[i] = r[i];
      changed = true;
      return;
    }
    if (String(r[0]) !== k) { r[0] = k; changed = true; }
    index[k] = rows.length;
    rows.push(r);
  });
  if (changed) {
    sh.getRange(2, 1, last - 1, HEADER.length).clearContent();
    if (rows.length) sh.getRange(2, 1, rows.length, HEADER.length).setValues(rows);
  }
  return { rows: rows, index: index };
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = getSheet();
    var state = loadAndDedupe(sh);
    var rows = state.rows, index = state.index;
    var incoming = (JSON.parse(e.postData.contents).rows) || [];

    incoming.forEach(function (r) {
      var k = key(r.number);
      if (!k) return;
      var idx = index[k];
      if (r.event === "deleted") {
        if (idx !== undefined) { rows.splice(idx, 1); rebuild(); }
        return;
      }
      var values = [k, r.name, r.regular, r.totalCalls, r.thisMonth, r.lastCall, r.savedOn, r.source, r.time];
      if (idx !== undefined) {
        var cur = rows[idx];
        // Keep a real name already in the sheet unless the app now has a real name too.
        if (isPlaceholder(r.name) && !isPlaceholder(cur[1])) values[1] = cur[1];
        rows[idx] = values;
      } else {
        index[k] = rows.length;
        rows.push(values);
      }
    });

    function rebuild() { index = {}; rows.forEach(function (r, i) { index[key(r[0])] = i; }); }

    var last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, HEADER.length).clearContent();
    if (rows.length) sh.getRange(2, 1, rows.length, HEADER.length).setValues(rows);

    return ContentService.createTextOutput(JSON.stringify({ ok: true, count: incoming.length, total: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("Customer Saver sheet link kaam kar raha hai ✓ (v2)");
}
