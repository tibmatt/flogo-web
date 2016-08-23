#!/usr/bin/env bash

bash update-submodules.sh

cd ..
rm -rf dist
mkdir dist

mkdir -p dist/build dist/submodules dist/contrib/trigger dist/contrib/activity
cp -r submodules/flogo-contrib dist/submodules

DIST_BUILD=true gulp dist

# we don't need these anymore
rm -rf dist/submodules
rm -rf dist/build/server/node_modules

rm -rf release
mv dist release

git clone --single-branch https://github.com/TIBCOSoftware/flogo-cli.git release/flogo-cli
rm -rf release/flogo-cli/.git
