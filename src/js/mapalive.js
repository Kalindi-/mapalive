
/**
 * JS file for mapalive project, containing map, predefined keywords search functionality, and Flickr api.
 */
"use strict";
// yaay!

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
        description : "looks nice from above, and from the sea, and there is plenty of both",
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
        description : "sweet round hill, with endless views and wind, and cliffs looking like big rock whales",
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
var bounds;
var initMap = function() {
    if (google !== undefined) {
        map = new google.maps.Map(document.getElementById('map'), {
            mapTypeId: google.maps.MapTypeId.HYBRID,
            mapTypeControl: false,
        });
        bounds = new google.maps.LatLngBounds();
        // looping through the location
        locations.forEach(function(location) {
            var latlngBound = new google.maps.LatLng(location.coordinates[0], location.coordinates[1]);
            bounds.extend(latlngBound);
        });
        map.fitBounds(bounds);
    }
};


/**
 * function that constructs the Flickr API call
 * @param {dictionary} data - one dictionariy info form the list of locations
 * creates one Place object with the predefined info
 * makes latlng and markers for google maps from given
 */
var Place = function(data) {
    // hardcoded data
    this.name = data.name;
    this.coordinates = data.coordinates;
    this.description = data.description;
    this.activities = data.activities;
    // data transformed into google usables
    this.latlng = new google.maps.LatLng(this.coordinates[0], this.coordinates[1]);
    this.marker = new google.maps.Marker({
        position: this.latlng,
        title: this.name,
        icon: "img/sea.png"
    });
};


// initializing keyword to input into the api search into the global scope
var photoSearch = "istria";

/**
 * @constructor
 * knockout ViewModel that connects delivers the info from one area to another
 */
