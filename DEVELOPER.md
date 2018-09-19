# Building and Testing Flogo Web

This document describes how to set up your development environment to build, run and test flogo web.

> Before developing client code please also read the [client code guideline](/docs/client-code-guideline.md)

> Additional developer documentation can be found in [docs](/docs)

**Table of Contents**

- [Building and Testing Flogo Web](#building-and-testing-flogo-web)
  * [Setup](#setup)
    + [Prerequisite Software](#prerequisite-software)
    + [Getting the Sources](#getting-the-sources)
    + [Getting the Service Images](#getting-the-service-images)
  * [Running the application locally](#running-the-application-locally)
    + [Start the services](#start-the-services)
    + [Before running the application](#before-running-the-application)
    + [Running the Application in Development Mode](#running-the-application-in-development-mode)
  * [Running Tests Locally](#running-tests-locally)
    + [Before running the tests](#before-running-the-tests)
    + [Running the tests](#running-the-tests)
  * [Customize the server environment](#customize-the-server-environment)
  * [Other tasks](#other-tasks)
    + [Install/update third party dependencies (node modules)](#installupdate-third-party-dependencies-node-modules)
    + [Managing the services:](#managing-the-services)
    + [Managing engine/local data](#managing-enginelocal-data)
    + [Misc](#misc)
  * [Project structure and advanced usage.](#project-structure-and-advanced-usage)

## Setup

### Prerequisite Software

- git
- [Docker and docker-compose](https://www.docker.com) for Mac or Windows or Linux (https://www.docker.com) 17.12.0 or later
- [Node JS 8.9.3 or greater](https://nodejs.org/en/download/releases/)
- [yarn](https://yarnpkg.com) 
- [Latest Flogo CLI (flogo-cli)](https://github.com/TIBCOSoftware/flogo-cli)
  - The following will be necessary and they should be installed as part of installing the flogo-cli tool:
    - GO Lang 1.9 - Follow the instructions here https://golang.org/doc/install
    - [Go dep](https://golang.github.io/dep/)
    - Make sure you add $GOPATH/bin to your $PATH variable. Instructions related to the $GOPATH variable are found in the above link in the ["Test your installation" section](https://golang.org/doc/install#testing).

### Getting the Sources

Make sure you have git access to the [flogo-web repository](https://github.com/TIBCOSoftware/flogo-web.git) and clone it.

```sh
git clone https://github.com/TIBCOSoftware/flogo-web.git
```

### Getting the Service Images

The development environment depends on flogo services images (flow-service and state-service), if you have access to
TIBCO's reldocker or flogo's private dockerhub you can pull the images from them, otherwise you will need to build the images locally.

Chose and follow **one** of these methods to get the images:

1. Pull from dockerhub
1. Pull from TIBCO reldocker
1. Build the images locally

**METHOD 1: Pull from dockerhub**

In your terminal log into docker hub
```
docker login
```

After you authenticated in a terminal make sure you're in flogo-web's project root and run: 
```sh
yarn run services:pull
```

**METHOD 2: Pull from TIBCO reldocker**

In your terminal login to reldocker using you LDAP credentials
```sh
docker login reldocker.tibco.com
```

After you authenticated, pull the images:

Pull and rename the state service image
```sh
docker pull reldocker.tibco.com/flogo/state-service:latest
docker tag reldocker.tibco.com/flogo/state-service:latest flogo/state-service:latest 
```

Pull and rename the flow service image
```sh
docker pull reldocker.tibco.com/flogo/flow-service:latest
docker tag reldocker.tibco.com/flogo/flow-service:latest flogo/flow-service:latest
```

**METHOD 3: Build the images locally**

For this method you will need access to the [flogo-cicd repository](https://github.com/TIBCOSoftware/flogo-cicd).
Once you have access follow the instructions in flogo-cicd's readme using the private registry method
and build *only* the following images (in the specified order, do not use the "build-all.sh" script):

1. flogo/go-builder
1. flogo/state-service
1. flogo/flow-service

Run `docker images` to make sure they were correctly built.

## Running the application locally

### Start the services

flow-services and state-service must be running in order to the test run a flow from the UI.

To start the services from the project root run:
```sh
yarn run services:start
```

### Before running the application

Make sure your local dependencies are up to date by running the following commands from the project root:

```sh
yarn install
yarn install:submodules
```

### Running the Application in Development Mode

Flogo Web development environment is composed of a client side application and a server side application. During development time
they run as two separate services and as such you will need two terminal windows to run them.

**Start the Server Application**

In terminal 1 go to flogo-web project root and run:
```sh
yarn run dev:server
```

Server will start running. Please be patient if this is the first time you run the server app as it can take several 
minutes to finish the startup process because it will need to create a Flogo engine instance and install the 
default activities and triggers.

When you see the following banner in the console Flogo Web's server will be ready to respond:

```

 ======================================================
                 ___       __   __   __ TM
                |__  |    /  \ / _` /  \
                |    |___ \__/ \__| \__/

   [success] open http://localhost:3303 in your browser
  ======================================================

```

**Start the client application**

In a second terminal flogo-web project root and run:

```sh
yarn run dev:client
```

Client application will start, when you see the following banner in the console flogo client app will be ready to be used in your browser:

```
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **
```

> Note: You can also run both client and server at once in a single terminal by running `yarn run dev`.
> The caveat is that the output is not as clear as when running the processes separately, also during development it is usually 
> helpful to be able to restart one application and not the other. 

## Running Tests Locally

### Before running the tests 

Make sure your dependencies are up to date:
```sh
yarn install
yarn install:submodules
```

### Running the tests

From the project root:
```sh
yarn run test
```

This will run the unit test for all the sub packages i.e. server, client and parser.

## Customize the server environment

Before starting the server copy and rename the [`.env.example`](/.env.example) to `.env`. Add or modify/uncomment
the environment variables defined in created `.env` file.

You can alternatively set regular environment variables.

## Other tasks

All the commands listed in the following subsections are specified as `<command>: description` and they can be run from
the root of the project as:

```sh
yarn run <command>
```

For example: `yarn run services:status`

### Install/update third party dependencies (node modules)
- `install:submodules`: Install all submodules dependencies
- `install:submodule:client`: Install client dependencies
- `install:submodule:server`: Install server dependencies
- `install:submodule:parser`: Install parser dependencies
- `clean:all-node-modules`: Warning: Will delete all node_modules in the project, including those of subpackages

### Managing the services:
- `services:status`: Check services status (running, stopped, etc.)
- `services:pull`: Try to pull (download) newer versions of the services (Only availabe for dockerhub)
- `services:stop`: Stop the services
- `services:clear`: Warning: destructive. Remove all the service instances and cleanup all services database.

### Managing engine/local data
- `clean:local`: Clean ALL your local data. This will remove the engine, database and logs. 
- `clean:engines`: Remove the local engines only. This will force the server to rebuild the engine on next startup.

### Misc
- `update-global-flogo`: Update global flogo-cli to the latest available

## Project structure and advanced usage.

Flogo Web is composed of a root package and other subpackages. Each package is independent and can handle most of its own lifecycle.
The root mostly delegates the tasks to the subpackages and orchestrates them during the release (production build) process.

Flogo Web uses npm/yarn scripts for its build process. Take a look at README.md of the packages as well as at the scripts section
in the `package.json` of the root project and the subpackages to find other commands available.

Root package is at the root project level and subpackages are located in `src`. Project structure is following:

```
-- flogo-web (root package.json)
  |--- package.json (root package)
  |--- src/
       |---- client/
       |        `--- package.json
       |---- server/
       |       `--- package.json
       `---- parser/
               `--- package.json
```
