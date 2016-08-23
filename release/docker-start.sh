#!/usr/bin/env bash


echo "Setting up git"
cd /tmp/flogo-web

#############################
# start flogo-web
#############################
echo "start flogo-web"
cd /tmp/flogo-web

echo "Calling npm run start"

## Need to handle SIGTERM
cd /tmp/flogo-web/build/server && npm run start
