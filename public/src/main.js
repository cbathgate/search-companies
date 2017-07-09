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

  function makeResults(names) {
    const html = names.map((name) => {
      return `<li>${name.name}</li>`
    }).join('');
    results.innerHTML = html;
  }

  function clearResults() {
    results.innerHTML = '';
  }

  const searchInput = document.querySelector('.search');
  const results = document.querySelector('.results');

  // add event listeners
  searchInput.addEventListener('change', debounce(getData, 1000));
  searchInput.addEventListener('keyup', debounce(getData, 1000));

})()