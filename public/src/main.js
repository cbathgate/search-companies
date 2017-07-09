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

  function makeModal(company) {

    console.log(company);

    // modal
    let box = document.createElement('div');
    box.classList.add('modal-main');

    // create darkened background
    let background = document.createElement('div');
    background.classList.add('modal-background');

    // company info
    let name = makeNode(company.name, 'h1');
    let phone = makeNode(company.phone, 'h1');

    // create close button
    let close = makeNode('Close', 'div');
    close.addEventListener('click', clearModal);
    close.classList.add('modal-button');

    box.appendChild(name);
    box.appendChild(phone);
    box.appendChild(close);

    modal.appendChild(box);
    modal.appendChild(background);
  }

  function makeResult(company) {
    let result = document.createElement('li');
    let text = document.createTextNode(company.name)
    result.data = company;
    result.addEventListener('click', function() { makeModal(this.data) });
    result.appendChild(text);
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