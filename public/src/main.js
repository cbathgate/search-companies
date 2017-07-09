(function() {

  const baseEndpoint = 'http://localhost:3000/api/companies';
  let currentStart = 0;
  let currentLimit = 20;
  let resultsOnScreen = false;
  let scrolling = false;
  let currentQuery = null;
  let total = null;
  let laborPreference = new Set();
  
  // stretch goal: filter by labor
  function constructUrl() {
    if (laborPreference.size) {
      let labor=([...laborPreference]).join(',');
      return `${baseEndpoint}?q=${currentQuery}&start=${currentStart}&limit=${currentLimit}&laborTypes=${labor}`;
    }
    return `${baseEndpoint}?q=${currentQuery}&start=${currentStart}&limit=${currentLimit}`;
  }

  function clearQuery() {
    currentQuery = null;
  }

  function setQuery() {
    if (this.value === '' || this.value === ' ') {
      clearResults();
      clearQuery();
    } else {
      if (currentQuery !== this.value) {
        clearQuery();
        clearResults();
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
      console.log(total);
      makeResults(data.results);
    });
  }

  function changeLaborPreference() {
    if (this.checked) {  
      laborPreference.add(this.value);
    } else {
      laborPreference.delete(this.value);
    }
    console.log(laborPreference);
    laborPreference.size ? noneBox.checked = false: noneBox.checked = true;
    clearResults();
    if (currentQuery !== null) {
      getData();
    }
  }

  function unCheckOtherBoxes() {
    checkBoxes.forEach((check) => {
      check.checked = false;
    })
    laborPreference = new Set();
    clearResults();
    if (currentQuery !== null) {
      getData();
    }
  }

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

  function makeNode(text, node) {
    let h1 = document.createElement(node);
    let innerText = document.createTextNode(text);
    h1.appendChild(innerText);
    return h1
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

  function makeModal(company) {

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

    // cdarkened background ---> modalElements
    let background = createClassContainer('div', 'modal-background');
    modalElements.push(background);
    
    // image container ---> boxElements
    let imageContainer = createClassContainer('div', 'modal-image');
    boxElements.push(imageContainer);

    // create image node, append to image container
    let image = document.createElement('img');
    image.src = company.avatarUrl;
    image.alt = `${company.name} logo`;
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

  function makeResult(company) {
    let result = makeNode(company.name, 'li');
    result.data = company;
    result.addEventListener('click', function() { makeModal(this.data) });
    results.appendChild(result);
  }

  function makeResults(names) {

    if (!scrolling) {
      results.innerHTML = '';
    }

    if (currentStart > 0) {
      deleteSpinner();
    }

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

  function clearResults() {
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

  function reachedBottom() {
    return (window.innerHeight + window.scrollY) >= document.body.offsetHeight ? true: false;
  }

  const searchInput = document.querySelector('.search');
  const results = document.querySelector('.results');
  const modal = document.querySelector('.modal');
  const checkBoxes = document.querySelectorAll('.check');
  const noneBox = document.querySelector('.none');
  const spin = document.querySelector('.spin');

  // add event listeners
  searchInput.addEventListener('change', debounce(setQuery, 1000));
  searchInput.addEventListener('keyup', debounce(setQuery, 1000));
  noneBox.addEventListener('change', unCheckOtherBoxes);

  checkBoxes.forEach((check) => {
    check.addEventListener('change', changeLaborPreference);
  });

  document.addEventListener('scroll',  
    debounce(function() {
    if (reachedBottom() && resultsOnScreen && total !== currentStart) {
      createSpinner();
      currentStart = Math.min(currentStart + (total - currentStart), currentStart + currentLimit) ;
      scrolling = true;
      setTimeout(getData, 1000);
    }
  }, 1000));
})()
