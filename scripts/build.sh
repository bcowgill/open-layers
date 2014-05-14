#!/bin/bash
set -e

DIST=../dist
LIB=../lib
OPENVER=OpenLayers-2.13.1
OLDIST=$DIST/openlayers

[ -d $OLDIST ] && rm -rf $OLDIST 
mkdir -p $OLDIST/lib

cp $LIB/3rdparty/$OPENVER/OpenLayers.js $OLDIST/lib
cp -R $LIB/3rdparty/$OPENVER/theme $OLDIST
cp -R $LIB/3rdparty/$OPENVER/img $OLDIST

