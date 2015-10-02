var locations = [{
            name : "belvedere",
            coordinates : [45.537589, 13.618552],
            description : "Sweet round hill, with endless views and wind"
        },{
            name : "debeli rtic",
            coordinates : [45.5904856, 13.7021026],
            description : "it being on the other side of the bay, makes for an uncommon view"
        },{
            name : "dragonja",
            coordinates : [45.451040, 13.692053],
            description : "river waters, fresh valley, saw a snake eat a fish once"
        },{
            name : "piran",
            coordinates : [45.530337, 13.562947],
            description : "looks nice from above, and from the sea, and theres plenty of both"
        },{
            name : "savudrija",
            coordinates : [45.50, 13.504],
            description : ": )"
        },{
            name : "seca",
            coordinates : [45.486138, 13.626889],
            description : "there is a playground for adoults here, swims also deacent"
        },{
            name : "soline",
            coordinates : [45.490521, 13.601933],
            description : "great scenery, salt used to be the real deal some time ago"
        },{
            name : "strugnano",
            coordinates : [45.527949, 13.593080],
            description : "pretty cliffs, looking like a big rock whale"
        },{
            name : "strunjan",
            coordinates : [45.528669, 13.608685],
            description : "there is a cute line of trees if you zoom in, walk sweet, but up on the hills or by the sea"
        }]


var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        mapTypeId: google.maps.MapTypeId.HYBRID,
        mapTypeControl: false,
    });
    var bounds = new google.maps.LatLngBounds();
    locations.forEach(function(location) {
        var latlngBound = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
        bounds.extend(latlngBound);
    })
    map.fitBounds(bounds);
}
initMap();


var refreshPhotos = function() {
    var flickerAPI = "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=475b3ad500b92ed51c6657bb3ebd262e&format=json?jsoncallback=?";
    $.getJSON( flickerAPI, {
        tags: photoSearch,
        format: "json"
    })
    .done( function(data) {
        jsonFlickrApi(data);
    })
    // .fail(
    //     function(d, textStatus, error) {
    //     console.error("getJSON failed, status: " + textStatus + ", error: "+error)
    //     alert( "error" );
    // }) //why does this always fail?
    // TODO failing?
};

var jsonFlickrApi = function(info) {
    $('#images').empty();
    $.each(info.photos.photo, function(i,item){
    //TODO randomize photos.
        var image = '<a href="https://www.flickr.com/photos/' + item.owner + '/' + item.id + '" target="_blank"><img src="http://farm'+ item.farm +'.static.flickr.com/'+ item.server +'/'+ item.id +'_'+ item.secret +'_m.jpg"></a>';
        $('#images').append(image);
        if ( i == 1000 ) return false;
    });

}


var Place = function(data) {
    this.name = data.name;
    this.coordinates = data.coordinates;
    this.description = data.description;
    this.latlng = new google.maps.LatLng(this.coordinates[0], this.coordinates[1]);
    this.marker = new google.maps.Marker({
        position: this.latlng,
        title: this.name,
        icon: "sea.png"
    });
}

var locationsToUse;
var ViewModel = function() {
    var self = this;

    self.locationsArray = ko.observableArray([]);

    locations.forEach(function(place){
        self.locationsArray.push( new Place(place))
    });

    self.userInput =  ko.observable('');
    self.visibleLocations = ko.observableArray();
    self.displayMessage = ko.observable(false);

    var search = "";
    self.showLocations = function(location) {
        photoSearch = " ";
        self.visibleLocations.removeAll();
        locationsArray().forEach(function(place) {
            if ( place.name.indexOf(location) > -1 ) {
                self.visibleLocations.push(place);
                place.marker.setMap(map);
                photoSearch += ", " + place.name ; // kinda crappy to go through this each time, no?
            }
            else if ( place.name.indexOf(location) === -1 ) {
                place.marker.setMap(null);
            }
        });
        if ( visibleLocations().length === locations.length ) {
            self.displayMessage(false);
            photoSearch = "istria";
        }
        refreshPhotos();
        return visibleLocations();
    }

    self.availableLocations = function() {
        search = self.userInput().toLowerCase();
        self.displayMessage(true);
        return showLocations(search);
    }


    self.locationClick = function (location) {
        search = location.name;
        self.displayMessage(true);
        return showLocations(search);
    }

    self.refreshClick = function (location) {
        search = "";
        self.userInput("");
        return showLocations(search);
    }
    locationsToUse = self.showLocations(search);
}


ko.applyBindings(ViewModel());





var makeInfoWindow = function() {
    var infoWindow = new google.maps.InfoWindow({
        maxWidth: 150
    });
    locationsToUse.forEach(function(place) {
        google.maps.event.addListener(place.marker, 'click', function(content) {
            return function() {
                infoWindow.setContent('<h4>'+ content.name + '</h4> <p>' + content.description + '</p>');
                infoWindow.open(map, this);
                photoSearch = content.name;
                displayMessage(true);
                refreshPhotos();
                place.marker.setMap(null);
                place.marker.setAnimation(google.maps.Animation.DROP);
                place.marker.setMap(map);
                map.setCenter(place.marker.getPosition());
                //TODO move infowindow when clicked if under text...
            }
        }(place))
    });
}
makeInfoWindow();



// thankyous go to:
// http://stackoverflow.com/a/9525939
// http://stackoverflow.com/a/7819972
// http://stackoverflow.com/a/1505218
// http://jsfiddle.net/mythical/XJEzc/
// http://stackoverflow.com/a/23981970
