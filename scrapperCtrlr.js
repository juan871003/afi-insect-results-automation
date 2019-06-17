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
    entries.set(entryNr, {status: 'Processing...', comments: ''});
  },

  getEntries() {
    return entries;
  },
}

async function checkEntriesResultsLoop() {
  if(!scrapping) {
    const entriesToScrapp = [...entries]
      .filter(keypair => keypair[1].status === 'Processing...')
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
    let results = {status: 'Processing...', comments: ''};
    const newPage = await getEntryPage(mainPage, entryNr);
    const status = await getEntryStatus(newPage);
    results = await getEntryResults(newPage, status);
    entries.set(entryNr, results);
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

async function getEntryStatus(newPage) {
  const statusXpath = '//td/b[text()="Status:"]/../following-sibling::td[1]';
  await newPage.waitForXPath(statusXpath);
  const statusHandle = await newPage.$x(statusXpath);
  const status = await newPage.evaluate(statusEl => statusEl.textContent, statusHandle[0]);
  await disposeHandle(statusHandle);
  return status;
}

async function getEntryResults(newPage, status) {
  await newPage.waitForXPath('//a[text()="Present all documentation"]');
  const pendingInsectsElHandle = await newPage.$x('//a[text()="Pending Insect ID"]');
  const pendingDiseaseElHandle = await newPage.$x('//a[text()="Pending Test Results"]');
  const fumigationElHandle = await newPage.$x('//a[text()="CH3Br 32gM3 2 hrs 21C or above"]');
  const theStatus = status === 'Finalised' ? 'Finalised' : 'Processing...';
  let comments = '';
  if (pendingInsectsElHandle.length >= 1) {
    comments = await getCommentsContent(newPage, pendingInsectsElHandle);
  }
  if (pendingDiseaseElHandle.length >= 1) {
    comments += '\n' + await getCommentsContent(newPage, pendingDiseaseElHandle);
  }
  if (fumigationElHandle.length >= 1) {
    comments += '\n' + await getCommentsContent(newPage, fumigationElHandle);
  }
  await disposeHandle(pendingInsectsElHandle);
  await disposeHandle(pendingDiseaseElHandle);
  await disposeHandle(fumigationElHandle);
  return { status: theStatus, comments: comments };
}

async function getCommentsContent(newPage, elHandle) {
  const sCommentsXpath = '//td/b[text()="Standard Comments:"]/../following-sibling::td[1]';
  const dCommentsXpath = '//td/b[text()="Direction Comments:"]/../following-sibling::td[1]';
  const targetCreatedPromise = new Promise(x =>
    newPage.browser().once('targetcreated', target => x(target.page())));
  // wait for targetcreated for 30 seconds, not forever.
  const thirdPagePromise =
    Promise.race([targetCreatedPromise, waitUntil(30)]);
  const linkEl = await elHandle[0];
  await linkEl.click();
  const thirdPage = await thirdPagePromise;
  await thirdPage.waitForXPath(sCommentsXpath);
  const sCommentsHandle = await thirdPage.$x(sCommentsXpath);
  const dCommentsHandle = await thirdPage.$x(dCommentsXpath);
  let comments = await thirdPage.evaluate(commentsEl => commentsEl.textContent, sCommentsHandle[0]);
  comments += '\n' + await thirdPage.evaluate(commentsEl => commentsEl.textContent, dCommentsHandle[0]);
  await disposeHandle(sCommentsHandle);
  await disposeHandle(dCommentsHandle);
  await thirdPage.close();
  return comments;
}

async function disposeHandle(handle) {
  if (handle) {
    for (let i = 0; i < handle.length; i++) {
      await handle[i].dispose();
    }
  }
}

async function waitUntil(seconds) {
  return new Promise((resolve, reject) => {
    const wait = setTimeout(() => {
      clearTimeout(wait);
      reject(new Error(`timeout reached, waiting for ${seconds} seconds`));
    }, seconds * 1000);
  });
}

module.exports = scrapperCtrl;
