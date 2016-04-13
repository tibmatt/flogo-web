# Setup Environment
This document introduces how to setup your develop environment

## Prepare works
Before you continue make sure you have git access for following git repositories:

1. [flogo](https://github.com/TIBCOSoftware/flogo.git)
2. [flogo-contrib](https://github.com/TIBCOSoftware/flogo-contrib.git)
3. [flogo-internal](https://github.com/TIBCOSoftware/flogo-internal.git)
4. [flogo-lib](https://github.com/TIBCOSoftware/flogo-lib.git)
5. [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git)

If you don't have git access, please send email to [Rajeev Kozhikkattuthodi](mailto:rkozhikk@tibco.com?subject=Flogo%20Git%20Access) or [Francisco Martinez](mailto:fmartinez@tibco.com?subject=Flogo%20Git%20Access)

After you get git access, then checkout following gits. **I assume the base path to them are `$flogo_base`**

1. [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git). Path: `$flogo_base/flogo-web`
2. [flogo-contrib](https://github.com/TIBCOSoftware/flogo-contrib.git). Path `$flogo_base/flogo-contrib`
3. [flogo-internal](https://github.com/TIBCOSoftware/flogo-internal.git). Path `$flogo_base/flogo-internal`

## Configure your **GO** develop environment
You can following this document to install GO - [Getting Started](https://golang.org/doc/install)

After you install, don't forget to setup your `$GOPATH` - [GOPATH environment variable](https://golang.org/doc/code.html#GOPATH)

## Install `gb` command
This is the command to install `gb`: `go get github.com/constabulary/gb/...`

You also can check the lastest way to install `gb` from [https://getgb.io](https://getgb.io)

## Configure Docker
Following [Docker Get Started](https://docs.docker.com/mac/) to install docker on your computer 

## Install `flogo`
`go get github.com/TIBCOSoftware/flogo/...`

After install success, you can type `flogo`, it will show the help of this command

## Set up Flogo Web

### Install Node.js
Download Node.js Installer from [nodejs.org](https://nodejs.org/en/), and install it. You can download V4.x.

### Install gulp.js
Following [Gulp Getting Started](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) to install gulp

# Start server

## Start State Server and Process Server
1. Navigate to `cd $flogo_base/flogo-internal`
2. Navigate to `demo/cli/setup` folder, this folder contains all the shell script you need to start state server and process server
3. If you didn't run `setup-docker.sh` before, run this shell file. `sh setup-docker.sh`. This will create a docker environment - flogo, and pull the images we need
4. Build State Server and Process Server. `sh setup-env.sh`
5. Start State Server and Process Server, also start a MQTT Service. `sh start-mosquitto.sh`, then `sh start-services.sh`

After you start successful, you can use `curl http://localhost:9190/instances` to test. It should return an array.

## Start flogo-web
1. `npm install`
2. `gulp`

After start successful, then you can go to [http://localhost:3010](http://localhost:3010)








