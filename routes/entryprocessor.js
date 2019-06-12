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

  let response = [];
  for (let [entryNr, status] of scrapper.getEntries()) {
    response.push({ entryNr: entryNr, status: status});
  }
  res.send(response);
});

module.exports = (scpr) => router.initialiseScrpr(scpr, 0.5);
