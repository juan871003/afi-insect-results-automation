const puppeteer = require('puppeteer');

let launchConfig = {headless: true};
let entries = new Map();
let initialised = false;
let scrapping = false;
let browser = null;
let mainPage = null;

const scrapperCtrl = {
  initialise: async function(env, intervalMinutes) {
    if (!initialised) {
      if (env === 'prod') {
        launchConfig = { 
          executablePath: '/usr/bin/google-chrome-stable',
          headless: true, 
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process'],
        };
      }
      browser = await puppeteer.launch(launchConfig);
      mainPage = await browser.newPage();
      
      // setInterval(checkEntriesResultsLoop, intervalMinutes * 60000);
      checkEntriesResultsLoop();

      initialised = true;
      return true;
    }
    return false;
  },

  addEntry(entryNr) {
    // entries.push(new Entry(entryNr, 'Pending...'));
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
  await sleep(1000);
  // TODO: don't modify entries, just return result.
  entriesToScrapp.forEach( entryNr => entries.set(entryNr, 'Test Done!'));

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}



module.exports = scrapperCtrl;
