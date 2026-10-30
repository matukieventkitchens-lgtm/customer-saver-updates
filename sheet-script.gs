// Customer Saver → Google Sheet
// Ye code Google Sheet ke Apps Script me paste karo (steps: SHEET.md)

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Customers") || ss.insertSheet("Customers");
  var header = ["Number", "Name", "Regular", "Total calls", "This month", "Last call", "Saved on", "Source", "Updated"];
  if (sh.getLastRow() === 0) {
    sh.appendRow(header);
    sh.getRange(1, 1, 1, header.length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }

  var data = JSON.parse(e.postData.contents);
  var rows = data.rows || [];
  var last = sh.getLastRow();
  var numbers = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];

  rows.forEach(function (r) {
    var idx = numbers.indexOf(String(r.number));
    if (r.event === "deleted") {
      if (idx >= 0) { sh.deleteRow(idx + 2); numbers.splice(idx, 1); }
      return;
    }
    var values = [r.number, r.name, r.regular, r.totalCalls, r.thisMonth, r.lastCall, r.savedOn, r.source, r.time];
    if (idx >= 0) {
      sh.getRange(idx + 2, 1, 1, values.length).setValues([values]);
    } else {
      sh.appendRow(values);
      numbers.push(String(r.number));
    }
  });

  return ContentService.createTextOutput(JSON.stringify({ ok: true, count: rows.length }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput("Customer Saver sheet link kaam kar raha hai ✓");
}
