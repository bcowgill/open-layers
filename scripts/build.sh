#!/bin/bash
set -e

DIST=../dist
LIB=../lib
HTML=../html
CSS=../css
DATA=../data
OPENVER=OpenLayers-2.13.1
OLDIST=$DIST/openlayers

[ -d $OLDIST ] && rm -rf $OLDIST
mkdir -p $OLDIST
mkdir -p $DIST/js

cp $LIB/3rdparty/$OPENVER/OpenLayers.js $OLDIST

cp -R $LIB/3rdparty/$OPENVER/img $OLDIST
cp -R $LIB/3rdparty/$OPENVER/theme $OLDIST

cp -R $DATA $DIST
cp -R $HTML $DIST
cp -R $CSS $DIST
cp $LIB/vis.js $DIST/js
cp $LIB/raster.js $DIST/js

perl -i -pne 's{openlayers(/|/lib/)OpenLayers\.js}{openlayers/OpenLayers.js}xmsg' $DIST/html/index.html
