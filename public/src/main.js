(function() {

  const baseEndpoint = 'http://localhost:3000/api/companies';
  
  // mvp: use only the q paremeter
  // stretch goal: only load 10 results at a time, scroll to load more options
  // stretch goal: filter by labor
  function constructUrl(q) {
    return baseEndpoint + "?q=" + q;
  }

  function getData() {
    if (this.value === '' || this.value === ' ') {
      clearResults();
    } else {
      let url = constructUrl(this.value);
      fetch(url)
      .then(result => result.json())
      .then((data) => {
        makeResults(data.results);
      });
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
    clearResults();
    names.forEach((company) => {
      makeResult(company);
    })
  }

  function clearResults() {
    results.innerHTML = '';
  }

  function clearModal() {
    modal.innerHTML = '';
  }

  const searchInput = document.querySelector('.search');
  const results = document.querySelector('.results');
  const modal = document.querySelector('.modal');

  // add event listeners
  searchInput.addEventListener('change', debounce(getData, 1000));
  searchInput.addEventListener('keyup', debounce(getData, 1000));

})()