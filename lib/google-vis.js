// Adding 500 Data Points
var map, heatmap,
	startZoom = 8, // was 13
	oLatLngUKLondon = new google.maps.LatLng(51.50541, -0.14536),
	MIN_BIN = 0,
	MAX_BIN = 10;

MIN_BIN = getIntFromURL("MIN_BIN", MIN_BIN);
MAX_BIN = getIntFromURL("MAX_BIN", MAX_BIN);

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

function getHeatMapData(oHeatMapInfo, minValue, maxValue)
{
	var idx, length, value, count, hitData = [];
	for (value = maxValue; value >= minValue; value--)
	{
		if (oHeatMapInfo.values.hasOwnProperty(value) && (length = oHeatMapInfo.values[value].length))
		{
			for (idx = 0; idx < length; idx++)
			{
				for (count = value; count > 0; count--)
				{
					// add one point per value so heat adds up
					hitData.push(new google.maps.LatLng(
						oHeatMapInfo.values[value][idx].lat,
						oHeatMapInfo.values[value][idx].lon));
				}
			}
		}
	}
	console.log("getHeatMapData Total Data points", hitData.length);
	return hitData;
}

function initialize() {
	var mapOptions = {
		zoom: startZoom,
		center: oLatLngUKLondon,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	};

	map = new google.maps.Map(
		document.getElementById('map-canvas'),
		mapOptions);

	heatmap = new google.maps.visualization.HeatmapLayer({
		data: new google.maps.MVCArray(getHeatMapData(HeatMapUK, MIN_BIN, MAX_BIN))
	});

	heatmap.setMap(map);
}

function toggleHeatmap() {
	heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
	var gradient = [
	'rgba(0, 255, 255, 0)',
	'rgba(0, 255, 255, 1)',
	'rgba(0, 191, 255, 1)',
	'rgba(0, 127, 255, 1)',
	'rgba(0, 63, 255, 1)',
	'rgba(0, 0, 255, 1)',
	'rgba(0, 0, 223, 1)',
	'rgba(0, 0, 191, 1)',
	'rgba(0, 0, 159, 1)',
	'rgba(0, 0, 127, 1)',
	'rgba(63, 0, 91, 1)',
	'rgba(127, 0, 63, 1)',
	'rgba(191, 0, 31, 1)',
	'rgba(255, 0, 0, 1)'
	]
	heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius() {
	var Radius = {
		'undefined': 10,
		'10': 20,
		'20': 30,
		'30': 40,
		'40': 50,
		'50': 60,
		'60': 70,
		'70': 80,
		'80': void 0,
	}, radius = heatmap.get('radius'),
	toRadius = radius ? (Radius['' + radius] || void 0) : Radius['undefined'];
	console.log("changeRadius " + radius + " to " + toRadius);
	heatmap.set('radius', toRadius);
}

function changeOpacity() {
	heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

google.maps.event.addDomListener(window, 'load', initialize);
