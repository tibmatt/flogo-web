#!/usr/bin/env bash

bash update-submodules.sh

cd ..

# clean dist folder
rm -rf dist
mkdir dist

# create directory structure expected by flogo build process
mkdir -p dist/build dist/submodules dist/contrib/trigger dist/contrib/activity
cp -r submodules/flogo-contrib dist/submodules

# Build the application files, pre-create the engines and dump the database
DIST_BUILD=true npm run start release

# we don't need these after build
rm -rf dist/submodules
rm -rf dist/build/server/node_modules
rm -rf release

# rename dist to release so it can be checked into the repo
mv dist release

# add flogo-cli source code to avoid pulling in from inside the container so we don't need to provide credentials for the private repo
# TODO: remove once flogo-cli repo is public
git clone --single-branch https://github.com/TIBCOSoftware/flogo-cli.git release/flogo-cli
rm -rf release/flogo-cli/.git
