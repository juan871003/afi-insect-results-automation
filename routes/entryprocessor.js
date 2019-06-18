var express = require('express');
var router = express.Router();
var scrapper = null;

router.initialiseScrpr = function(scpr) {
  scrapper = scpr;
  return router;
}

router.get('/', function (req, res, next) {
  if (req.query.entry) {
    const entryNr = req.query.entry;
    scrapper.addEntry(entryNr);
  }

  if (req.query.removeentry) {
    const entryNr = req.query.removeentry;
    scrapper.removeEntry(entryNr);
  }

  let response = [];
  for (let [entryNr, results] of scrapper.getEntries()) {
    response.push({ entryNr: entryNr, results: {status: results.status, comments: results.comments }});
  }
  res.send(response);
});

module.exports = (scpr) => router.initialiseScrpr(scpr);
