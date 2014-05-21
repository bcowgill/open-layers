//              BL UK lon, lat       TR UK lon, lat
var scan = [[-10.85272, 49.01426], [2.63250, 61.58262]];
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
		setTimeout(rasterise.bind(ctx), 500);
	}
	img.src = imgUrl;
});

function chart(ctx, Info)
{
	var bin, value,
		xPos, yPos, height,
		BINS = 255,
		BAR_HEIGHT = 0.75 * ctx.canvas.height, BAR_WIDTH = Math.round(ctx.canvas.width / (BINS + 1));
	console.log("ctx", ctx, "Info", Info);
	ctx.fillStyle = "#00FF00";
	for (bin = 0; bin <= BINS; bin++)
	{
		if (Info.values.hasOwnProperty(bin))
		{
			xPos = BAR_WIDTH * bin;
			height = BAR_HEIGHT * Info.values[bin].length / Info.max.counts;
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

function rasterise()
{
	var ctx = this, xPos, yPos, dataPos, show = 10,
		INT_PER_PIX = 4,
		red, green, blue, alpha, mag,
		width = ctx.canvas.width, height = ctx.canvas.height,
		Info = { points: 0, min: {}, max: {}, values: {} },
		xMin = lonToPix(scan[0][0], width),
		xMax = lonToPix(scan[1][0], width),
		yMin = latToPix(scan[1][1], height),
		yMax = latToPix(scan[0][1], height),
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
			storeInfo(Info, 'red', red);
			storeInfo(Info, 'green', green);
			storeInfo(Info, 'blue', blue);
			storeInfo(Info, 'value', green);
			storeInfo(Info, 'alpha', alpha);
			if (alpha)
			{
				mag = Math.sqrt(red * red + green * green + blue * blue);
				storeInfo(Info, 'mag', mag);
				Pix.mag = mag;
				if (show)
				{
					--show;
					console.log(show + " pixel: ", Pix);
				}
				// store the values into buckets by intensity
				if (!Info.values.hasOwnProperty(Pix.value))
				{
					Info.values[Pix.value] = [];
				}

				// simplify Pix for output
				delete Pix.x;
				delete Pix.y;
				delete Pix.mag;
				delete Pix.red;
				delete Pix.green;
				delete Pix.blue;
				delete Pix.alpha;
				Info.values[Pix.value].push(Pix);
				storeInfo(Info, 'counts', Info.values[Pix.value].length);
				Info.points++;
			}
		}
	}
	ctx.fillStyle = "#0000FF";
	ctx.fillRect(xMin, yMin, 10, 10);
	ctx.fillStyle = "#00FF00";
	ctx.fillRect(xMax, yMax, 10, 10);
	console.log('raster done', Info);
	$('#json').val("var HeatMap = " + JSON.stringify(Info, null, '\t') + ";");
	chart(ctx, Info);
}

function storeInfo(Info, field, value)
{
	if (!Info.min.hasOwnProperty(field))
	{
		Info.min[field] = value;
	}
	else
	{
		Info.min[field] = Info.min[field] > value ? value : Info.min[field];
	}
	if (!Info.max.hasOwnProperty(field))
	{
		Info.max[field] = value;
	}
	else
	{
		Info.max[field] = Info.max[field] < value ? value : Info.max[field];
	}
}
