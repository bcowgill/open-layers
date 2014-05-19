// OpenLayers API docs
// http://dev.openlayers.org/apidocs/files/OpenLayers-js.html

var USE_GOOGLE_MAPS = true;

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
//Delta = [0,0];
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
//
// create some sample features
var Feature = OpenLayers.Feature.Vector;
var Geometry = OpenLayers.Geometry;
var features = [
	new Feature(new Geometry.Point(-90, 45)),
	new Feature(
		new Geometry.Point(0, 45),
		{cls: "one"}
	),
	new Feature(
		new Geometry.Point(90, 45),
		{cls: "two"}
	),
	new Feature(
		Geometry.fromWKT("LINESTRING(-110 -60, -80 -40, -50 -60, -20 -40)")
	),
	new Feature(
		Geometry.fromWKT("POLYGON((20 -20, 110 -20, 110 -80, 20 -80, 20 -20), (40 -40, 90 -40, 90 -60, 40 -60, 40 -40))")
	)
];

if (USE_GOOGLE_MAPS)
{
	var idx;
	for (idx = features.length - 1; idx >= 0; --idx)
	{
		var feature = features[idx];
		var geometry = feature.geometry;
		geometry.transform(projLonLat, projSphMerc);
	}
}

// create rule based styles
var Rule = OpenLayers.Rule;
var Filter = OpenLayers.Filter;
var style = new OpenLayers.Style({
	pointRadius: 10,
	strokeWidth: 3,
	strokeOpacity: 0.7,
	strokeColor: "navy",
	fillColor: "#ffcc66",
	fillOpacity: 1
}, {
	rules: [
		new Rule({
			filter: new Filter.Comparison({
				type: "==",
				property: "cls",
				value: "one"
			}),
			symbolizer: {
				externalGraphic: "../openlayers/img/marker-blue.png"
			}
		}),
		new Rule({
			filter: new Filter.Comparison({
				type: "==",
				property: "cls",
				value: "two"
			}),
			symbolizer: {
				externalGraphic: "../openlayers/img/marker-green.png"
			}
		}),
		new Rule({
			elseFilter: true,
			symbolizer: {
				graphicName: "circle"
			}
		})
	]
});

var layerFeatures = new OpenLayers.Layer.Vector(
	"Heatmap", {
		styleMap: new OpenLayers.StyleMap({
			"default": style,
			select: {
				fillColor: "red",
				pointRadius: 13,
				strokeColor: "yellow",
				strokeWidth: 3
			}
		}),
		isBaseLayer: false,
		renderers: ["Canvas"]
	});
layerFeatures.addFeatures(features);

var layerHeatMap = new OpenLayers.Layer.Image(
	"HeatMap Dark",
	"../data/davide-map.v6.png",
	new OpenLayers.Bounds(-180 + Delta[0], -90 + Delta[1], 180 + Delta[0], 90 + Delta[1]),
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
		layerFeatures
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

		layerHeatMap,
		layerFeatures
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

var select = new OpenLayers.Control.SelectFeature(layerFeatures);
map.addControl(select);
select.activate();

