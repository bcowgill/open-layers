// Adding 500 Data Points
var oMap, oActiveLayer, oHeatMapLayer, oCentroidLayer,
	startZoom = 8, // was 13
	oLatLngUKLondon = new google.maps.LatLng(51.50541, -0.14536),
	MIN_BIN = 0,
	MAX_BIN = 10,
	RADIUS = 20,
	OPACITY = 50;

MIN_BIN = getIntFromURL("MIN_BIN", MIN_BIN);
MAX_BIN = getIntFromURL("MAX_BIN", MAX_BIN);
RADIUS  = getIntFromURL("RADIUS",  RADIUS);
OPACITY = getIntFromURL("OPACITY", OPACITY);

var curGradient = undefined, curGradientReversed = false, Gradients = {
	'hsv-purple-to-cyan': [
		'#52B3CA',
		'#4BCCA9',
		'#44CF68',
		'#5AD23C',
		'#9FD434',
		'#D7C02C',
		'#DA6C23',
		'#DC1B28',
		'#DF127F',
		'#E209E1',
		'#7B00E5'
	],
	'hsv-cyan-to-purple': [
		'rgba(75,204,169,0)',
		'rgba(68,207,104,1)',
		'rgba(90,210,60,1)',
		'rgba(159,212,52,1)',
		'rgba(215,192,44,1)',
		'rgba(218,108,35,1)',
		'rgba(220,27,40,1)',
		'rgba(223,18,127,1)',
		'rgba(226,9,225,1)',
		'rgba(123,0,229,1)',
		'rgba(82, 179, 202,1)'
	],
	'google': [
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
}, aGradients = Object.keys(Gradients);

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

function getCentroidData(aCentroidsLatLon)
{
	var aPoints = [];
	aCentroidsLatLon.forEach(function (aLatLon) {
		if (aLatLon.length)
		{
			aPoints.push(new google.maps.LatLng(aLatLon[0], aLatLon[1]));
		}
	});
	console.log("getCentroidData Total Data points", aPoints.length);
	return aPoints;
}

function initialize() {
	var mapOptions = {
		zoom: startZoom,
		center: oLatLngUKLondon,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	};

	oMap = new google.maps.Map(
		document.getElementById('map-canvas'),
		mapOptions);

	oHeatMapLayer = new google.maps.visualization.HeatmapLayer({
		data: new google.maps.MVCArray(getHeatMapData(HeatMapUK, MIN_BIN, MAX_BIN))
	});

	oHeatMapLayer.set('radius', RADIUS);
	oHeatMapLayer.set('opacity', OPACITY / 100);

	oCentroidLayer = new google.maps.visualization.HeatmapLayer({
		data: new google.maps.MVCArray(getCentroidData(CentroidsLatLon))
	});

	oCentroidLayer.set('radius', RADIUS);
	oCentroidLayer.set('opacity', OPACITY / 100);

	oActiveLayer = oCentroidLayer;
	oActiveLayer.setMap(oMap);
}

function toggleHeatmap() {
	oHeatMapLayer.setMap(oHeatMapLayer.getMap() ? null : oMap);
}

function changeGradient() {
	var aGradient,
		gradient = oActiveLayer.get('gradient');
	console.log("changeGradient ", curGradient, curGradientReversed, gradient);
	if (gradient)
	{
		if (curGradient >= aGradients.length && curGradientReversed)
		{
			curGradient = undefined;
			curGradientReversed = false;
			gradient = void 0;
		}
		else
		{
			if (curGradientReversed)
			{
				curGradient++;
				curGradientReversed = false;
				if (curGradient >= aGradients.length)
				{
					curGradient = undefined;
					curGradientReversed = false;
					gradient = void 0;
				}
				else
				{
					aGradient = [].concat(Gradients[aGradients[curGradient]]);
					gradient = aGradients[curGradient];
				}
			}
			else
			{
				curGradientReversed = true;
				aGradient = [].concat(Gradients[aGradients[curGradient]]).reverse();
				gradient = aGradients[curGradient];
			}
		}
	}
	else
	{
		curGradient = 0;
		curGradientReversed = false;
		aGradient = [].concat(Gradients[aGradients[curGradient]]);
		gradient = aGradients[curGradient];
	}
	console.log("changeGradient set ", gradient, curGradient, curGradientReversed);
	oActiveLayer.set('gradient', gradient ? aGradient : null);
}

function changeRadius() {
	var oRadius = {
		'undefined': 10,
		'10': 20,
		'20': 30,
		'30': 40,
		'40': 50,
		'50': 60,
		'60': 70,
		'70': 80,
		'80': void 0,
		},
		radius = oActiveLayer.get('radius'),
		toRadius = radius ? (oRadius['' + radius] || void 0) : oRadius['undefined'];
	console.log("changeRadius " + radius + " to " + toRadius);
	oActiveLayer.set('radius', toRadius);
}

function changeOpacity() {
	var oOpacity = {
		'undefined': 100,
		'0': 100,
		'10': 0,
		'20': 10,
		'30': 20,
		'40': 30,
		'50': 40,
		'60': 50,
		'70': 60,
		'80': 70,
		'90': 80,
		'100': 90,
		},
		opacity = Math.round(100 * oActiveLayer.get('opacity')),
		toOpacity = opacity ? (oOpacity['' + opacity]|| 0) : oOpacity['undefined'];
	console.log("changeOpacity " + opacity + " to " + toOpacity);
	oActiveLayer.set('opacity', toOpacity / 100);
}

google.maps.event.addDomListener(window, 'load', initialize);
