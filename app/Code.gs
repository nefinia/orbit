// Orbit web app: private tracker backed by the "Orbit items" sheet.
const SHEET_ID = '11fsZIyb8NpZE5l3fz4hi0dlzI8ol2gS5CIjTTdsOgZM';
const COLS = ['id','title','kind','project','due','link','notes','status','calendar','created','updated'];
const TZ = 'Europe/Paris';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Orbit')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function sheet_() {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  sh.getRange('A:K').setNumberFormat('@'); // keep dates as plain text
  return sh;
}

function norm_(v, c) {
  if (v instanceof Date) {
    const hms = Utilities.formatDate(v, TZ, 'HH:mm:ss');
    return hms === '00:00:00' && c === 'due'
      ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd')
      : Utilities.formatDate(v, TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
  }
  if (c === 'calendar') return v === true || String(v).toUpperCase() === 'TRUE';
  if (c === 'due') return v === '' ? null : String(v);
  return v === null || v === undefined ? '' : String(v);
}

function listItems() {
  const values = sheet_().getDataRange().getValues();
  const head = values.shift();
  return values.filter(r => r[0] !== '').map(r => {
    const o = {};
    COLS.forEach(c => { const i = head.indexOf(c); o[c] = norm_(i >= 0 ? r[i] : '', c); });
    return o;
  });
}

function saveItem(item) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh = sheet_();
    const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => String(r[0]));
    const now = new Date().toISOString();
    if (!item.id) item.id = 'i-' + Utilities.getUuid().slice(0, 8);
    if (!item.created) item.created = now;
    item.updated = now;
    const row = COLS.map(c => c === 'calendar' ? (item.calendar ? 'TRUE' : 'FALSE') : (item[c] == null ? '' : String(item[c])));
    const at = ids.indexOf(item.id);
    if (at > 0) sh.getRange(at + 1, 1, 1, COLS.length).setValues([row]);
    else sh.appendRow(row);
    return item;
  } finally { lock.releaseLock(); }
}

function deleteItem(id) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sh = sheet_();
    const ids = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => String(r[0]));
    const at = ids.indexOf(id);
    if (at > 0) sh.deleteRow(at + 1);
    return true;
  } finally { lock.releaseLock(); }
}
