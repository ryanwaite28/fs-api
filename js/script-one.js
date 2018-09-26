var map;

function initMap() {
  // Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('map-div'), {
	center: {lat: 39.173303, lng: -77.177274},
	scrollwheel: true,
	zoom: 5
  });

  window.infowindow = new google.maps.InfoWindow();

}

/* ---  --- */

$(document).ready(function(){

	var searchIcon = $('#search-icon');
	var menuIcon = $('#menu-icon');
	var refreshIcon = $('#refresh');
	var mapDiv = $('#mapdiv');
	var searchDiv = $('#search-div');
	var wikiDiv = $('#wiki-div');
	var imgDiv = $('#img-div');
	var inputDiv = $('#fq-search');
	var dropIcon = $('#dropdown-icon');
	var wikiList = $('#wikipedia-links');
  var chevron = $('#chevron');
  var bta = $('#bta');
  var sidebar = $('#sidebar');
  var wikiList = $('#wikipedia-links');

  bta.click(function(){
    sidebar.animate({
      scrollTop: 0 // $("#sdl").offset().top
    }, 1000);
  });

  sidebar.scroll(function() {
    var top = $(this).scrollTop();
    if( top > 10 ) {
      bta.addClass('rotate');
    }
    else {
      bta.removeClass('rotate');
    }
  });

  $("[data-toggle='toggle']").click(function() {
    var selector = $(this).data("target");
    $(selector).toggleClass('in');
  });

  chevron.click(function(){
    bta.toggleClass('concealed');
    $(this).toggleClass('rotate');
  });

  setTimeout(function(){
    sidebar.toggleClass('in');
    bta.toggleClass('concealed');
    chevron.toggleClass('rotate');
  } , 2000);

	var wHidden = true;

	dropIcon.click(function(){

		if(wHidden == true) {
			wikiList.show('fast');
			dropIcon.toggleClass('rotate');
			wHidden = false;
		}
		else {
			wikiList.hide('fast');
			dropIcon.toggleClass('rotate');
			wHidden = true;
		}

	});

	var cWidth = $(window).width();

	if(cWidth <= 992) {
		setTimeout(function(){
			mapDiv.hide();
		},500);
	}

	searchIcon.click(function(){
		mapDiv.hide('fast');
		searchDiv.show('fast');
		wikiDiv.show('fast');
		imgDiv.show('fast');
		inputDiv.show('fast');
		refreshIcon.hide('fast');
	});

	menuIcon.click(function(){
		mapDiv.show('fast');
		searchDiv.hide('fast');
		wikiDiv.hide('fast');
		imgDiv.hide('fast');
		inputDiv.hide('fast');
		refreshIcon.show('fast');
	});

	refreshIcon.click(function(){
		map.setZoom(5);
	});

	$(window).resize(function(){

	  var cWidth = $(window).width();

	  if(cWidth > 992) {
		mapDiv.show();
		searchDiv.show();
		wikiDiv.show();
		imgDiv.show();
		inputDiv.show();
		refreshIcon.show();
	  }

	})

});

// Main Angular Application
var App = angular.module("myApp", []);

