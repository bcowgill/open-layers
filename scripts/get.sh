#!/bin/bash
# pull down third party dependencies

set -e

DIR=..

# OpenLayers library http://trac.osgeo.org/openlayers/wiki/HowToDownload
# http://github.com/openlayers/openlayers

pushd $DIR/lib/3rdparty
rm OpenLayers.js && wget http://openlayers.org/api/OpenLayers.js
ls -al OpenLayers.js
echo Finding Version...
perl -ne 'print "$1\n" if m{(VERSION_NUMBER \s* : \s* "[^"]+)"}xms' OpenLayers.js

wget http://openlayers.org/download/OpenLayers-2.13.1.tar.gz
tar xvzf OpenLayers*.tar.gz
popd
