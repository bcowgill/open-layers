// create some sample features

var oLonLatUK= new OpenLayers.LonLat(-3.65, 54.23);

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

var layer = new OpenLayers.Layer.Vector(
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
layer.addFeatures(features);

var map = new OpenLayers.Map({
	div: "map",
	layers: [
/*		new OpenLayers.Layer.OSM("Street Map"),
		new OpenLayers.Layer.OSM("Street Map (buff)", null, {buffer: 2}),
*/
		new OpenLayers.Layer.WMS("OpenLayers WMS",
			"http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'}),
		new OpenLayers.Layer.WMS("Blue Marble","http://maps.opengeo.org/geowebcache/service/wms?TILED=true&",{layers : "bluemarble"}),
		new OpenLayers.Layer.TMS("Geopole Street Map","http://tms.geopole.org/",{type : "png",attribution : "Map data <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CCBYSA</a> 2009 <a href=\"http://openstreetmap.org/\">OpenStreetMap.org</a>",layername : "geopole_street",maxResolution : 0.703125}),
		new OpenLayers.Layer.Image(
			"HeatMap Dark", "../data/latlong-update-transparent.png",
			new OpenLayers.Bounds(-180, -90, 180, 90),
			new OpenLayers.Size(3600,1800),
			{
				numZoomLevels: 20,
				isBaseLayer: false
			}),
		layer
	],
	controls: [
		new OpenLayers.Control.Navigation({
			dragPanOptions: {
				enableKinetic: true
			}
		}),
		new OpenLayers.Control.PanZoom(),
		new OpenLayers.Control.Attribution()
	],
	center: oLonLatUK,
	zoom: 3
});

map.addControl(new OpenLayers.Control.LayerSwitcher());

var select = new OpenLayers.Control.SelectFeature(layer);
map.addControl(select);
select.activate();
map.zoomToMaxExtent();
