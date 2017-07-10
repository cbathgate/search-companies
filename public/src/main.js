(function() {

  const baseEndpoint = 'http://localhost:3000/api/companies';

  // currentStart will update as user scrolls page
  let currentStart = 0;
  // amount of results per query
  let currentLimit = 20;
  // additional queries will not appear with scroll unless results already on screen
  let resultsOnScreen = false;
  // set to true after first scroll to bottom, resets when new query is set
  let scrolling = false;
  // if current query is the same as the entered value, results will not clear on screen
  let currentQuery = null;
  // keep track of results total, know when to stop queries to api
  let total = null;
  // keeps track of what's checked
  let laborPreference = new Set();

  /******************************/
  /******* API FUNCTIONS ********/
  /******************************/
  
  // construct url based on whether user has preferences on labor, returns url
  function constructUrl() {
    if (laborPreference.size) {
      let labor = ([...laborPreference]).join(',');
      return `${baseEndpoint}?q=${currentQuery}&start=${currentStart}&limit=${currentLimit}&laborTypes=${labor}`;
    }
    // when no preferences (none box is checked)
    return `${baseEndpoint}?q=${currentQuery}&start=${currentStart}&limit=${currentLimit}`;
  }

  function clearQuery() {
    currentQuery = null;
  }

  function setQuery() {
    if (this.value === '' || this.value === ' ') {
      reset();
      clearQuery();
    } else {
      // if entered value is the same as current query, results don't change on screen
      if (currentQuery !== this.value) {
        clearQuery();
        reset();
        currentQuery = this.value;
        getData();
      }
    }
  }

  function getData() {
    let url = constructUrl();
    fetch(url)
    .then(result => result.json())
    .then((data) => {
      total = data.total;
      makeResults(data.results);
    });
  }

  /******************************/
  /******* LABOR FILTERS ********/
  /******************************/

  // handles checking/unchecking new labor preference
  function changeLaborPreference() {
    this.checked ? laborPreference.add(this.value): laborPreference.delete(this.value);
    laborPreference.size ? noneBox.checked = false: noneBox.checked = true;
    reset();
    if (currentQuery !== null) {
      getData();
    }
  }

  // all other labor options are unchecked when none is checked
  function unCheckOtherBoxes() {
    checkBoxes.forEach((check) => {
      check.checked = false;
    })
    laborPreference = new Set();
    reset();
    if (currentQuery !== null) {
      getData();
    }
  }

  /******************************************/
  /******* CREATE AND EDIT DOM NODES ********/
  /******************************************/

  function makeNode(text, node) {
    let h1 = document.createElement(node);
    let innerText = document.createTextNode(text);
    h1.appendChild(innerText);
    return h1
  }

  function makeImageNode(src, alt) {
    let image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    return image;
  }

  function appendChildren(node, elements) {
    elements.forEach((elem) => {
      node.appendChild(elem);
    })
  }

  function createClassContainer(node, className) {
    let container = document.createElement(node);
    container.classList.add(className);
    return container;
  }

  /**********************/
  /******* MODAL ********/
  /**********************/

  function makeModal(company) {

    // child node storage
    let infoElements = [];
    let boxElements = [];
    let modalElements = [];

    // box ---> modalElements
    let box = createClassContainer('div', 'modal-main');
    modalElements.push(box);

    // close button ---> modalElements
    let close = makeNode('×', 'div');
    close.addEventListener('click', clearModal);
    close.classList.add('modal-button');
    modalElements.push(close);

    // darkened background ---> modalElements
    let background = createClassContainer('div', 'modal-background');
    modalElements.push(background);
    
    // image container ---> boxElements
    let imageContainer = createClassContainer('div', 'modal-image');
    boxElements.push(imageContainer);

    // create image node, append to image container
    let image = makeImageNode(company.avatarUrl, `${company.name} logo`);
    imageContainer.appendChild(image);

    // modal info ---> boxElements
    let infoContainer = createClassContainer('div', 'modal-info');
    boxElements.push(infoContainer);

    // company info ---> infoElements
    infoElements.push(makeNode(company.name, 'h1'));
    infoElements.push(makeNode(company.phone, 'h2'));
    let url = makeNode(company.website, 'a');
    url.href = company.website;
    infoElements.push(url);

    // labor list ---> infoElements
    infoElements.push(makeNode('Labor Types:', 'h2'));
    let laborList = document.createElement('ul');
    company.laborType.forEach((labor) => {
      let laborNode = makeNode(labor, 'li');
      laborList.appendChild(laborNode);
    })
    infoElements.push(laborList);


    // append children to respective containers
    appendChildren(infoContainer, infoElements);
    appendChildren(box, boxElements);  
    appendChildren(modal, modalElements);
  }

  /************************/
  /******* RESULTS ********/
  /************************/

  // individual result
  function makeResult(company) {
    let result = makeNode(company.name, 'li');
    result.data = company;
    result.addEventListener('click', function() { makeModal(this.data) });
    results.appendChild(result);
  }

  // append all results from data to DOM
  function makeResults(names) {

    if (!scrolling) {
      results.innerHTML = '';
    }

    // no spinner needed for first set of results
    if (currentStart > 0) {
      deleteSpinner();
    }

    // no results for a given search
    if (total === 0) {
      let noResults = makeNode('No results found', 'h1');
      noResults.classList.add('no-result');
      results.appendChild(noResults);
      return;
    }

    names.forEach((company) => {
      makeResult(company);
    })
    resultsOnScreen = true;
  }

  /************************/
  /******* SPINNER ********/
  /************************/

  // add spinkit spinner
  function createSpinner() {
    let spinner = createClassContainer('div', 'spinner');

    for (let i = 1; i <= 3; i++) {
      let node = createClassContainer('div', "bounce" + i);
      spinner.appendChild(node);
    }

    results.appendChild(spinner);
  }

  function deleteSpinner() {
    let spinner = document.querySelector('.spinner');
    spinner.parentNode.removeChild(spinner);
  }

  /***********************/
  /******* RESETS ********/
  /***********************/

  function reset() {
    results.innerHTML = '';
    resultsOnScreen = false;
    currentStart = 0;
    currentLimit = 20;
    scrolling = false;
    total = null;
  }

  function clearModal() {
    modal.innerHTML = '';
  }

  /************************************/
  /******* ADD EVENT LISTENERS ********/
  /************************************/

  // detects scroll to bottom of page
  function reachedBottom() {
    return (window.innerHeight + window.scrollY) >= document.body.offsetHeight ? true: false;
  }

  const searchInput = document.querySelector('.search');
  const results = document.querySelector('.results');
  const modal = document.querySelector('.modal');
  const checkBoxes = document.querySelectorAll('.check');
  const noneBox = document.querySelector('.none');

  // ensures a method runs only every x milliseconds, dictacted by wait
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // add event listeners
  searchInput.addEventListener('change', debounce(setQuery, 1000));
  searchInput.addEventListener('keyup', debounce(setQuery, 1000));
  noneBox.addEventListener('change', unCheckOtherBoxes);
  checkBoxes.forEach((check) => {
    check.addEventListener('change', changeLaborPreference);
  });

  // only calls getData if user reached the bottom of page and more results to load
  document.addEventListener('scroll',  
    debounce(function() {
    if (reachedBottom() && resultsOnScreen && total !== currentStart) {
      // spinner so user knows data is loading
      createSpinner();
      currentStart = Math.min(currentStart + (total - currentStart), currentStart + currentLimit) ;
      scrolling = true;
      setTimeout(getData, 1000);
    }
  }, 1000));
})()
