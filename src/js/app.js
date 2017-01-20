var map;
var sidebarHidden = false;
var marker;
var input;
var autocomplete;
var zomatoAPI = 'https://developers.zomato.com/api/v2.1';

function initMap() {
  var btm = {
    lat: 12.9135919,
    lng: 77.6122421
  };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: btm
  });
  marker = new google.maps.Marker({
    position: btm,
    map: map
  });

  input = document.getElementById('location-input');
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  autocomplete.addListener('place_changed', place_changed);
}

function toggleSidebar() {
  sidebarHidden = !sidebarHidden;
  var sidebar = document.getElementById('sidebar');
  var sidebarHide = document.getElementById('sidebar-hide');
  var from = sidebarHidden ? 0 : -400;
  var to = sidebarHidden ? -400 : 0;
  TinyAnimate.animateCSS(sidebar, 'left', 'px', from, to, 500, 'easeInOutQuart', function() {
    sidebarHide.innerHTML = sidebarHidden ? '&gt;' : '&lt;';
  });
}

function place_changed() {
  if (!marker) return;
  marker.setVisible(false);
  var place = autocomplete.getPlace();
  if (!place.geometry) {
    // User entered the name of a Place that was not suggested and
    // pressed the Enter key, or the Place Details request failed.
    return;
  }

  // If the place has a geometry, then present it on a map.
  if (place.geometry.viewport) {
    map.fitBounds(place.geometry.viewport);
  } else {
    map.setCenter(place.geometry.location);
    map.setZoom(17); // Why 17? Because it looks good.
  }
  marker.setPosition(place.geometry.location);
  marker.setVisible(true);
  getRestaurants(place);

  // infowindowContent.children['place-icon'].src = place.icon;
  // infowindowContent.children['place-name'].textContent = place.name;
  // infowindowContent.children['place-address'].textContent = address;
  // infowindow.open(map, marker);
}

function getRestaurants(place) {
  if (!place.geometry) return;

  var lat = place.geometry.location.lat();
  var lon = place.geometry.location.lng();
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE
      && xmlhttp.status == 200) {
        var data;
        try {
          data = JSON.parse(xmlhttp.responseText);
        } catch(err) {
          console.error(err);
          return;
        }
        showRestaurants(data.restaurants);
    }
  };

  xmlhttp.open('GET', zomatoAPI + '/search?lat='+lat+'&lon='+lon, true);
  xmlhttp.send();
}

function showRestaurants(restaurants) {
  restaurants.forEach(
    function (obj) {
      var res = obj.restaurant;
      res.marker = new google.maps.Marker({
        position: {
          lat: parseFloat(res.location.latitude),
          lng: parseFloat(res.location.longitude)
        },
        map: map
      });
    }
  );
}

XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;
var newSend = function(vData) {
  this.setRequestHeader('user-key', 'b78d1ebc7a9795b00f1f4d04a2fbf8ef');
  this.realSend(vData);
};
XMLHttpRequest.prototype.send = newSend;
