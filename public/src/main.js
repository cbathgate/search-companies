(function() {

  const baseEndpoint = 'http://localhost:3000/api/companies';
  
  function constructUrl() {
    // TODO: create url endpoint with keys here
  }

  function getData() {
    // TODO: api call here
    console.log("This is the value from search input", this.value);
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

  function addResults() {
    // TODO: function to add li nodes of company names to DOM
  }

  function clearResults() {
    // TODO: removes li nodes if input value is empty
  }

  // 
  const searchInput = document.querySelector('.search');
  const suggestions = document.querySelector('.results');

  // add event listeners
  searchInput.addEventListener('change', debounce(getData, 1000));
  searchInput.addEventListener('keyup', debounce(getData, 1000));

})()