#!/bin/bash
# pull down third party dependencies

set -e

DIR=..

# OpenLayers library http://trac.osgeo.org/openlayers/wiki/HowToDownload
# http://github.com/openlayers/openlayers

[ ! -d $DIR/lib/3rdparty ] && mkdir -p $DIR/lib/3rdparty 
pushd $DIR/lib/3rdparty
rm OpenLayers.js && echo OpenLayers.js removed
wget http://openlayers.org/api/OpenLayers.js
ls -al OpenLayers.js
echo Finding Version...
perl -ne 'print "$1\n" if m{(VERSION_NUMBER \s* : \s* "[^"]+)"}xms' OpenLayers.js

wget http://openlayers.org/download/OpenLayers-2.13.1.tar.gz
tar xvzf OpenLayers*.tar.gz
popd
