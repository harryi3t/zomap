var map;
var sidebarHidden = false;
var input;
var autocomplete;
var zomatoAPI = 'https://developers.zomato.com/api/v2.1';
var markers = [];

function initMap() {
  var btm = {
    lat: 12.9135919,
    lng: 77.6122421
  };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: btm
  });

  input = document.getElementById('location-input');
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  autocomplete.addListener('place_changed', placeChanged);
}

function toggleSidebar() {
  sidebarHidden = !sidebarHidden;
  var sidebar = document.getElementById('sidebar');
  var sidebarHide = document.getElementById('sidebar-hide');
  var from = sidebarHidden ? 0 : -400;
  var to = sidebarHidden ? -400 : 0;
  TinyAnimate.animateCSS(sidebar, 'left', 'px', from, to, 500, 'easeInOutQuart',
    function () {
      sidebarHide.innerHTML = sidebarHidden ? '&gt;' : '&lt;';
    }
  );
}

function placeChanged() {
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
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === XMLHttpRequest.DONE
      && xmlhttp.status === 200) {
      var data;
      try {
        data = JSON.parse(xmlhttp.responseText);
      } catch (err) {
        console.error(err);
        return;
      }
      removeMarkers();
      showRestaurants(data.restaurants);
      boundMapOnRestaurants(data.restaurants);
    }
  };

  xmlhttp.open('GET', zomatoAPI + '/search?lat=' + lat + '&lon=' + lon, true);
  xmlhttp.send();
}

function showRestaurants(restaurants) {
  restaurants.forEach(
    function (obj) {
      var res = obj.restaurant;
      var lat = parseFloat(res.location.latitude);
      var lng = parseFloat(res.location.longitude);
      var position = {lat: lat, lng: lng};
      markers.push(new google.maps.Marker({position: position, map: map}));
    }
  );
}

function boundMapOnRestaurants(restaurants) {
  var latlngList = [];
  restaurants.forEach(
    function (obj) {
      var res = obj.restaurant;
      var lat = parseFloat(res.location.latitude);
      var lng = parseFloat(res.location.longitude);
      if (lat === 0 && lng === 0) return;

      latlngList.push(new google.maps.LatLng(lat, lng));
    }
  );
  var bounds = new google.maps.LatLngBounds();
  latlngList.forEach(
    function (n) {
      bounds.extend(n);
    }
 );
  map.setCenter(bounds.getCenter());
  map.fitBounds(bounds);
}

function removeMarkers() {
  markers.forEach(
    function (m) {
      m.setMap(null);
    }
  );
  markers = [];
}

XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;
var newSend = function (vData) {
  this.setRequestHeader('user-key', 'b78d1ebc7a9795b00f1f4d04a2fbf8ef');
  this.realSend(vData);
};
XMLHttpRequest.prototype.send = newSend;
