// Adding 500 Data Points
var map, pointarray, heatmap,
	idx, length, value, count, minValue = 50, maxValue = 255,
	hitData = [];

for (value = maxValue; value >= minValue; value--)
{
	if (HeatMapUK.values.hasOwnProperty(value) && (length = HeatMapUK.values[value].length))
	{
		for (idx = 0; idx < length; idx++)
		{
			for (count = value; count > 0; count--)
			{
				// add one point per value so heat adds up
				hitData.push(new google.maps.LatLng(
					HeatMapUK.values[value][idx].lat,
					HeatMapUK.values[value][idx].lon));
			}
		}
	}
}
console.log("Total Data points", hitData.length);

function initialize() {
	var mapOptions = {
		zoom: 13,
		center: new google.maps.LatLng(37.774546, -122.433523),
		mapTypeId: google.maps.MapTypeId.SATELLITE
	};

	map = new google.maps.Map(document.getElementById('map-canvas'),
								mapOptions);

	var pointArray = new google.maps.MVCArray(hitData);

	heatmap = new google.maps.visualization.HeatmapLayer({
		data: pointArray
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
	heatmap.set('radius', heatmap.get('radius') ? null : 20);
}

function changeOpacity() {
	heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

google.maps.event.addDomListener(window, 'load', initialize);
