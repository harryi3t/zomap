var map;
var sidebarHidden = false;
var marker;
var input;
var autocomplete;


function initMap() {
  var btm = {lat: 12.9135919, lng: 77.6122421};
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
    map.setZoom(17);  // Why 17? Because it looks good.
  }
  marker.setPosition(place.geometry.location);
  marker.setVisible(true);
  console.log(place);

  // infowindowContent.children['place-icon'].src = place.icon;
  // infowindowContent.children['place-name'].textContent = place.name;
  // infowindowContent.children['place-address'].textContent = address;
  // infowindow.open(map, marker);
}
