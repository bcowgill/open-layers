//              BL UK lon, lat       TR UK lon, lat
var scan = [[-10.85272, 49.01426], [2.63250, 61.58262]];

/*
 *	# UK
 *	[[-10.85272, 49.01426], # lon,lat min
 *	[2.63250, 61.58262]],   # lon,lat max
 *
 *	# Islands near Africa to calibrate heatmap delta
 *	[[1.57531, -1.77620], # lon,lat min
 *	[11.28722, 6.96892]], # lon,lat max
 *
 */


var ROUND = 0.5;

$(function () {
	var canvas = $('#scanner'),
		ctx = canvas.get(0).getContext("2d"),
		imgUrl = canvas.attr('data-img'),
		img = new Image();

	console.log('canvas: ', canvas);
	console.log('ctx: ', ctx);
	console.log('imgUrl', imgUrl);

	img.onload = function () {
		console.log('imgUrl loaded', imgUrl);
		console.dir(img);
		canvas.attr('width', img.width);
		canvas.attr('height', img.height);
		ctx.drawImage(img, 0, 0);
		setTimeout(scanImage.bind(ctx), 500);
	}
	img.src = imgUrl;
});

function chart(ctx, oInfo)
{
	var bin, value,
		xPos, yPos, height,
		BINS = 255,
		BAR_HEIGHT = 0.75 * ctx.canvas.height, BAR_WIDTH = Math.round(ctx.canvas.width / (BINS + 1));
	console.log("ctx", ctx, "oInfo", oInfo);
	ctx.fillStyle = "#00FF00";
	for (bin = 0; bin <= BINS; bin++)
	{
		if (oInfo.values.hasOwnProperty(bin))
		{
			xPos = BAR_WIDTH * bin;
			height = BAR_HEIGHT * oInfo.values[bin].length / oInfo.max.counts;
			yPos = ctx.canvas.height - height - 1;
			ctx.fillRect(xPos, yPos, BAR_WIDTH, height);
		}
	}
}

function lonToPix(lon, width)
{
	// lon is -180 to 180 maps to canvas width
	return Math.round(ROUND + (lon + 180) * width / 360);
}

function latToPix(lat, height)
{
	// lat is 90 to -90 maps to canvas height
	return Math.round(ROUND + (90 - lat) * height / 180);
}

function pixToLon(xPos, width)
{
	return xPos * 360 / width - 180;
}

function pixToLat(yPos, height)
{
	return 90 - yPos * 180 / height;
}

function scanImage()
{
	var ctx = this, oInfo = { points: 0, min: {}, max: {}, values: {} };
	rasterise(ctx, oInfo, scan);

	console.log('raster done', oInfo);
	$('#json').val("var HeatMap = " + JSON.stringify(oInfo, null, '\t') + ";");
	chart(ctx, oInfo);
}

function rasterise(ctx, oInfo, aScanMinMax)
{
	var xPos, yPos, dataPos, show = 10,
		INT_PER_PIX = 4,
		red, green, blue, alpha, mag,
		width = ctx.canvas.width, height = ctx.canvas.height,
		xMin = lonToPix(aScanMinMax[0][0], width),
		xMax = lonToPix(aScanMinMax[1][0], width),
		yMin = latToPix(aScanMinMax[1][1], height),
		yMax = latToPix(aScanMinMax[0][1], height),
		scanWidth = xMax - xMin + 1,
		scanHeight = yMax - yMin + 1,
		imgData = ctx.getImageData(xMin, yMin, scanWidth, scanHeight);
		console.log("boundaries to scan", scan, xMin, xMax, yMin, yMax, scanWidth, scanHeight);
	for (yPos = 0; yPos < scanHeight; yPos++)
	{
		dataPos = yPos * scanWidth * INT_PER_PIX;
		for (xPos = 0; xPos < scanWidth; xPos++)
		{
			red = imgData.data[dataPos++];
			green = imgData.data[dataPos++];
			blue = imgData.data[dataPos++];
			alpha = imgData.data[dataPos++];
			var Pix = {
				x: xMin + xPos,
				y: yMin + yPos,
				lon: pixToLon(xMin + xPos, width),
				lat: pixToLat(yMin + yPos, height),
				mag: 0,
				value: green,
				red: red,
				green: green,
				blue: blue,
				alpha: alpha
			};
			storeInfo(oInfo, 'red', red);
			storeInfo(oInfo, 'green', green);
			storeInfo(oInfo, 'blue', blue);
			storeInfo(oInfo, 'value', green);
			storeInfo(oInfo, 'alpha', alpha);
			if (alpha)
			{
				mag = Math.sqrt(red * red + green * green + blue * blue);
				storeInfo(oInfo, 'mag', mag);
				Pix.mag = mag;
				if (show)
				{
					--show;
					console.log(show + " pixel: ", Pix);
				}
				// store the values into buckets by intensity
				if (!oInfo.values.hasOwnProperty(Pix.value))
				{
					oInfo.values[Pix.value] = [];
				}

				// simplify Pix for output
				delete Pix.x;
				delete Pix.y;
				delete Pix.mag;
				delete Pix.red;
				delete Pix.green;
				delete Pix.blue;
				delete Pix.alpha;
				oInfo.values[Pix.value].push(Pix);
				storeInfo(oInfo, 'counts', oInfo.values[Pix.value].length);
				oInfo.points++;
			}
		}
	}
	ctx.fillStyle = "#0000FF";
	ctx.fillRect(xMin, yMin, 10, 10);
	ctx.fillStyle = "#00FF00";
	ctx.fillRect(xMax, yMax, 10, 10);
}

function storeInfo(oInfo, field, value)
{
	if (!oInfo.min.hasOwnProperty(field))
	{
		oInfo.min[field] = value;
	}
	else
	{
		oInfo.min[field] = oInfo.min[field] > value ? value : oInfo.min[field];
	}
	if (!oInfo.max.hasOwnProperty(field))
	{
		oInfo.max[field] = value;
	}
	else
	{
		oInfo.max[field] = oInfo.max[field] < value ? value : oInfo.max[field];
	}
}
