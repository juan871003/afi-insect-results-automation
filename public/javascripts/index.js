const entryNrApp = (function() {

  const inputEntryNr = document.getElementById("input-entry-number");
  const btnEntryNr = document.getElementById("button-entry-number");
  const entryStatusTmpltId = 'entry-status-{entryNr}';
  const entryStatusInnerTmplt = 'Entry {entryNr} has status {entryStatus}';
  const entryStatusTmplt = '<div id="{entryStatusTmpltId}">{entryStatusInnerTmplt}</div>';

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
    const htmlEntryId = entryStatusTmpltId.replace('{entryNr}', response.entryNr);
    const existingEntryHtml = document.getElementById(htmlEntryId);
    const innerHTML = entryStatusInnerTmplt
      .replace('{entryNr}', response.entryNr)
      .replace('{entryStatus}', response.entryStatus);
    if (existingEntryHtml) {
      existingEntryHtml.innerHTML = innerHTML;
    } else {
      const finalHTML = entryStatusTmplt
        .replace('{entryStatusTmpltId}', htmlEntryId)
        .replace('{entryStatusInnerTmplt}', innerHTML);
      const container = document.getElementById('entries-status');
      container.insertAdjacentHTML('beforeend', finalHTML);
    }
    
    console.log(response);
  }

  function setupEventListeners() {
    btnEntryNr.addEventListener("click", () => {
      const entryNr = inputEntryNr.value;
      if (isValidEntry(entryNr)) {
        const xhttp = new XMLHttpRequest();
        xhttp.open('GET', `processentry?entry=${entryNr}`, true);
        xhttp.send();
        xhttp.onreadystatechange = function() {
          if(this.readyState == 4 && this.status == 200) {
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

  return {
    initialise: function() {
      clearInputs();
      setupEventListeners();
    }
  };
})();

entryNrApp.initialise();