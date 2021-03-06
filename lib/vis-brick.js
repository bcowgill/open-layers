// OpenLayers API docs
// http://dev.openlayers.org/apidocs/files/OpenLayers-js.html

var USE_GOOGLE_MAPS = false;
var POINT_SIZE = 2;
var CENTROID_COLOR = "navy";
var HEAT_COLOR = "lime";
var IP_COLOR = "purple";
var POINT_OPACITY = 0.5;
var MIN_BIN = 0;
var MAX_BIN = 10;
var MIN_RADIUS = 0;
var MAX_RADIUS = 10;

// Short names for openlayers object constructors
var oFeatureVector = OpenLayers.Feature.Vector,
	oGeometry = OpenLayers.Geometry,
	oRule = OpenLayers.Rule,
	oFilter = OpenLayers.Filter;

if (/use_google/.test(document.URL))
{
	USE_GOOGLE_MAPS = true;
	console.log("USE_GOOGLE_MAPS", USE_GOOGLE_MAPS);
}
var Matches;
POINT_SIZE = getIntFromURL("POINT_SIZE", POINT_SIZE);
MIN_BIN = getIntFromURL("MIN_BIN", MIN_BIN);
MAX_BIN = getIntFromURL("MAX_BIN", MAX_BIN);
MIN_RADIUS = getIntFromURL("MIN_RADIUS", MIN_RADIUS);
MAX_RADIUS = getIntFromURL("MAX_RADIUS", MAX_RADIUS);

Matches = document.URL.match(/point_opacity=(\d+)/);
if (Matches)
{
	POINT_OPACITY = parseInt(Matches[1]) / 100;
	POINT_OPACITY = POINT_OPACITY > 1 ? 1 : POINT_OPACITY;
	console.log("POINT_OPACITY", POINT_OPACITY);
}

// API key for http://openlayers.org. Please get your own at
// http://bingmapsportal.com/ and use that instead.
var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";

// Rendering of heat map image is a smidge off, so we adjust it
var NudgeHeatMapImage = [[8.75321,3.64412], [8.78068,3.75123]]; // africa Malabo
var NudgeHeatMapPoints = [[8.69932,3.70046], [8.77966,3.75402]]; // africa Malabo
var NudgeHeatMapPointsGoogle = [[8.69520,3.68009], [8.77760,3.72942]]; // africa Malabo
var DLON = 0, DLAT = 1;
var Delta = getDelta(NudgeHeatMapImage);
var DeltaHeatMapPoints = getDelta(NudgeHeatMapPoints);

function getDelta(aNudge)
{
	var Delta = [ aNudge[1][DLON] - aNudge[0][DLON], aNudge[1][DLAT] - aNudge[0][DLAT]];
	return Delta;
}

// No Fudge Nudge
if (USE_GOOGLE_MAPS)
{
	Delta = [0,0];
	DeltaHeatMapPoints = getDelta(NudgeHeatMapPointsGoogle);
}

console.log("Delta HeatMap Image LonLat: ", Delta);

// Center on the UK originally
var oLonLatUK= new OpenLayers.LonLat(-3.65, 54.23);
var oLonLatUKLondon= new OpenLayers.LonLat(-0.14536, 51.50541);
var oLonLatStart = oLonLatUKLondon;

var projLonLat = new OpenLayers.Projection("EPSG:4326");
var projSphMerc = new OpenLayers.Projection("EPSG:900913");
var oSphMercStart = new OpenLayers.LonLat(oLonLatStart.lon, oLonLatStart.lat);
oSphMercStart.transform(projLonLat, projSphMerc);
console.log("oSphMercStart: ", oSphMercStart);

var layerCentroids = getCentroidFeatures(CentroidsLatLon);
var layerHeatMap = getHeatMapFeatures(HeatMapUK, MIN_BIN, MAX_BIN);
var layerStaticIp = getStaticIpFeatures(StaticIPLatLonRadiusMeters, MIN_RADIUS, MAX_RADIUS);

function getIntFromURL(name, defaultValue)
{
	var value = defaultValue, regex = new RegExp(name + "=(\\d+)", "i"), Matches = document.URL.match(regex);
	if (Matches)
	{
		value = parseInt(Matches[1]);
	}
	console.log(name, value);
	return value;
}

function getFeature(lon, lat)
{
	var oPt = new oGeometry.Point(lon, lat),
		oFeature = new oFeatureVector(oPt);
	if (USE_GOOGLE_MAPS)
	{
		oPt.transform(projLonLat, projSphMerc);
	}
	return oFeature;
}

function getStyle(color)
{
	// create rule based styles
	var oStyle = new OpenLayers.Style({
		pointRadius: POINT_SIZE,
		strokeWidth: 0.5,
		strokeOpacity: 0.7,
		strokeColor: "#ffcc66",
		fillColor: color,
		fillOpacity: POINT_OPACITY
	}, {
		rules: [
		new oRule({
			elseFilter: true,
				symbolizer: {
					graphicName: "circle"
				}
		})
		]
	});
	return oStyle;
}

