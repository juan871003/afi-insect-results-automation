const puppeteer = require('puppeteer');

let launchConfig = {headless: true};
let entries = new Map();
let initialised = false;
let scrapping = false;

const scrapperCtrl = {
  initialise: async function(env, intervalMinutes) {
    if (!initialised) {
      if (env !== 'dev') {
        launchConfig = { 
          executablePath: '/usr/bin/google-chrome-stable',
          headless: true, 
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process'],
        };
      }
      
      setInterval(checkEntriesResultsLoop, intervalMinutes * 60000);

      initialised = true;
      return true;
    }
    return false;
  },

  addEntry(entryNr) {
    entries.set(entryNr, 'Processing...')
  },

  getEntries() {
    return entries;
  },
}

async function checkEntriesResultsLoop() {
  if(!scrapping) {
    const entriesToScrapp = [...entries]
      .filter(keypair => keypair[1] === 'Processing...')
      .map(keypair => keypair[0]);
    if(entriesToScrapp.length > 0) {
      scrapping = true;
      await scrap(entriesToScrapp);
      scrapping = false;
    }
  }
}

async function scrap(entriesToScrapp) {
  browser = await puppeteer.launch(launchConfig);
  mainPage = await browser.newPage();
  await gotoMainPage(mainPage);
  for(const entryNr of entriesToScrapp) {
    const newPage = await getEntryPage(mainPage, entryNr);
    const status = await getEntryStatus(newPage);
    entries.set(entryNr, status);
    await newPage.close();
  }
  await mainPage.waitFor(1000);
  await browser.close();
}

async function gotoMainPage(page) {
  await page.goto('https://apps.daff.gov.au/BrokerReports/ASP/Login.asp');
  await page.click('#username');
  await page.keyboard.type('com043707');
  await page.click('#password');
  await page.keyboard.type('19rohini');
  await page.click('input[name="btnSubmit"]');
  await page.goto('https://apps.daff.gov.au/BrokerReports/asp/SingleEntry.asp');
}

async function getEntryPage(page, entryNr) {
  await page.waitForSelector('#txtEntry');
  await page.click('#txtEntry', {clickCount: 3});
  await page.keyboard.type(entryNr);
  // wait for target created for 30 seconds, not forever.
  const newPagePromise =
    Promise.race([
      new Promise(x => page.browser().once('targetcreated', target => x(target.page()))),
      waitUntil(30),
    ]);
  await page.click('input[name="btnSubmit"]');
  return await newPagePromise;
}

async function waitUntil(seconds) {
  return new Promise((resolve, reject) => {
    const wait = setTimeout(() => {
      clearTimeout(wait);
      reject(new Error(`timeout reached, waiting for ${seconds} seconds`));
    }, seconds * 1000);
  });
}

async function getEntryStatus(newPage) {
  const statusXpath = '//td/b[text()="Status:"]/../following-sibling::td[1]';
  await newPage.waitForXPath(statusXpath);
  const statusHandle = await newPage.$x(statusXpath);
  const status = await newPage.evaluate(statusEl => statusEl.textContent, statusHandle[0]);
  await disposeHandle(statusHandle);
  return status;
}

async function disposeHandle(handle) {
  if (handle) {
    for (let i = 0; i < handle.length; i++) {
      await handle[i].dispose();
    }
  }
}

module.exports = scrapperCtrl;
