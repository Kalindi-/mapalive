/**
 * JS file for mapalive project, containing map, predefined keywords search functionality, and Flickr api.
 */

/**
 * list of dicitonary objects rappresenting locations
 */
var locations = [
    {
        name : "belvedere",
        coordinates : [45.537589, 13.618552],
        description : "Sweet round hill, with endless views and wind"
    },{
        name : "debeli rtič",
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
        name : "seča",
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
    }
] // maybe TODO add keywords


// trying jSDout
/**
 * @constructor
 * Defining and initializing the map
 */

var map;
var errorMessage;
var initMap = function() {
    if (google != undefined) {
        map = new google.maps.Map(document.getElementById('map'), {
            mapTypeId: google.maps.MapTypeId.HYBRID,
            mapTypeControl: false,
        });
        var bounds = new google.maps.LatLngBounds();
        // looping through the location
        locations.forEach(function(location) {
            var latlngBound = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
            bounds.extend(latlngBound);
        })
        map.fitBounds(bounds);
    } else {
        errorMessage = true
    }
};
initMap();


/**
 * function that constructs the Flickr API call
 * @param {dictionary} data - one dictionariy info form the list of locations
 * creates one Place object with the predefined info
 * makes latlng and markers for google maps from given info
 */
var refreshPhotos = function() {
    var flickerAPI = "https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=475b3ad500b92ed51c6657bb3ebd262e&format=json?jsoncallback=?";
    $.getJSON( flickerAPI, {
        // takes photoSearch parameter either from searches or clicks on markers
        tags: photoSearch,
        format: "json"
    })
    .done( function(data) {
        //when done runs the function that was returned with its data
        jsonFlickrApi(data);
    })
    // .fail(
    //     function(d, textStatus, error) {
    //     console.error("getJSON failed, status: " + textStatus + ", error: "+error)
    //     alert( "error" );
    // }) // TODO PROBLEM! failing? why does this always fail?
};


/**
 * function that constructs the Flickr API call
 * @param {dictionary} data - one dictionariy info form the list of locations
 * creates one Place object with the predefined info
 * makes latlng and markers for google maps from given
 */
var Place = function(data) {
    this.name = data.name;
    this.coordinates = data.coordinates;
    this.description = data.description;
    //
    this.latlng = new google.maps.LatLng(this.coordinates[0], this.coordinates[1]);
    this.marker = new google.maps.Marker({
        position: this.latlng,
        title: this.name,
        icon: "img/sea.png"
    });
};


/**
 * @constructor (what does this mean actually)
 * knockout ViewModel that connects delivers the info from one area to another
 */
var locationsToUse; // to be used among all the functions in the file. Is this how it is done? What is a better way?
var photoSearch = "istrien";
var ViewModel = function() {
    // making this accessable
    var self = this;

    // defining and populating the observable locationsArray
    self.locationsArray = ko.observableArray([]);
    locations.forEach(function(place){
        self.locationsArray.push( new Place(place))
    });

    // initializing some observables used in the html
    self.visibleLocations = ko.observableArray([]);
    self.userInput =  ko.observable('');
    self.displayMessage = ko.observable(false);

    // determine the visible locations, show markers and list accordingly,
    // if text search show locations that fit the search
    var search = "";
    self.showLocations = function(location) {
        // remove all visible locations
        photoSearch = "";+
        self.visibleLocations.removeAll();
        // loop through exisiting locations and add those fitting standards to visible locations
        locationsArray().forEach(function(place) {
            // true if search string is part of name or description of location
            if ( place.name.indexOf(location) > -1 || place.description.indexOf(location) > -1) {
                // TODO MAYBE something about details search
                self.visibleLocations.push(place);
                place.marker.setMap(map);
                photoSearch += place.name + ", " ;
                // kinda crappy to go through thes last steps each time, no?
            }
            // if no search fits show no markers
            else if ( place.name.indexOf(location) === -1 ) {
                place.marker.setMap(null);
            }
        });
        // shows a generic term when either all are selected or none
        // TODO - delete this when random images - problem maybe, because
        if ( visibleLocations().length === locations.length ) {
            self.displayMessage(false);
            photoSearch = "istrien";
        } else if ( visibleLocations().length === 0 ) {
            photoSearch = "istria";
        }
        return visibleLocations();
    }
    // refreshes the photos based on search
    refreshPhotos();
    // sets the location based on the search
    locationsToUse = self.showLocations(search);

    // is called when the user input something in the search bar,
    // sets of location array and photo refresh
    self.availableLocations = function() {
        search = self.userInput().toLowerCase();
        self.displayMessage(true);
        showLocations(search);
        refreshPhotos();
    }

    // is called when user clicks on one of the words in the list
    // sets of location array and photo refresh
    self.locationClick = function (location) {
        search = location.name;
        showLocations(search);
        photoSearch = location.name;
        self.displayMessage(true);
        refreshPhotos();
    }

    // is called by the user clicking the "SHOW ALL"
    // refreshes the page to a "beggining" state
    self.refreshClick = function (location) {
        search = "";
        self.userInput("");
        infoWindow.close();
        showLocations(search);
        refreshPhotos();
    }


    // observable used in the html, pupulated by the flickr api answer
    self.imagesArray = ko.observableArray([]);
    self.errorMessage = ko.observable(errorMessage);
    /**
     * Flickr api call translations
     */
    self.jsonFlickrApi = function(info) {
        console.log()
        if (info.photos != undefined) {
            // empties array
            self.imagesArray([])
            // loops through the photo info given by Flickr and make link to flickr img, img url and img alt
            info.photos.photo.forEach(function(data){
                self.imagesArray.push([
                    'https://www.flickr.com/photos/' + data.owner + '/' + data.id,
                    'http://farm'+ data.farm +'.static.flickr.com/'+ data.server +'/'+ data.id +'_'+ data.secret +'_m.jpg',
                    "Flickr photo search keyword: " + photoSearch
                ]);
            });
        } else {
            self.errorMessage(true);
        }
    }
};
// give the info to the html
ko.applyBindings(ViewModel());


 /**
 * @constructor
 * makes one google maps InfoWindow
 * gets shown with marker specific info when a marker is clicked.
 */
var infoWindow;
var makeInfoWindow = function() {
    infoWindow = new google.maps.InfoWindow({
        maxWidth: 150
    });
    /**
     * loops through the locations objects sets a listener to the marker
     * that opens the infoWindow when clicked
     * data inputed is the location object
     */
    locationsToUse.forEach(function(place) {
        google.maps.event.addListener(place.marker, 'click', function(loc) {
            return function() {
                infoWindow.setContent('<h4>'+ loc.name + '</h4> <p>' + loc.description + '</p>');
                infoWindow.open(map, this);
                photoSearch = loc.name;
                displayMessage(true);
                refreshPhotos();
                place.marker.setMap(null);
                place.marker.setAnimation(google.maps.Animation.DROP);
                place.marker.setMap(map);
                map.setCenter(place.marker.getPosition());
                // TODO PROBLEM! infoWindow on top of everythin, tried different ways to set zIndex.
                // TODO MAYBE move to the right if under locations list (how?)
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