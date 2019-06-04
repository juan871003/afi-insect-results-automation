var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  const entryNr = req.query.entry;
  res.send({
    entryNr: entryNr,
    entryStatus: 'processing'
  });
});

module.exports = router;
