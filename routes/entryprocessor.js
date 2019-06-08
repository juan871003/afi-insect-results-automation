var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  const entryNr = req.query.entry;
  
  const puppeteer = require('puppeteer');
  // const env = process.env.USERNAME === "juan8" ? "dev" : "prod";
  /* (async () => {
    const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome-stable', headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    const page = await browser.newPage();
    await page.goto('https://www.example.com'); await page.screenshot({ path: 'screenshot.png', fullPage: true });
    browser.close();
  })(); */


  res.send({
    entryNr: entryNr,
    entryStatus: 'processing...'
  });
});

module.exports = router;
