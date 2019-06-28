const express = require('express');
const path = require('path');

const app = express();
const scrapper = require('./scrapperCtrlr');
const minutesLoop = app.get('env') === 'development' ? 0.5 : 5;

scrapper.initialise(app.get('env'), minutesLoop);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/processentry', function (req, res, next) {
  if (req.query.entry) {
    const entryNr = req.query.entry.toUpperCase();
    if (isValidEntryNr(entryNr)) {
      scrapper.addEntry(entryNr);
    }
  }

  if (req.query.removeentry) {
    const entryNr = req.query.removeentry.toUpperCase();
    if(isValidEntryNr(entryNr)) {
      scrapper.removeEntry(entryNr);
    }
  }

  let response = [];
  for (let [entryNr, results] of scrapper.getEntries()) {
    response.push({ entryNr: entryNr, results: {status: results.status, comments: results.comments }});
  }
  res.send(response);
});

function isValidEntryNr(entryNr) {
  return (
    entryNr.length > 0
    && entryNr.length <= 15
    && entryNr.match(/^[a-z0-9]+$/i)
  )
}

module.exports = app;
