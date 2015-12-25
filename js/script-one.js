var map;

function initMap() {
  // Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('map-div'), {
    center: {lat: 39.173303, lng: -77.177274},
    scrollwheel: true,
    zoom: 6
  });
  
  var infowindow = new google.maps.InfoWindow();
  
}

// Main Angular Application
var App = angular.module("myApp", []);
  
// Master Angular Controller
App.controller('masterCtrl', function($scope) {

	//search specific location
	$scope.searchLocation = function() {
		
		var location;
		var streetInfo = $("#street").val();
		var cityInfo = $("#city").val();
		var address = streetInfo + ", " + cityInfo;
		
		//Adds Street Image
		var streetViewURL = 'http://maps.googleapis.com/maps/api/streetview?size=500x400&location=' + address + '';
		$('#street-img').src = streetViewURL;
		
		$scope.imgURL = streetViewURL;

		var geocodeURL = 'http://maps.googleapis.com/maps/api/geocode/json?address="' + address + '"key=AIzaSyBOwcm5LbfnPcfZ82rrZwguS81lDkv5D-g';
	
		$.getJSON(geocodeURL, function(data) {
		console.log(data);
		
			var coordinates = data.results[0].geometry.location;
			
			var infoBox = '<div>' + '<h3>' + streetInfo + '</h3>' + '<p>' + cityInfo + '</p>' + '</div>';
			
			var infowindow = new google.maps.InfoWindow();
		
			map = new google.maps.Map(document.getElementById('map-div'), {
				center: coordinates,
				scrollwheel: true,
				zoom: 13
			});
		
			var marker = new google.maps.Marker({
				map: map,
				position: coordinates,
				animation: google.maps.Animation.DROP,
			});
			
			marker.addListener('click', function() {
                console.log('Marker Animation');
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
                setTimeout(function() {
                    marker.setAnimation(null)
                }, 1500);
            });
			
			google.maps.event.addListener(marker, 'click', function() {
                console.log('click function working');
                infowindow.setContent(infoBox);
                map.setZoom(12);
                map.setCenter(marker.position);
                infowindow.open(map, marker);
                map.panBy(0, -125);
            });
		
		})
		
		var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='
		+ cityInfo + '&format=json&callback=wikiCallback';
	
		var wikiTimeout = setTimeout(function(){
			$('#wikipedia-header').text("Failed To Load Wikipedia Resources");
		}, 8000);
		
		$("#wikipedia-links").text("");
	
		$.ajax({
			url : wikiURL,
			dataType : "jsonp",
			// callback,
			success : function(response) {
				var articleList = response[1];
			
				for (var i = 0; i < articleList.length; i++) {
					articleInfo = articleList[i];
					var URL = 'http://en.wikipedia.org/wiki/' + articleInfo;
					$('#wikipedia-links').append(
					'<li><a href="' + URL + '">' + articleInfo + '</a></li>'
					);
				};
				clearTimeout(wikiTimeout);
			}
		
		})
		
	}
	
	//	Loads FourSquare from user input
	$scope.loadPlaces = function() {
		
		console.log("Load Places Clicked");
		
		var query = $('#query').val();
		var City = $('#query-city').val();
		var amount = $('#amount').val();
		
		//Checking Inputs
		if(query == '') {
			alert('Query field is/was blank. Please input a search query.');
			return;
		};
		if(City == '') {
			alert('City field is/was left blank. Please input a valid location.');
			return;
		};
		
		// Checking Amount Input
		if(isNaN(amount)) {
			alert('Value is Not a Number. Please submit numbers only for this input field.');
			return;
		};
		if(amount == '') {
			alert('Value was blank/empty. Please submit a number for this input field.');
			return;
		};
		if(amount == 0) {
			alert('Value was 0. Please use a number that is greater than 0, less than 51.');
			return;
		};
		if(amount > 50) {
			alert('Value too high. Please use a number that is greater than 0, less than 51.');
			return;
		};
		
		var streetViewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=500x400&location=' + City + '';
		$('#street-img').src = streetViewUrl;
		$scope.imgURL = streetViewUrl;
		
		var apiURL = 'https://api.foursquare.com/v2/venues/search?client_id=N1IAMKZUIK1AUHKRFGFBKPQ2YKDSBAKS4NTER5SYZN5CROR1&client_secret=4MKLXVLU2FGZQVRMAEDC15P0TFJGSCY3ZUYUZ0KHQQQLQ5R3&v=20130815%20&limit=' + amount + '&near=' + City + '&query=' + query + '';
		console.log(apiURL);
		
		var infoWindow = new google.maps.InfoWindow();
		
		$scope.places = [];
		
		$scope.filteredPlaces = [];
		
		$scope.mapMarkers = [];
		
		$.getJSON(apiURL, function(data) {
			console.log(data);
			
			var venues = data.response.venues.length;
			
			//Refreshes Map
			map = new google.maps.Map(document.getElementById('map-div'), {
				center: {lat: data.response.venues[1].location.lat, lng: data.response.venues[1].location.lng},
				scrollwheel: true,
				zoom: 11
			});
			
			var marker;
			
			var address = data.response.venues[1].location.city + ', ' + data.response.venues[1].location.state;
			
			// Loops through JSON and saves data
			for(var i = 0; i < venues; i++) {
				
				var venue = data.response.venues[i];
				
				if (venue.location.address === undefined) continue;

                var venueName = venue.name;
				var venueID = venue.id;
                var venueAddress = venue.location.address;
                var venueCity = venue.location.city;
                var venueState = venue.location.state;
                var venueZip = venue.location.postalCode;
				var venueCountry = venue.location.country;
                var venuePhone = venue.contact.formattedPhone;
                var venueLat = venue.location.lat;
                var venueLng = venue.location.lng;
                var venueImg = 'https://maps.googleapis.com/maps/api/streetview?size=150x150&location=' + venue.location.lat + ',' + venue.location.lng + '&heading=151.78&pitch=-0.76&key=AIzaSyBWq_bL3W2U17sffyrBJdzsxeFT445s9EU';
				var venueStatus = venue.hereNow.summary;
				var venueSpecials = venue.specials.count;
				
				var InfoBox = '<div style="max-width: ;">' + '<h4 class="text-center">' + venueName + '</h4>' + '<p>' + venueAddress + '</p>' + '<p>' + venueCity + ', ' + venueState + ' ' + venueZip + '</p>' + '<p>' + venuePhone + '</p>' + '<center>' + '<img src="' + venueImg + '"/>' + '</center>' +
                '<br>' + '<center>' + '<p>Brought to you by, <i>FourSquare!</i></p>' + '<img class="icon-one" src="https://cdn0.iconfinder.com/data/icons/social-flat-rounded-rects/512/foursquare-128.png"/>' + '</center>' + '<a href="\https://www.google.com/search?q=' + venueName + '&oq=Grand+Century+Shopping+Mall&aqs=chrome..69i57&sourceid=chrome&es_sm=122&ie=UTF-8">' + 
				'Google Search' + '</a>' + '</div>';
				
				var marker = new google.maps.Marker({
					position: {lat: venueLat, lng: venueLng},
					title: venueName,
					animation: google.maps.Animation.DROP,
					map: map
				});
				
				//Adds places to array
				$scope.places.push({
					placeName: venueName,
					placeID: venueID,
                    placeAddress: venueAddress,
                    placeCity: venueCity,
                    placeState: venueState,
                    placeZip: venueZip,
					placeCountry: venueCountry,
                    placePhone: venuePhone,
                    placeLat: venueLat,
                    placeLng: venueLng,
                    placeImg: venueImg,
					placeStatus: venueStatus,
					placeSpecials: venueSpecials,
					placeInfoBox : InfoBox,
					placeMarker : marker,
				});
				
				$scope.filteredPlaces.push({
					placeName: venueName,
					placeID: venueID,
                    placeAddress: venueAddress,
                    placeCity: venueCity,
                    placeState: venueState,
                    placeZip: venueZip,
					placeCountry: venueCountry,
                    placePhone: venuePhone,
                    placeLat: venueLat,
                    placeLng: venueLng,
                    placeImg: venueImg,
					placeStatus: venueStatus,
					placeSpecials: venueSpecials,
					placeInfoBox : InfoBox,
					placeMarker : marker,
				});
				
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
			$('#wikipedia-header').text("Failed To Load Wikipedia Resources");
		}, 8000);
		
		$("#wikipedia-links").text("");
		
		$.ajax({
			url : wikiURL,
			dataType : "jsonp",
			// callback,
			success : function(response) {
				console.log(response);
				var articleList = response[1];
			
				for (var i = 0; i < articleList.length; i++) {
					articleInfo = articleList[i];
					var URL = 'http://en.wikipedia.org/wiki/' + articleInfo;
					$('#wikipedia-links').append(
					'<li><a href="' + URL + '">' + articleInfo + '</a></li>'
					);
				};
				clearTimeout(wikiTimeout);
			}
		
		})
		
		
		
	}

	$scope.mapMarkers = [];
	
	$scope.addMarker = function(array) {
		
		$.each(array, function(index, value) {
			var infowindow = new google.maps.InfoWindow();
			
            var latitude = value.placeLat,
                longitude = value.placeLng,
                Loc = new google.maps.LatLng(latitude, longitude),
                thisName = value.placeName;
				
			var ID = value.placeID;

            var infoBox = '<div style="border: 1px solid black; padding: 10px;">' + '<h4>' + value.placeName + '</h4>' + '<p>' + value.placeAddress + '</p>' + '<p>' + value.placeCity + ', ' + value.placeState + ' ' + value.placeZip + '</p>' + '<p>' + value.placePhone + '</p>' + '<center>' + '<img class="info-img" src="' + value.placeImg + '"/>' + '</center>' +
                '<br>' + '<center>' + '<p>Brought to you by, <i>FourSquare!</i></p>' + '<img class="icon-one" src="https://cdn0.iconfinder.com/data/icons/social-flat-rounded-rects/512/foursquare-32.png"/>' + '</center>' + '<br>' +
				'<a href="\https://www.google.com/search?q=' + value.placeName + '&oq=' + value.placeName + '&aqs=chrome..69i57&sourceid=chrome&es_sm=122&ie=UTF-8">' + 
				'<p class="text-center">' + 'Google Search' + '</p>' + '</a>' + '</div>';

            var marker = new google.maps.Marker({
                position: Loc,
                title: thisName,
				id: ID,
                animation: google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function() {
                console.log('Marker Animation');
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
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

	$scope.showMarker = function(string, el) {
		console.log(string);
		
		var infowindow = new google.maps.InfoWindow();
		
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
		
		var input = $('#search-filter').val().toLowerCase();
        var list = $scope.places;
		var markers = $scope.mapMarkers;
        if (!input) {
            return;
        } else {
            $scope.places = [];
			
            for (var i = 0; i < list.length; i++) {
                if (list[i].placeName.toLowerCase().indexOf(input) != -1) {
                    markers[i].marker.setMap(map);
                    $scope.places.push(list[i]);
					
                } else { 
					markers[i].marker.setMap(null);
					markers[i].marker = null;
                }
	
            }

        }console.log(markers);
		
		
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
	$('#fq-text').text('Please be normal with your search. \
	You can click the list item to show it on the map');
	
	setTimeout(function(){ 
		$('#fq-text').text('');
	}, 5000);
	
}

function webInfo() {
	alert(
		'Welcome to this web application. This web app is using 3 APIs: \
		Google Maps, Google StreetView, and FourSquare! \
		Search for a specific location, a category (Search literally anything, including brand names) and locations from four square! \
		Please use proper words for your search. Have fun and enjoy!'
	);	
}