var ViewModel = function() {

    // making this accessable
    var self = this;

    // initializing locations to use
    self.locationsToUse = ko.observableArray();

    // defining and populating the observable locationsArray
    self.locationsArray = ko.observableArray([]);
    locations.forEach(function(place) {
        self.locationsArray.push(
            new Place(place));
    });

    /**
     * @constructor
     * gets weather info from the Yahoo weather API given the predefined location
     * passes weather condition info to the getWeatherInfo
     */
    var currentWeather;
    self.getWeather = function() {
        var weatherPlace = "piran";
        var locationQuery = escape("select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + weatherPlace + "') and u='c'");
        var weatherAPI = "http://query.yahooapis.com/v1/public/yql?q=" + locationQuery + "&format=json&callback=?";
        $.getJSON( weatherAPI )
        .done( function(data) {
            currentWeather = data.query.results.channel.item.condition;
            self.getWeatherInfo(currentWeather);
        })
        .fail( function() {
            self.getWeatherInfo({code: "3200", temp: "??"});
        });
    };

    // initializing observables used in the html
    self.visibleLocations = ko.observableArray([]);
    self.userInput =  ko.observable('');
    self.refreshMessage = ko.observable(false);
    self.visibleActivity = ko.observable([true,true,true,true]);

    // determine the visible locations, show markers and list accordingly,
    // if text search show locations that fit the search
    var search = "";
    self.showLocations = function(location) {
        // remove all visible locations
        photoSearch = "";
        self.visibleLocations.removeAll();

        // loops through exisiting locations and add those fitting standards to visible locations
        self.locationsArray().forEach(function(place) {
            // true if search string is part of name or description of location
            if ( place.name.toLowerCase().indexOf(location) > -1 || place.description.indexOf(location) > -1) {
                // TODO MAYBE something about details search
                self.visibleLocations.push(place);
                place.marker.icon = 'img/sea.png';
                place.marker.setMap(map);
                photoSearch = place.name;
                // kinda crappy to go through thes last steps each time, no?
            }
            // if no search fits show no markers
            else if ( place.name.toLowerCase().indexOf(location.toLowerCase()) === -1 ) {
                place.marker.setMap(null);
            }
        });
        // shows a generic term when either all are selected or none
        if ( self.visibleLocations().length === locations.length ) {
            self.refreshMessage(false);
            photoSearch = "istra";
        } else if ( self.visibleLocations().length === 0 ) {
            photoSearch = "istria";
        }
        return self.visibleLocations();
    };

    self.showList = ko.observable(true);
    self.toggleVisibility = function() {
        self.showList(!self.showList());
    };

    /**
     * function that constructs the Flickr API call
     * @param {dictionary} data - one dictionariy info form the list of locations
     * creates one Place object with the predefined info
     * makes latlng and markers for google maps from given info
     */

    self.refreshPhotos = function() {
        var flickerAPI = 'https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=475b3ad500b92ed51c6657bb3ebd262e&jsoncallback=?';
        $.getJSON( flickerAPI, {
            // takes photoSearch parameter either from searches or clicks on markers
            tags: photoSearch,
            format: 'json',
            text: "-woman, -man, -portrait, -wedding, -esuli, -car, -people, -pirat, -dubrovačkoneretvanskažupanija, -dubrovnik",
            tag_mode: 'all'    })
        .done( function(data) {
            // make image for inforwindow. TODO PROBLEM, it uses the image of the previous search
            var image = data.photos.photo[0];
            self.photo = ko.observable('http://farm'+ image.farm +'.static.flickr.com/'+ image.server +'/'+ image.id +'_'+ image.secret +'_m.jpg');
            // when done runs the function that was returned with its data
            self.jsonFlickrApi(data);
        })
        .fail(
            function(d, textStatus, error) {
            self.photoErrorMessage(true);
        });
    };

    // sets the location based on the search
    self.locationsToUse(self.showLocations(search));

    // variables that deal with keywords to appear under the search bar during searching
    self.descriptionWords = ko.observableArray();
    self.showWords = ko.observableArray();

    // collect all words from description into descriptionWords.
    var allText = "";
    self.locationsArray().forEach(function(place) {
            allText += place.description.replace(",", "").split(" ") + ",";
        });
    self.descriptionWords.push(allText.split(","));

    // is called when the user input something in the search bar,
    // sets of location array and photo refresh
    // and puts the possible keywords into showWords
    self.availableLocations = function() {
        self.showWords("");
        self.visibleActivity([true,true,true,true]);
        search = self.userInput().toLowerCase();
        self.refreshMessage(true);
        self.showLocations(search);
        self.refreshPhotos();
        self.showWords([]);
        self.descriptionWords()[0].forEach(function(word) {
            if ( word.indexOf(search) > -1 && self.showWords().indexOf(word) === -1) {
                self.showWords.push(word);
            }
            // TODO PROBLEM, i understand it to be a confusing set of "autocomplete" suggestions.
            // And thans for the jQuerry link, but i was a bit excited to try to find a
            // sloution withing knockout, so tips welcome.
        });
    };

    // is called when user clicks on one of the words in the list
    // sets of location array and photo refresh
    self.locationClick = function (location) {
        self.visibleActivity([true,true,true,true]);
        search = location.name.toLowerCase();
        self.showLocations(search);
        google.maps.event.trigger(location.marker, 'click');
        photoSearch = location.name;
        self.refreshMessage(true);
        self.refreshPhotos();
    };

    // is called by the user clicking the "SHOW ALL"
    // refreshes the page to a "beggining" state
    self.refreshClick = function () {
        self.visibleActivity([true,true,true,true]);
        search = "";
        self.showWords([]);
        self.userInput("");
        infoWindow.close();
        self.showLocations(search);
        self.refreshPhotos();
    };

    // it shows the locations based on the keyword clicked.
    self.searchWord = function(word) {
       self.userInput(word);
       self.availableLocations();
    };

    // choosing activity by clicking one of the images.
    // The selected activity is true all else are false.
    // if none are selcted all are true
    self.chooseActivity = function(activity, order) {
        self.visibleLocations.removeAll();
        self.locationsArray().forEach(function(place) {
            if ( place.activities.indexOf(activity) > -1 ) {
                self.visibleLocations.push(place);
                place.marker.icon = 'img/'+ activity +'.png';
                place.marker.setMap(map);
            }
            else if ( place.activities.indexOf(activity) === -1 ) {
                place.marker.setMap(null);
            }
        });
        var visibility = [false,false,false,false];
        visibility[order] = true;
        self.visibleActivity(visibility);
        //TODO UNDERSTAND PROBLEM this only work across this step, if I do it directly, it doesn't update well
        self.refreshMessage(true);
        photoSearch = 'istria, ' + activity;
        self.refreshPhotos();
        infoWindow.close();
        map.fitBounds(bounds);
        self.userInput('');
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
    self.photo = ko.observable();
    self.imagesArray = ko.observableArray([]);
    self.photoErrorMessage = ko.observable(false);

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
         }
    };


    // This uses firebase to keep track of users online at the moment
    // starts off with 0 and adds 1 for each online user
    // TODO UNDERSTAND more about firebase
    self.usersOnline = ko.observable(0);
    self.getUsers = function() {
        // make a new list into firebase
        var listRef = new Firebase("https://blinding-fire-8036.firebaseio.com/presence/");
        // put a user into the list
        var userRef = listRef.push();

        // Add to presence list when online.
        var presenceRef = new Firebase("https://blinding-fire-8036.firebaseio.com/.info/connected");
        presenceRef.on("value", function(snap) {
            // what is snap
            if (snap.val()) {
                userRef.set(true);
                // Remove when disconnected.
                userRef.onDisconnect().remove();
            }
        });
        // Number of online users is the number of objects in the presence list.
        listRef.on("value", function(snap) {
            self.usersOnline(snap.numChildren());
        });
    };

    self.getUsers();
    self.refreshPhotos();
    self.getWeather();
};

