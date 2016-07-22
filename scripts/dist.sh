#!/usr/bin/env bash

DIST_BRANCH="$1"

cd ..
rm -rf dist
mkdir dist

git clone -b "${DIST_BRANCH}" --single-branch https://github.com/TIBCOSoftware/flogo-web.git dist
rm -rf dist/build/*

mkdir -p dist/submodules
cp -r submodules/flogo-contrib dist/submodules

DIST_BUILD=true gulp dist

#rm -rf dist/submodules
rm -rf dist/build/server/node_modules