// Populate centroids layer with features
function getCentroidFeatures(aCentroidsLatLon)
{
	var aCentroids = [], oFeature, layerCentroids,
		LAT = 0,
		LON = 1,
		idx;
	for (idx = aCentroidsLatLon.length - 1; idx >= 0; --idx)
	{
		if (aCentroidsLatLon[idx].length)
		{
			oFeature = getFeature(aCentroidsLatLon[idx][LON], aCentroidsLatLon[idx][LAT]);
			aCentroids.push(oFeature);
		}
	}

	layerCentroids = new OpenLayers.Layer.Vector(
		"Centroids", {
			styleMap: new OpenLayers.StyleMap({
				"default": getStyle(CENTROID_COLOR),
				select: {
					fillColor: "red",
					pointRadius: POINT_SIZE + 2,
					strokeColor: "yellow",
					strokeWidth: 1
				}
			}),
			isBaseLayer: false,
			renderers: ["Canvas"]
		});
	layerCentroids.addFeatures(aCentroids);
	return layerCentroids;
}

// Create a layer with heat map points within a given range
function getHeatMapFeatures(oHeatMapInfo, minValue, maxValue)
{
	var idx, value, length,
		oFeature, aHeatMap = [], layerHeatMap,
		color, green, myDelta = DeltaHeatMapPoints;
	console.log("Delta HeatMap Points LonLat", myDelta);
	for (value = maxValue; value >= minValue; value--)
	{
		if (oHeatMapInfo.values.hasOwnProperty(value) && (length = oHeatMapInfo.values[value].length))
		{
			for (idx = 0; idx < length; idx++)
			{
				oFeature = getFeature(oHeatMapInfo.values[value][idx].lon + myDelta[DLON], oHeatMapInfo.values[value][idx].lat + myDelta[DLAT]);
				aHeatMap.push(oFeature);
			}
		}
	}
	color = HEAT_COLOR;
	layerHeatMap = new OpenLayers.Layer.Vector(
		"HeatMap Points", {
			styleMap: new OpenLayers.StyleMap({
				"default": getStyle(color),
					select: {
						fillColor: "red",
						pointRadius: POINT_SIZE + 2,
						strokeColor: "yellow",
						strokeWidth: 1
					}
			}),
			isBaseLayer: false,
			renderers: ["Canvas"]
		});
	console.log("Heat Map Points", minValue, maxValue, aHeatMap.length);
	layerHeatMap.addFeatures(aHeatMap);
	return layerHeatMap;
}

function getStaticIpFeatures(aStaticIpLatLon, minRadius, maxRadius)
{
	// var StaticIPLatLonRadiusMeters = [
	// ["1.0.130.142",14.522523,100.936730,0.00],
	var idx, radius, theMaxRadius =  0,
		LAT = 1, LON = 2, RADIUS = 3,
		oFeature, myDelta = [0, 0], aStaticIp = [];
	console.log("Delta Static Ip LonLat", myDelta);
	for (idx = aStaticIpLatLon.length - 1; idx >= 0; idx--)
	{
		if (aStaticIpLatLon[idx].length)
		{
			radius = aStaticIpLatLon[idx][RADIUS];
			if (radius > theMaxRadius)
			{
				theMaxRadius = radius;
			}
			if (minRadius <= radius && radius <= maxRadius)
			{
				oFeature = getFeature(aStaticIpLatLon[idx][LON] + myDelta[DLON], aStaticIpLatLon[idx][LAT] + myDelta[DLAT]);
				aStaticIp.push(oFeature);
			}
		}
	}
	console.log("static ip min/max range, max radius found, points", minRadius, maxRadius, theMaxRadius, aStaticIp.length);
	layerStaticIp = new OpenLayers.Layer.Vector(
		"Static IPs", {
			styleMap: new OpenLayers.StyleMap({
				"default": getStyle(IP_COLOR),
					select: {
						fillColor: "red",
						pointRadius: POINT_SIZE + 2,
						strokeColor: "yellow",
						strokeWidth: 1
					}
			}),
			isBaseLayer: false,
			renderers: ["Canvas"]
		});
	layerStaticIp.addFeatures(aStaticIp);
	return layerStaticIp;
}

var bounds;
if (USE_GOOGLE_MAPS)
{
	bounds = new OpenLayers.Bounds(-180, -89, 180, 89);
	bounds.transform(projLonLat, projSphMerc);
}
else
{
	bounds = new OpenLayers.Bounds(-180 + Delta[DLON], -90 + Delta[DLAT], 180 + Delta[DLON], 90 + Delta[DLAT]);
}
var layerImageHeatMap = new OpenLayers.Layer.Image(
	"HeatMap Image",
	"../data/davide-map.v6.png",
	bounds,
	new OpenLayers.Size(3600,1800),
	{
		numZoomLevels: 20,
		isBaseLayer: false
	});

