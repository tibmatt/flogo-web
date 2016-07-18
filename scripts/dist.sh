#!/usr/bin/env bash

cd ..
rm -rf dist
mkdir dist

git clone -b 0.2alpha1 --single-branch https://github.com/TIBCOSoftware/flogo-web.git dist
rm -rf dist/build/*

mkdir -p dist/submodules
cp -r submodules/flogo-contrib dist/submodules

DIST_BUILD=true gulp dist