// Master Angular Controller
App.controller('masterCtrl', function($scope) {

  window.scope = $scope;

  $(document).keyup(function(e){

    if( e.keyCode == 13 ) {
      if( $('#query').is(':focus') || $('#query-city').is(':focus') ){
        $scope.loadPlaces();
      }
    }
  });

	//	Loads FourSquare from user input
	$scope.loadPlaces = function() {

		console.log("Load Places Clicked");

		var query = $('#query').val();
		var City = $('#query-city').val();

		//Checking Inputs
		if(query == '') {
			alert('Query field is/was blank. Please input a search query.');
			return;
		};
		if(City == '') {
			alert('City field is/was left blank. Please input a valid location.');
			return;
		};

    $scope.q1 = query + ' in ';
    $scope.q2 = City;

		var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=500x400&location=' + City + '';
		$('#street-img').src = streetViewUrl;
		$scope.imgURL = streetViewUrl;

		var apiURL = 'https://api.foursquare.com/v2/venues/search?client_id=N1IAMKZUIK1AUHKRFGFBKPQ2YKDSBAKS4NTER5SYZN5CROR1&client_secret=4MKLXVLU2FGZQVRMAEDC15P0TFJGSCY3ZUYUZ0KHQQQLQ5R3&v=20130815%20&limit=50&near=' + City + '&query=' + query + '';
		console.log(apiURL);

		$scope.places = [];

		$.getJSON(apiURL, function(data) {
			console.log(data);

			var venues = data.response.venues.length;

			//Refreshes Map
			map = new google.maps.Map(document.getElementById('map-div'), {
				center: {lat: data.response.venues[1].location.lat, lng: data.response.venues[1].location.lng},
				scrollwheel: true,
				zoom: 9
			});

		  // Loops through JSON and saves data
			for ( var i = 0; i < venues; i++ ) {

				var venue = data.response.venues[i];

				if (venue.location.address == undefined) {
          continue;
        }

				//Adds places to array
				$scope.places.push({
					placeName: venue.name,
					placeID: venue.id,
					placeAddress: venue.location.address,
					placeCity: venue.location.city,
					placeState: venue.location.state,
					placeZip: venue.location.postalCode,
					placeCountry: venue.location.country,
					placePhone:  venue.contact.formattedPhone,
					placeLat: venue.location.lat,
					placeLng: venue.location.lng,
					placeImg: 'https://maps.googleapis.com/maps/api/streetview?size=150x150&location=' + venue.location.lat + ',' + venue.location.lng + '&heading=151.78&pitch=-0.76&key=AIzaSyB6N63ZIGH4b8Hgm9KhodA87Guuiem3C8Y',
					placeStatus: venue.hereNow.summary
				})

			}

			$scope.addMarker($scope.places);
			console.log('done push');
			$scope.$apply(function () {
				console.log($scope.places);
			});

		});

		var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='
		+ query + '&format=json&callback=wikiCallback';

		var wikiTimeout = setTimeout(function(){
			alert("Failed To Load Wikipedia Resources");
		}, 8000);

    $scope.wikiList = [];

		$.ajax({
			url : wikiURL,
			dataType : "jsonp",
			// callback,
			success : function(response) {
				(function(){
          console.log(response);

          for( var key in response[1] ) {
            $scope.wikiList.push({
              title: response[1][key],
              link: response[3][key]
            });
          }

  				clearTimeout(wikiTimeout);
          $scope.$apply(function(){
            console.log($scope.wikiList);
          });
        })()
			}
		})

		$('#dropdown-icon').show('fast');
    $('#query').val('');
    $('#query-city').val('');
	}

	$scope.mapMarkers = [];

	$scope.addMarker = function(array) {

		$.each(array, function(index, value) {

			// var infowindow = new google.maps.InfoWindow();

			var infoBox = '<div style="border: 1px solid black; padding: 10px;">' + '<h4>' + value.placeName + '</h4>' + '<p>' + value.placeAddress + '</p>' + '<p>' + value.placeCity + ', ' + value.placeState + ' ' + value.placeZip + '</p>' +
      '<p>' + value.placePhone + '</p>' + '<hr>' + '<center>' + '<img class="info-img" src="' + value.placeImg + '"/>' + '</center>' +
			'<br>' + '<center>' + '</div>';

			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(value.placeLat, value.placeLng),
				title: value.placeName,
				id: value.placeID,
				animation: google.maps.Animation.DROP,
				map: map
			});

			marker.addListener('click', function() {
				console.log('Marker Animation');
				if (marker.getAnimation() !== null) {
					marker.setAnimation(null);
				}
				else {
					marker.setAnimation(google.maps.Animation.BOUNCE);
				}
				setTimeout(function() {
					marker.setAnimation(null)
				}, 1500);
			});

			$scope.mapMarkers.push({
				marker: marker,
				content: infoBox
			});

			google.maps.event.addListener(marker, 'click', function() {
				console.log('click function working');
				infowindow.setContent(infoBox);
				map.setZoom(13);
				map.setCenter(marker.position);
				infowindow.open(map, marker);
				map.panBy(0, -125);
			});
		});
	}

	$scope.showMarker = function(string) {

		console.log(string);
		// var infowindow = new google.maps.InfoWindow();
		var clickedItem = string.place.placeID;

		for (var key in $scope.mapMarkers) {
			if (clickedItem === $scope.mapMarkers[key].marker.id) {
				map.panTo($scope.mapMarkers[key].marker.position);
				map.setZoom(13);
				infowindow.setContent($scope.mapMarkers[key].content);
				infowindow.open(map, $scope.mapMarkers[key].marker);
				map.panBy(0, 125);
			}
		}
	}

	$scope.filterResults = function() {

		var input = $('#place-filter').val().toLowerCase();
		console.log(input);
		var list = $scope.places;
		if (input == '' || !input) {
			$.each($scope.mapMarkers, function(index, item){
				$scope.mapMarkers[index].marker.setMap(map);
			})
			return;
		}
    else {
			for (var i = 0; i < list.length; i++) {
				if (list[i].placeName.toLowerCase().indexOf(input) != -1) {
					$scope.mapMarkers[i].marker.setMap(map);
				}
				else {
					$scope.mapMarkers[i].marker.setMap(null);
			  }
			}
		}
	}

	$scope.showMessage = function() {
		console.log("MouseOver Working.");

		$('#fq-text').text('Click any list item to show its location on the map.');
		setTimeout(function(){
			$('#fq-text').text('');
		}, 3000);
	}
});

function answer() {
	alert("You can also search other Countries as well! Just put the city and then region/country! Also, you don't have to submit a street address. Submit a city and state (or other location in the world) to mark the map and get news about it, as well as a twitter feed!");
}

function fqAnswer() {
	alert('Please be normal with your search. \
	You can click the list item to show it on the map');
	// setTimeout(function(){
	// 	$('#fq-text').text('');
	// }, 5000);
}

function webInfo() {
	alert(
		'Welcome to this web application. This web app is using 3 APIs: \
		Google Maps, Google StreetView, and FourSquare! \
		Search for a specific location, a category (Search literally anything, including brand names) and locations from four square! \
		Please use proper words for your search. Have fun and enjoy!'
	);
}
