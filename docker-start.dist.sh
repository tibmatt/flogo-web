#!/usr/bin/env bash


echo "Setting up git"
cd /tmp/flogo-web


## setup GIT
echo "Username is $GIT_USERNAME and PASSWORD is $GIT_PASSWORD"
git config --global credential.helper store
git remote add origin https://$GIT_USERNAME:$GIT_PASSWORD@github.com/TIBCOSoftware/flogo-contrib.git
git remote add origin https://$GIT_USERNAME:$GIT_PASSWORD@github.com/TIBCOSoftware/flogo-cli.git

## Go get Flogo-CLI
echo "Getting flogo-cli"
cd $GOPATH/src
echo "CLONING flogo-cli"
git clone https://$GIT_USERNAME:$GIT_PASSWORD@github.com/TIBCOSoftware/flogo-cli.git
go get -u github.com/TIBCOSoftware/flogo-cli/...

#############################
# start flogo-web
#############################
echo "start flogo-web"
cd /tmp/flogo-web

echo "Calling npm run start"

## Need to handle SIGTERM
cd /tmp/flogo-web/build/server && npm run start
