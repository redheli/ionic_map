// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
 
  $stateProvider
  .state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });
 
  $urlRouterProvider.otherwise("/");
 
})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation) {
  
  $scope.$on("$stateChangeSuccess", function() {

      var mainMarker = {
            lat: 20.6219444444,
            lng: -105.228333333,
            focus: true,
            message: "Puerto Vallarta, MX",
            draggable: false};

      $scope.map = {
          defaults: {
              tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
              maxZoom: 18,
              zoomControlPosition: 'bottomleft'},
          center: {
              lat : 20.6219444444,
              lng : -105.228333333,
              zoom : 15},
          markers: {
              mainMarker: angular.copy(mainMarker)}
      };

  });
  
  
  var options = {timeout: 10000, enableHighAccuracy: true};
 
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
 
    var init_lat = 1.3552799//42.299228067198634;
var init_lng = 103.6945413;//-83.69717033229782;
var mymap = L.map('map').setView([init_lat,init_lng], 15);
 $scope.map = mymap;
mymap.options.maxZoom = 22;



var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
var ggl = new L.Google();
var ggl2 = new L.Google('TERRAIN');
mymap.addLayer(ggl);

var id_=0;
// add pbf layer
//Highly experimental Mapnik Vector Tiles PBFLayer
var pbfSource = new L.TileLayer.PBFSource({
    url: 'http://localhost:3001/services/postgis/cleantech/geom/vector-tiles/{z}/{x}/{y}.pbf?fields=name',
    debug: false,
    maxZoom: 22,
    minZoom: 6,
    clickableLayers: [],
    getIDForLayerFeature: function(feature) {
      //console.log('r '+feature.properties.r);
      //console.log('name '+feature.properties.name);
        return feature.properties.name;//feature.coordinates[0][0].x;
    },
     /**
     * The filter function gets called when iterating though each vector tile feature (vtf). You have access
     * to every property associated with a given feature (the feature, and the layer). You can also filter
     * based of the context (each tile that the feature is drawn onto).
     *
     * Returning false skips over the feature and it is not drawn.
     *
     * @param feature
     * @returns {boolean}
     */
    filter: function(feature, context) {
        return true;
    }
});

//Globals that we can change later.
var fillColor = 'rgba(200,200,200,0.4)';
var strokeColor = 'rgb(20,20,20)';

pbfSource.styleFor = pbfStyle;
pbfSource.maxZoom = 22;
function pbfStyle(feature) {
    var style = {};
    var type = feature.type;
    //console.log(feature.properties);
    switch (type) {
        case 1: //'Point'
	  r = feature.properties.name;
	  //console.log(r);
            style.color = 'rgba(' + r +',' + r + ','+r+',1)';
// 	    if(r<150){
// 	       style.color = 'rgba(0,255,0,0.5)';
// 	    }
// 	    if(r>150){
// 	       style.color = 'rgba(255,255,0,0.5)';
// 	    }
	    if(mymap.getZoom()>18){
	      style.radius = 20;
	    }
	    else
	    {
	      style.radius = 0.5;
	    }
    }
    return style;
}

var style = {
  "version": 8,
  "sources": {
    "countries": {
      "type": "vector",
      "tiles": ["http://localhost:3001/services/postgis/cleantech2/geom/vector-tiles/{z}/{x}/{y}.pbf"],
      "maxzoom": 22
    }
  },
  "layers": [{
    "id": "mcity_ped_crossing1",
    "type": "fill",
    "source": "countries",
    "source-layer": "Ken_CountyWithWater",
    "paint": {
      "fill-color": "#00ff00",
      "fill-opacity":0.5
    }
  },{
    "id": "mcity_ped_crossing2",
    "type": "fill",
    "source": "countries",
"filter":["in","COUNTY",'Baringo','ASM','ATF','BD'],
    "source-layer": "Ken_CountyWithWater",
    "paint": {
      "fill-color": "#ffff00",
      "fill-opacity":0.5
    }
  }]
};

//Add layer
// mymap.addLayer(pbfSource);

mymap.on('zoomend', function() {
    console.log('zoom'+mymap.getZoom())
});


//////
var mvtSource = new L.TileLayer.MVTSource({
  url: "http://192.168.1.111:3001/services/postgis/cleantech/geom/vector-tiles/{z}/{x}/{y}.pbf?fields=name",
  debug: true,
  clickableLayers: [],
  maxZoom: 22,
    minZoom: 6,
  getIDForLayerFeature: function(feature) {
    return "";//feature.properties.name;//feature.properties.id;
  },

  /**
   * The filter function gets called when iterating though each vector tile feature (vtf). You have access
   * to every property associated with a given feature (the feature, and the layer). You can also filter
   * based of the context (each tile that the feature is drawn onto).
   *
   * Returning false skips over the feature and it is not drawn.
   *
   * @param feature
   * @returns {boolean}
   */
  filter: function(feature, context) {
//     if (feature.layer.name === 'GAUL0') {
      return true;
//     }
//     return false;
  },

  style: function (feature) {
    var style = {};

    var type = feature.type;
    switch (type) {
      case 1: //'Point'
        style.color = 'rgba(49,79,79,1)';
        style.radius = 0.5;
        style.selected = {
          color: 'rgba(255,255,0,0.5)',
          radius: 6
        };
        break;
      case 2: //'LineString'
        style.color = 'rgba(161,217,155,0.8)';
        style.size = 3;
        style.selected = {
          color: 'rgba(255,25,0,0.5)',
          size: 4
        };
        break;
      case 3: //'Polygon'
        style.color = fillColor;
        style.outline = {
          color: strokeColor,
          size: 1
        };
        style.selected = {
          color: 'rgba(255,140,0,0.3)',
          outline: {
            color: 'rgba(255,140,0,1)',
            size: 2
          }
        };
        break;
    }
    return style;
  }

});

//Add layer
mymap.addLayer(mvtSource);

//////
var ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';
/*var gl = L.mapboxGL({
    accessToken: ACCESS_TOKEN,
    style: style
}).addTo(mymap);
*/

osm.maxZoom = 22;
ggl.maxZoom = 22;
ggl2.maxZoom = 22;
mymap.addControl(new L.Control.Layers( {'OSM':osm, 'Google':ggl, 'Google Terrain':ggl2,'cleantech':pbfSource}, {}));

  }, function(error){
    console.log("Could not get location");
  });
});