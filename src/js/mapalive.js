
/**
 * JS file for mapalive project, containing map, predefined keywords search functionality, and Flickr api.
 */

// "use strict"; haha this is scary, I tried to put it in late into my project but gave up on it!: )
/**
 * list of dicitonary objects rappresenting locations
 */
var locations = [
    {
        name : "DEBELI RTIČ",
        coordinates : [45.5904856, 13.7021026],
        description : "it being on the other side of the bay, makes for an uncommon view",
        activities : ["swimming"]
    },{
        name : "DRAGONJA",
        coordinates : [45.451040, 13.692053],
        description : "river waters, fresh valley, saw a snake eat a fish once",
        activities: ["swimming", "walking", "biking"]
    },{
        name : "PIRAN",
        coordinates : [45.530337, 13.562947],
        description : "looks nice from above, and from the sea, and theres plenty of both",
        activities : ["swimming", "diving", "walking"]
    },{
        name : "SAVUDRIJA",
        coordinates : [45.50, 13.504],
        description : ": )",
        activities : ["swimming", "diving", "walking", "biking"]
    },{
        name : "SEČA",
        coordinates : [45.501301, 13.587052],
        description : "there is a playground for adults here, swims also decent",
        activities : ["swimming", "walking", "biking"]
    },{
        name : "SOLINE",
        coordinates : [45.490521, 13.601933],
        description : "great scenery, salt used to be the real deal some time ago",
        activities : ["swimming", "walking", "biking"]
    },{
        name : "STRUGNANO",
        coordinates : [45.537589, 13.618552],
        description : "Sweet round hill, with endless views and wind, and cliffs looking like big rock whales",
        activities : ["swimming", "walking"]
    },{
        name : "STRUNJAN",
        coordinates : [45.528669, 13.608685],
        description : "there is a cute line of trees if you zoom in, walk sweet, up on the hills or by the sea",
        activities : ["walking", "biking"]
    }
];


// trying jSDout
/**
 * @constructor
 * Defining and initializing the map
 */

var map;
var errorMessage;
var initMap = function() {
    if (google !== undefined) {
        map = new google.maps.Map(document.getElementById('map'), {
            mapTypeId: google.maps.MapTypeId.HYBRID,
            mapTypeControl: false,
        });
        var bounds = new google.maps.LatLngBounds();
        // looping through the location
        locations.forEach(function(location) {
            var latlngBound = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
            bounds.extend(latlngBound);
        });
        map.fitBounds(bounds);
    } else {
        errorMessage = true;
    }
};
initMap();

/**
 * @constructor
 * gets weather info from the Yahoo weather API given the predefined location
 * passes weather condition info to the getWeatherInfo
 */
