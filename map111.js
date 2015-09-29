
var locations = [{
            name : "savudrija, croatia",
            coordinates : [45.50, 13.504]
        },{
            name : "seca, slovenia",
            coordinates : [45.486138, 13.626889]
        },{
            name : "soline, slovenija",
            coordinates : [45.490521, 13.601933]
        },{
            name : "piran, slovenija",
            coordinates : [45.530337, 13.562947]
        },{
            name : "strunjan, slovenija",
            coordinates : [45.528669, 13.608685]
        },{
            name : "belvedere, slovenija",
            coordinates : [45.537589, 13.618552]
        },{
            name : "debeli rtic, slovenija",
            coordinates : [45.5904856, 13.7021026]
        },{
            name : "soline strunjan, slovenija",
            coordinates : [45.527949, 13.593080]
        },{
            name : "dragonja, slovenija",
            coordinates : [45.451040, 13.692053]
        }]

var Place = function(data) {
    this.name = data.name;
    this.coordinates = data.coordinates;
    this.latlng = new google.maps.LatLng(this.coordinates[0], this.coordinates[1]);
    this.marker = new google.maps.Marker({
            position: this.latlng,
            title: this.name
            });
    this.infowindow = new google.maps.InfoWindow({
            content: this.name
        });



}

var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        mapTypeId: google.maps.MapTypeId.HYBRID
    });
    var bounds = new google.maps.LatLngBounds();
    locations.forEach(function(location) {
        var latlngBound = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
        bounds.extend(latlngBound);
    })
    map.fitBounds(bounds);
}
initMap();

var ViewModel = function() {

    var self = this;

    this.locationsArray = ko.observableArray([]);
    locations.forEach(function(place){
        self.locationsArray.push( new Place(place))
    });

    self.userInput =  ko.observable('');
    self.visibleLocations = ko.observableArray();
    initMap(self.visibleLocations());

    self.availableLocations = function () {
        self.visibleLocations.removeAll()
        var search = self.userInput().toLowerCase();
        locationsArray().forEach(function(place) {
            if (place.name.indexOf(search) > -1) {
                self.visibleLocations.push(place);
                place.marker.setMap(map);
            }
            else if (place.name.indexOf(search) === -1) {
                place.marker.setMap(null);
            }
        });
    }
    self.availableLocations();
}

// google.maps.event.addListener(marker, 'click', function(content) {
//             return function(){
//                 infowindow.setContent(content);
//                 infowindow.open(map,this);
//             }
//         }(name));


ko.applyBindings(ViewModel());



// thankyous go to:
// http://stackoverflow.com/a/9525939
// http://stackoverflow.com/a/7819972
// http://stackoverflow.com/a/1505218
// http://jsfiddle.net/mythical/XJEzc/
