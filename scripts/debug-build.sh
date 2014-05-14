#!/bin/bash
set -e

DIST=../dist
LIB=../lib
HTML=../html
CSS=../css
OPENVER=OpenLayers-2.13.1
OLDIST=$DIST/openlayers

[ -d $OLDIST ] && rm -rf $OLDIST
mkdir -p $OLDIST
mkdir -p $DIST/js

cp -R $LIB/3rdparty/$OPENVER/lib $OLDIST
cp -R $LIB/3rdparty/$OPENVER/img $OLDIST
cp -R $LIB/3rdparty/$OPENVER/theme $OLDIST

cp -R $HTML $DIST
cp -R $CSS $DIST
cp $LIB/vis.js $DIST/js

 perl -i -pne 's{openlayers(/|/lib/)OpenLayers\.js}{openlayers/lib/OpenLayers.js}xmsg' $DIST/html/index.html