var MapOptions = {
	div: "map"
};
var map = new OpenLayers.Map(MapOptions);

if (USE_GOOGLE_MAPS)
{
	map.projection = "EPSG:900913";
	map.displayProjection = "EPSG:4326";
	map.addLayers([
		// create Google Mercator layers
		new OpenLayers.Layer.Google(
			"Google Physical",
			{type: google.maps.MapTypeId.TERRAIN}
		),
		new OpenLayers.Layer.Google(
			"Google Streets", // the default
			{numZoomLevels: 20}
		),
		new OpenLayers.Layer.Google(
			"Google Hybrid",
			{type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
		),
		new OpenLayers.Layer.Google(
			"Google Satellite",
			{type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
		),
		// Create Bing Mercator layers
		new OpenLayers.Layer.Bing({
			key: apiKey,
			type: "Road",
			wrapDateLine: true
		}),
		new OpenLayers.Layer.Bing({
			key: apiKey,
			type: "Aerial",
			wrapDateLine: true
		}),
		new OpenLayers.Layer.Bing({
			key: apiKey,
			type: "AerialWithLabels",
			wrapDateLine: true
		}),
		// Create Open street map layer
		new OpenLayers.Layer.OSM("Open Street Map"),

		layerHeatMap,
		layerStaticIp,
		layerCentroids
	]);
	map.numZoomLevels = 18;
	map.zoomDuration = 10;
	map.setCenter(oSphMercStart, 6);
//	map.zoomToMaxExtent();
}
else
{
	map.addLayers([
		new OpenLayers.Layer.WMS("OpenLayers WMS",
			"http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'}),

		// Geopole street map max zoom 12 levels
		new OpenLayers.Layer.WMS("Blue Marble","http://maps.opengeo.org/geowebcache/service/wms?TILED=true&",{layers : "bluemarble"}),

		new OpenLayers.Layer.TMS("Geopole Street Map","http://tms.geopole.org/",{type : "png",attribution : "Map data <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CCBYSA</a> 2009 <a href=\"http://openstreetmap.org/\">OpenStreetMap.org</a>",layername : "geopole_street",maxResolution : 0.703125}),

		layerImageHeatMap,
		layerHeatMap,
		layerStaticIp,
		layerCentroids
	]);

	map.numZoomLevels = 12;
	map.zoomDuration = 10;
	map.setCenter(oLonLatStart, 6);
}

map.addControls([
	new OpenLayers.Control.Navigation({
		dragPanOptions: {
			enableKinetic: true
		}
	}),
	new OpenLayers.Control.PanZoom(),
		new OpenLayers.Control.Attribution(),
		new OpenLayers.Control.MousePosition({
			prefix: '<div class="mouse-coords">',
			separator: ' lon, ',
			suffix: ' lat</div>',
			numDigits: 5
		}),
	new OpenLayers.Control.LayerSwitcher()
]);

var selectCentroid = new OpenLayers.Control.SelectFeature(layerCentroids);
map.addControl(selectCentroid);
selectCentroid.activate();

//
// create some sample features
/*
 *	new Feature(new Geometry.Point(-90, 45)),
 *	new Feature(
 *		new Geometry.Point(0, 45),
 *		{cls: "one"}
 *	),
 *	new Feature(
 *		new Geometry.Point(90, 45),
 *		{cls: "two"}
 *	),
 *	new Feature(
 *		Geometry.fromWKT("LINESTRING(-110 -60, -80 -40, -50 -60, -20 -40)")
 *	),
 *	new Feature(
 *		Geometry.fromWKT("POLYGON((20 -20, 110 -20, 110 -80, 20 -80, 20 -20), (40 -40, 90 -40, 90 -60, 40 -60, 40 -40))")
 *	)
 */

// make a flipbox handler function which changes the flip direction after
// it returns to the front facing side.
function makeFlipHandler(delay)
{
	var timer = undefined, Directions = ["right", "up", "left", "down"];
	delay = delay || 500;
	return function ()
	{
		var self = this, flipped = self.hasAttribute('flipped');
		if (flipped && !timer)
		{
			timer = setInterval(function () {
				var idx = Directions.indexOf(self.getAttribute('direction'));
				clearInterval(timer);
				timer = undefined;
				if (++idx >= Directions.length)
				{
					idx = 0;
				}
				self.setAttribute("direction", Directions[idx]);
			}, delay);
		}
		self.toggle();
	};
}

function activateFlipButtons(flipBox)
{
	var buttons = xtag.query(flipBox, 'button.flip');
	fnFlip = makeFlipHandler().bind(flipBox);

	buttons.forEach(function (element)
	{
		element.addEventListener("click", fnFlip);
	});
}

/* When components are ready, activate them */
document.addEventListener('DOMComponentsLoaded', function(){
	activateFlipButtons(document.getElementById("map-flipbox"));
});

