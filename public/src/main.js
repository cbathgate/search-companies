(function() {

  const baseEndpoint = 'http://localhost:3000/api/companies';
  let currentStart = 0;
  let currentLimit = 20;
  let resultsOnScreen = false;
  let scrolling = false;
  let currentQuery = '';
  let total = 0;
  
  // mvp: use only the q paremeter
  // stretch goal: only load 10 results at a time, scroll to load more options
  // stretch goal: filter by labor
  function constructUrl() {
    return `${baseEndpoint}?q=${currentQuery}&start=${currentStart}&limit=${currentLimit}`
  }

  function setQuery() {
    if (this.value === '' || this.value === ' ') {
      clearResults();
    } else {
      if (currentQuery !== this.value) {
        clearResults();
        currentQuery = this.value;
        getData();
      }
    }
  }

  function getData() {
    console.log('hi');
    let url = constructUrl();
    fetch(url)
    .then(result => result.json())
    .then((data) => {
      total = data.total;
      makeResults(data.results);
    });
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
    names.forEach((company) => {
      makeResult(company);
    })
    resultsOnScreen = true;
  }

  function clearResults() {
    results.innerHTML = '';
    resultsOnScreen = false;
    currentQuery = '';
    currentStart = 0;
    currentLimit = 20;
    scrolling = false;
    total = 0;
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

  // add event listeners
  searchInput.addEventListener('change', debounce(setQuery, 1000));
  searchInput.addEventListener('keyup', debounce(setQuery, 1000));
  document.addEventListener('scroll', debounce(function() {
    if (reachedBottom() && resultsOnScreen) {
      currentStart = Math.min(currentStart + (total - currentStart), currentStart + currentLimit) ;
      scrolling = true;
      console.log('start', currentStart);
      getData();
    }
  }, 1000));
})()