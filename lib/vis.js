// OpenLayers API docs
// http://dev.openlayers.org/apidocs/files/OpenLayers-js.html

var USE_GOOGLE_MAPS = false;
var POINT_SIZE = 2;
var CENTROID_COLOR = "navy";
var POINT_OPACITY = 0.5;

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
var Matches = document.URL.match(/point_size=(\d+)/);
if (Matches)
{
	POINT_SIZE = parseInt(Matches[1]);
	console.log("POINT_SIZE", POINT_SIZE);
}
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

// Rendering of heat map is a smidge off, so we adjust it
//                heatmap              map
var Nudge1 = [[-1.1508,59.7162], [-1.2881,59.8535]]; // uk no island Scalloway
//                heatmap               map
var Nudge2 = [[1.4392,51.2867], [1.4392,51.3995]]; // uk se corner westgate-on-sea
var Nudge3 = [[-1.1485,51.2867], [-1.2899,51.3995]]; // uk combo of 1 and 2
var Nudge = [[8.75321,3.64412], [8.78068,3.75123]]; // africa Malabo
var Delta = [ Nudge[1][0] - Nudge[0][0], Nudge[1][1] - Nudge[0][1]];
//Delta[0] /= 2;

// No Fudge Nudge
if (USE_GOOGLE_MAPS)
{
	Delta = [0,0];
}
console.log("Delta LonLat: ", Delta);

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
var layerHeatMap = getHeatMapFeatures(HeatMapUK, 0, 10);

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

// Populate centroids layer with features
function getCentroidFeatures(aCentroidsLatLon)
{
	var aCentroids = [], oStyle, oFeature, layerCentroids,
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

	// create rule based styles
	oStyle = new OpenLayers.Style({
		pointRadius: POINT_SIZE,
		strokeWidth: 0.5,
		strokeOpacity: 0.7,
		strokeColor: "#ffcc66",
		fillColor: CENTROID_COLOR,
		fillOpacity: POINT_OPACITY
	}, {
		rules: [
		new oRule({
			filter: new oFilter.Comparison({
				type: "==",
				property: "cls",
				value: "one"
			}),
			symbolizer: {
				externalGraphic: "../openlayers/img/marker-blue.png"
			}
		}),
		new oRule({
			filter: new oFilter.Comparison({
				type: "==",
				property: "cls",
				value: "two"
			}),
			symbolizer: {
				externalGraphic: "../openlayers/img/marker-green.png"
			}
		}),
		new oRule({
			elseFilter: true,
				symbolizer: {
					graphicName: "circle"
				}
		})
		]
	});
	layerCentroids = new OpenLayers.Layer.Vector(
		"Centroids", {
			styleMap: new OpenLayers.StyleMap({
				"default": oStyle,
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
	var idx, value, length, oFeature, aHeatMap = [];
	for (value = maxValue; value >= maxValue; value--)
	{
		if (oHeatMapInfo.values.hasOwnProperty(value) && (length = oHeatMapInfo.values[value].length))
		{
			for (idx = 0; idx < length; idx++)
			{
				oFeature = getPoint(oHeatMapInfo.values[value][idx].lon, oHeatMapInfo.values[value][idx].lat);
				aHeatMap.push(oFeature);
			}
		}
	}
}

var bounds;
if (USE_GOOGLE_MAPS)
{
	bounds = new OpenLayers.Bounds(-180, -89, 180, 89);
	bounds.transform(projLonLat, projSphMerc);
}
else
{
	bounds = new OpenLayers.Bounds(-180 + Delta[0], -90 + Delta[1], 180 + Delta[0], 90 + Delta[1]);
}
var layerImageHeatMap = new OpenLayers.Layer.Image(
	"HeatMap",
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

//		layerHeatMap,
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
