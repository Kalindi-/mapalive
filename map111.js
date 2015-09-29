
var locations =   [
    {
        name : "savudrija, croatia",
        "coordinates" : [45.50, 13.504, "savudrija, croatia"]
    },{
        name : "seca, slovenia",
        "coordinates" : [45.486138, 13.626889, "seca, slovenia"]
    },{
        name : "soline, slovenija",
        "coordinates" : [45.490521, 13.601933, "soline, slovenija"]
    },{
        name : "piran, slovenija",
        "coordinates" : [45.530337, 13.562947, "piran, slovenija"]
    },{
        name : "strunjan, slovenija",
        "coordinates" : [45.528669, 13.608685, "strunjanske soline, slovenija"]
    },{
        name : "belvedere, slovenija",
        "coordinates" : [45.537589, 13.618552, "belvedere, slovenija"]
    },{
        name : "debeli rtic, slovenija",
        "coordinates" : [45.5904856, 13.7021026, "debeli rtic, slovenija"]
    },{
        name : "soline strunjan, slovenija",
        "coordinates" : [45.527949, 13.593080, "strunjan, slovenija"]
    },{
        name : "dragonja, slovenija",
        "coordinates" : [45.451040, 13.692053, "dragonja, slovenija"]
    }
];


var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		mapTypeId: google.maps.MapTypeId.HYBRID
	});
	addMarkers();
}

function addMarkers() {
	var bounds = new google.maps.LatLngBounds();
	locationsLength = locations.length
	for (var loc = 0; loc < locationsLength; loc++) {
		var latlng = new google.maps.LatLng(locations[loc].coordinates[0], locations[loc].coordinates[1]);
		var marker = new google.maps.Marker({
    		position: latlng,
    		title: locations[loc].coordinates[2]
			});
		marker.setMap(map);

		var infowindow = new google.maps.InfoWindow({
    		content: locations[loc].coordinates[2]
  		});
		google.maps.event.addListener(marker, 'click', function(content) {
    		return function(){
        		infowindow.setContent(content);//set the content
        		infowindow.open(map,this);
    		}
    	}(locations[loc].coordinates[2]));

		bounds.extend(latlng);
		map.fitBounds(bounds);
	}
}


function newPlace(name, coordinates) {
    var self = this;
    self.name = name;
    self.coordinates = coordinates;

}


function MakePlaces() {
    var self = this;
    self.places = ko.observableArray([]);

    locationsLength = locations.length;
    for (var loc = 0; loc < locationsLength; loc++) {
		var place = new newPlace(locations[loc].name, locations[loc].coordinates);
		self.places.push(place)
	}
}

ko.applyBindings(new MakePlaces());



// thankyous go to:
// http://stackoverflow.com/a/9525939
// http://stackoverflow.com/a/7819972
// http://stackoverflow.com/a/1505218
// <input value="Search" onfocus="if (this.value=='Search') this.value='';">
