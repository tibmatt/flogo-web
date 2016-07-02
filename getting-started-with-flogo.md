# Setup Environment
This document introduces how to setup your develop environment

## Make sure you have access to source code
Before you continue make sure you have git access for following repositories:

1. [flogo-cli](https://github.com/TIBCOSoftware/flogo-cli.git)
2. [flogo-contrib](https://github.com/TIBCOSoftware/flogo-contrib.git)
3. [flogo-services](https://github.com/TIBCOSoftware/flogo-services.git)
4. [flogo-lib](https://github.com/TIBCOSoftware/flogo-lib.git)
5. [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git)

If you don't have git access, please send email to [Rajeev Kozhikkattuthodi](mailto:rkozhikk@tibco.com?subject=Flogo%20Git%20Access) or [Francisco Martinez](mailto:fmartinez@tibco.com?subject=Flogo%20Git%20Access)

After you get git access, clone the [flogo-web repository](https://github.com/TIBCOSoftware/flogo-web.git)

```
git clone https://github.com/TIBCOSoftware/flogo-web.git
```

## Configure your **GO** development environment
Follow this document to install GO - [Getting Started](https://golang.org/doc/install)

After you install, don't forget to setup your `$GOPATH` - [GOPATH environment variable](https://golang.org/doc/code.html#GOPATH)

## Install `gb` command
Run

```
go get github.com/constabulary/gb/...
```

You can also check the latest way to install `gb` from [https://getgb.io](https://getgb.io)

## Configure Docker

Docker and docker-machine are required, you can install both by downloading the [Docker toolbox](https://www.docker.com/products/docker-toolbox).

**Note:** In linux os or if you want to use the mac native docker application (currently in beta) you will need to modify the start script, see the [known issues](#know-issues-and-workarounds) section for more info.

## Install Node.js

Required at least node `v5.x` and npm `v3.x`. Verify by running `node -v` and `npm -v`.

Recommended install method is through _nvm_ to allow you to have different node versions installed in your machine. Follow the installation instructions in [nvm homepage](https://github.com/creationix/nvm).

After installing nvm, run the following command to actually install node and npm:

```
nvm install 5.0
```

You may need to open and close your current terminal or open a new terminal window to load nvm configuration and continue the steps in this guide.

Verify you're using at least node v5 by running `node -v`. If it's not v5 run:

```
nvm use 5.0
```

**Note** If you install different node versions using nvm or if your already have a node installation you may need to run `nvm use 5.0` each time you open a new terminal. To avoid this you can set node v5 as your default version by running `nvm alias default node`. More info nvm homepage.

### Install gulp.js

Install gulp.js globally by running

```
npm install -g gulp-cli
```

### Install java jdk 8
Make sure you have java jdk 8 installed in your machine.

You can get the lates version in []https://www.java.com/en/

# Run the application

## In production mode

1. `cd` to the directory where you cloned the [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git) or clone it if you haven't already.
1. Run `git status` // to make sure you're in master branch
1. Run `git pull --rebase` // to download the latest changes
1. Run `./start.sh`

Application and services will be started, when you see the following banner in the console flogo will be ready to be used in your browser:

```
=============================================================================================
[success] open http://localhost:3010 or http://localhost:3010/_config in your browser
=============================================================================================
```

## Run in development mode

In this mode files will be watched for changes to automatically update the running environment.

1. `cd` to the directory where you cloned the [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git) or clone it if you haven't already.
1. Run `git status` // to make sure you're in master branch
1. Run `git pull --rebase` // to download the latest changes
1. Run `./start.sh dev`

Application and services will be started, when you see the following banner in the console flogo will be ready to be used in your browser (use localhost:3000 instead to use livereloading features):

```
=============================================================================================
[success] open http://localhost:3010 or http://localhost:3010/_config in your browser
=============================================================================================
```

# Known issues and workarounds

## docker-machine

If you're using a native docker client, which could be the case of an ubuntu os, you're probably not using docker-machine tool as it is not necessary. To run flogo you will need to deactivate the docker-machine check in the `start.sh` script.

Open `start.sh` script and comment out line 148 like this:

```
check_command docker-machine
```

You will see many `command docker-machine` not found during `start.sh` execution, you can ignore these messages.

**Note** this haven't been tested with the native osx docker client but it should work too assuming the docker client is correctly configured in your machine.

## node-gyp / pouchdb / leveldown issues

Follow: https://github.com/nodejs/node-gyp#installation


# gulp tasks
Run `gulp help` for a list of available tasks.
