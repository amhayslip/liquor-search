let products = [];
let currentProduct = null;

const fetch = (query) => {
  let searchUrl = 'http://durhamabc.tagretail.com/transack/live_qoh/plus.json?search=' +  query;

  $.ajax({
    method: "GET",
    url: searchUrl,
    dataType: "json",
    success: function(data) {
      addProducts(data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR, textStatus, errorThrown);
    }
  });
};


const fetchLocations = (plu) => {
  let searchUrl = 'http://durhamabc.tagretail.com/transack/live_qoh/locations.json?plu=' + plu;

  return $.ajax({
    method: "GET",
    url: searchUrl,
    dataType: "json"
  });
};

const addProducts = (data) => {
  products = [];

  let locationRequests = [];

  for (let i = 0; i < data.length; i++) {
    let productData = data[i];

    let loctionPromise = new Promise((resolve, reject) => {
      fetchLocations(productData.plu).then((locationData) => {
        var totalAvailable = locationData.store_quantities.reduce((acc, i) => {
          return acc += i.qoh
        }, 0);

        var product = {
          plu: productData.plu,
          description: productData.description,
          size: productData.size,
          price: productData.price,
          available: totalAvailable
        };

        products.push(product);
        resolve();
      });
    });

    locationRequests.push(loctionPromise);
  }

  Promise.all([...locationRequests]).then(() => {
    renderProducts();
  });
};

const renderProducts = () => {
  $('.products').empty();

  for (let i = 0; i < products.length; i++) {
    var productTemplate = Handlebars.compile($('#product-template').html());
    var productHTML = productTemplate(products[i]);

    $('.products').append(productHTML);
  }
}

$('.search-form').on('submit', (e) => {
  e.preventDefault();

  const search = $('#search-query').val();

  fetch(search);
});

$('.products').on('click', '.description', () => {
  console.log('hey')
});