// initial call after google maps gets started
var vm;
function startAll() {
    initMap();
    vm = new ViewModel();
    ko.applyBindings(vm);
    makeInfoWindow();
}


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
    vm.locationsToUse().forEach(function(place) {
        google.maps.event.addListener(place.marker, 'click', function() {
            return function() {
                photoSearch = place.name;
                place.marker.setMap(null);
                place.marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    place.marker.setAnimation(null);
                }, 1850);
                place.marker.setMap(map);
                map.setCenter(place.marker.getPosition());
                vm.refreshMessage(true);
                vm.refreshPhotos();
                infoWindow.setContent('<h4>'+ place.name + '</h4> <p>' + place.description +  '<br><img  class="mini-img" alt="mini photo of place" src="'+ vm.photo()  +'">');
                // TODO PROBLEM I tried here to  open one of the images from the flickr api,
                // into the infowindow but I didnt manage ! Problem is it takes a little while
                // for flickr to load and then the image from the previous search gets loaded.
                // i also tried this: could this work somehow (i also tried the runafter) - got a bit lost
                // <!-- ko if: photo --> <img class="mini-img" alt="mini photo of place" data-bind=" attr: { src: photo() }"> <!-- /ko --></p>
                // help!
                infoWindow.open(map, this);
                // TODO PROBLEM! infoWindow on top of everything, tried different ways to set zIndex, did not work.
                // TODO MAYBE move to the right if under locations list (how?)
            };
        }(place));
    });
};


// thankyous go to:
// http://stackoverflow.com/a/9525939
// http://stackoverflow.com/a/7819972
// http://stackoverflow.com/a/1505218
// http://jsfiddle.net/mythical/XJEzc/
// http://stackoverflow.com/a/23981970
// http://stackoverflow.com/a/15982583
// http://jsfiddle.net/FgVxY/4/
// and my reviewer, Ryan Vrba!