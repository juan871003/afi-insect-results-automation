const entryNrApp = (function () {

  const inputEntryNr = document.getElementById("input-entry-number");
  const btnEntryNr = document.getElementById("button-entry-number");
  const entryStatusTmpltId = 'entry-status-{entryNr}';
  const rmEntryBtnTmpltId = 'button-remove-{entryNr}';
  const entryStatusInnerTmplt =
    `
  <div class="card-header text-center"><h2>{entryNr}</h2></div>
  <div class="card-body">
    <h4 class="card-title">Status: {entryStatus}</h4>
    <p class="card-text">
      <strong>Comments:</strong>
      {entryComments}
    </p>
    <div class="text-right">
      <input type="button" id="{rmEntryBtnTmpltId}" class="btn btn-danger" value="Remove" />
    </div>
  </div>
  `;
  const entryStatusTmplt =
    `
  <div id="{entryStatusTmpltId}" class="col-lg-12 card m-2 custom-card">
    {entryStatusInnerTmplt}
  </div>
  `;

  function clearInputs() {
    inputEntryNr.value = "";
    btnEntryNr.disabled = true;
  }

  function isValidEntry(entry) {
    return (
      entry
      && entry.length > 0
      && entry.length < 15
      && entry.match(/^[0-9a-zA-Z]+$/)
    )
  }

  function updateUIEntry(response) {
    document.getElementById('entries-results').innerHTML = '';
    const entries = response;
    for (let entry of entries) {
      const htmlEntryId = entryStatusTmpltId.replace('{entryNr}', entry.entryNr);
      const rmvButtonId = rmEntryBtnTmpltId.replace('{entryNr}', entry.entryNr);
      const innerHTML = entryStatusInnerTmplt
        .replace(/{entryNr}/g, entry.entryNr)
        .replace('{entryStatus}', entry.results.status)
        .replace('{entryComments}', entry.results.comments.length > 0 ?
          entry.results.comments.replace(/\n/g, '<br />')
          : 'None')
        .replace('{rmEntryBtnTmpltId}', rmvButtonId);
      const finalHTML = entryStatusTmplt
        .replace('{entryStatusTmpltId}', htmlEntryId)
        .replace('{entryStatusInnerTmplt}', innerHTML);
      const container = document.getElementById('entries-results');
      container.insertAdjacentHTML('beforeend', finalHTML);
      document
        .getElementById(rmvButtonId)
        .addEventListener('click', () => removeEntry(entry.entryNr));
    }
  }

  function setupEventListeners() {
    btnEntryNr.addEventListener("click", () => {
      const entryNr = inputEntryNr.value;
      if (isValidEntry(entryNr)) {
        const xhttp = new XMLHttpRequest();
        xhttp.open('GET', `processentry?entry=${entryNr}`, true);
        xhttp.send();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            updateUIEntry(JSON.parse(this.response));
            clearInputs();
          }
        };
      }
    });

    inputEntryNr.addEventListener("keyup", () => {
      const userInput = inputEntryNr.value;
      btnEntryNr.disabled = !(userInput && userInput.length > 0);
    });
  }

  function getResults() {
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', `processentry`, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        updateUIEntry(JSON.parse(this.response));
      }
    };
  }

  function removeEntry(entryNr) {
    const btnId = rmEntryBtnTmpltId.replace('{entryNr}', entryNr);
    document.getElementById(btnId).value = 'Removing...';
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', `processentry?removeentry=${entryNr}`, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        updateUIEntry(JSON.parse(this.response));
      }
    };
  }

  return {
    initialise: function () {
      clearInputs();
      setupEventListeners();
      getResults();
    }
  };
})();

entryNrApp.initialise();