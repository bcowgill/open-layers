#!/bin/bash
set -e

DIST=../dist
LIB=../lib
HTML=../html
CSS=../css
DATA=../data
OPENVER=OpenLayers-2.13.1
OLDIST=$DIST/openlayers
BRICKDIST=$DIST/brick

[ -d $OLDIST ] && rm -rf $OLDIST
[ -d $BRICKDIST ] && rm -rf $BRICKDIST
mkdir -p $OLDIST
mkdir -p $BRICKDIST
mkdir -p $DIST/js

cp $LIB/3rdparty/brick/brick.* $BRICKDIST

cp $LIB/3rdparty/$OPENVER/OpenLayers.js $OLDIST

cp -R $LIB/3rdparty/$OPENVER/img $OLDIST
cp -R $LIB/3rdparty/$OPENVER/theme $OLDIST

cp -R $DATA $DIST
rm $DIST/data/static_ip*.js
cp -R $HTML $DIST
cp -R $CSS $DIST
cp $LIB/vis.js $DIST/js
cp $LIB/google-vis.js $DIST/js
cp $LIB/raster.js $DIST/js

find $DIST -name '*.kate-swp' -delete
find $DIST -name '*.swp' -delete

perl -i -pne 's{openlayers(/|/lib/)OpenLayers\.js}{openlayers/OpenLayers.js}xmsg' $DIST/html/index.html