var currentWeather;
var getWeather = function() {
    var weatherPlace = "piran";
    var locationQuery = escape("select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + weatherPlace + "') and u='c'");
    var  weatherAPI = "http://query.yahooapis.com/v1/public/yql?q=" + locationQuery + "&format=json&callback=?";
    $.getJSON( weatherAPI )
    .done( function(data) {
        currentWeather = data.query.results.channel.item.condition;
        getWeatherInfo(currentWeather);
    })
    .fail( function() {
        console.log("no weather");
    });
};
getWeather();


/**
 * function that constructs the Flickr API call
 * @param {dictionary} data - one dictionariy info form the list of locations
 * creates one Place object with the predefined info
 * makes latlng and markers for google maps from given info
 */
var refreshPhotos = function() {
    var flickerAPI = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=475b3ad500b92ed51c6657bb3ebd262e&jsoncallback=?';
    $.getJSON( flickerAPI, {
        // takes photoSearch parameter either from searches or clicks on markers
        tags: photoSearch,
        format: 'json',
        text: "-woman, -man, -portrait, -wedding, -esuli, -car, -people, -pirat",
        tag_mode: 'all'    })
    .done( function(data) {
        // when done runs the function that was returned with its data
        jsonFlickrApi(data);
    })
    .fail(
        // there seems to be a proble with this fail
        // when fails gives the message
        function(d, textStatus, error) {
        errorMessage = true;
        console.error("getJSON failed, status: " + textStatus + ", error: "+error);
    });
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
    this.activities = data.activities;

    this.latlng = new google.maps.LatLng(this.coordinates[0], this.coordinates[1]);
    this.marker = new google.maps.Marker({
        position: this.latlng,
        title: this.name,
        icon: "img/sea.png"
    });
};


var locationsToUse; // TODO UNDERSTAND to be used among all the functions in the file. Is this how it is done? What is a better way?

// keyword to input into the api search
var photoSearch = "istria";

/**
 * @constructor (what does this mean actually)
 * knockout ViewModel that connects delivers the info from one area to another
 */
var ViewModel = function() {
    // making this accessable
    var self = this;

    // defining and populating the observable locationsArray
    self.locationsArray = ko.observableArray([]);
    locations.forEach(function(place) {
        self.locationsArray.push(
            new Place(place));
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
        photoSearch = "";
        self.visibleLocations.removeAll();
        // loop through exisiting locations and add those fitting standards to visible locations

        locationsArray().forEach(function(place) {
            // true if search string is part of name or description of location
            if ( place.name.toLowerCase().indexOf(location) > -1 || place.description.indexOf(location) > -1) {
                // TODO MAYBE something about details search
                self.visibleLocations.push(place);
                place.marker.setMap(map);
                photoSearch += place.name + ", ";
                // kinda crappy to go through thes last steps each time, no?
            }
            // if no search fits show no markers
            else if ( place.name.toLowerCase().indexOf(location.toLowerCase()) === -1 ) {
                place.marker.setMap(null);
            }
        });
        // shows a generic term when either all are selected or none
        if ( visibleLocations().length === locations.length ) {
            self.displayMessage(false);
            photoSearch = "istrien";
        } else if ( visibleLocations().length === 0 ) {
            photoSearch = "istria";
        }
        return visibleLocations();
    };
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
    };

    // is called when user clicks on one of the words in the list
    // sets of location array and photo refresh
    self.locationClick = function (location) {
        search = location.name.toLowerCase();
        showLocations(search);
        photoSearch = location.name;
        self.displayMessage(true);
        refreshPhotos();
    };

    // is called by the user clicking the "SHOW ALL"
    // refreshes the page to a "beggining" state
    self.refreshClick = function () {
        search = "";
        self.userInput("");
        infoWindow.close();
        showLocations(search);
        refreshPhotos();
    };

    self.visibleActivity = ko.observable([true,true,true,true]);

    // chose activity
    self.chooseActivity = function(activity, order) {
            self.visibleLocations.removeAll();
            locationsArray().forEach(function(place) {
                if ( place.activities.indexOf(activity) > -1 ) {
                    self.visibleLocations.push(place);
                    place.marker.setMap(map);
                }
                else if ( place.activities.indexOf(activity) === -1 ) {
                    place.marker.setMap(null);
                }
            });
            var visibility = [false,false,false,false]
            visibility[order] = true
            self.visibleActivity(visibility);
            //this only work across this step, if I do it directly, it doesn't update well
            self.visibleActivity()[order] = true;
            self.displayMessage(true);
            photoSearch = "istria, " + activity;
            refreshPhotos();

    };


    // initiating the weather image and temperature observables
    self.wheaterImage = ko.observable('');
    self.wheaterTemperature = ko.observable('');

    // is called by getWeather, that inputs data received by the weather API
    // takes weather info and puts it into the weather observables
    self.getWeatherInfo = function(currentWeather) {
        self.wheaterImage('http://l.yimg.com/a/i/us/we/52/'+ currentWeather.code +'.gif');
        self.wheaterTemperature(currentWeather.temp + "°C");
    };

    // observable used in the html, pupulated by the flickr api answer
    self.imagesArray = ko.observableArray([]);
    self.errorMessage = ko.observable(errorMessage);

    /**
     * Flickr api call translations to image info, for the scrollable display
     */
    self.jsonFlickrApi = function(info) {
        if (info.photos !== undefined) {
            // empties array
            self.imagesArray([]);
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
    };
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
                // TODO PROBLEM! infoWindow on top of everything, tried different ways to set zIndex, did not work.
                // TODO MAYBE move to the right if under locations list (how?)
            };
        }(place));
    });
};
makeInfoWindow();


// thankyous go to:
// http://stackoverflow.com/a/9525939
// http://stackoverflow.com/a/7819972
// http://stackoverflow.com/a/1505218
// http://jsfiddle.net/mythical/XJEzc/
// http://stackoverflow.com/a/23981970