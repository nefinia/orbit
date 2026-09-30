# Orbit app (Google Apps Script)

Private web app for Sofia's tracker. The data lives in a private Google Sheet ("Orbit items") in her Drive; this folder holds only the code.

- `Code.gs`: server side, reads and writes the sheet (`listItems`, `saveItem`, `deleteItem`)
- `Index.html`: the interactive page (countdown, filters, add/edit, tick off)

Sheet columns: id, title, kind (deadline|event|waiting|task|idea), project, due (YYYY-MM-DD or ISO datetime with offset), link, notes, status (open|done), calendar (TRUE/FALSE), created, updated.
