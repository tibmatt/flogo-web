# Building and Testing Flogo Web

This document describes how to set up your development environment to build, run and test flogo web.

> :warning: Before developing client code please also read the [client code guideline](/docs/client-code-guideline.md)

> :information_source: Additional developer documentation can be found in [docs](/docs)

**Table of Contents**

- [Building and Testing Flogo Web](#building-and-testing-flogo-web)
  - [Setup](#setup)
    - [Prerequisite Software](#prerequisite-software)
    - [Getting the Sources](#getting-the-sources)
  - [Running the application locally](#running-the-application-locally)
    - [Start the services](#start-the-services)
    - [Before running the application](#before-running-the-application)
    - [Running the Application in Development Mode](#running-the-application-in-development-mode)
  - [Running Tests Locally](#running-tests-locally)
    - [Before running the tests](#before-running-the-tests)
    - [Running the tests](#running-the-tests)
    - [Running tests for a single subpackage](#running-tests-for-a-single-subpackage)
  - [Customize the server environment](#customize-the-server-environment)
  - [Build the docker image for development](#build-the-docker-image-for-development)
  - [Other tasks](#other-tasks)
    - [Managing the services:](#managing-the-services)
    - [Managing engine/local data](#managing-enginelocal-data)
    - [Misc](#misc)
  - [Project architecture and advanced usage.](#project-architecture-and-advanced-usage)

## Setup

### Prerequisite Software

- git
- [Docker and docker-compose](https://www.docker.com) for Mac or Windows or Linux (https://www.docker.com) 17.12.0 or later
- [NodeJS 10.14 or greater](https://nodejs.org/en/download/releases/)
- [yarn v1.9.4 or greater](https://yarnpkg.com)
- [Latest Flogo CLI (flogo-cli)](https://github.com/project-flogo/cli)
  - The following will be necessary and it should be installed as part of installing the flogo-cli tool:
    - GO Lang v1.11 or greater - Follow the instructions here https://golang.org/doc/install
    - Make sure you add $GOPATH/bin to your $PATH variable. Instructions related to the \$GOPATH variable are found in the above link in the ["Test your installation" section](https://golang.org/doc/install#testing)

### Getting the Sources

```sh
git clone https://github.com/TIBCOSoftware/flogo-web.git
```

## Running the application locally

### Before running the application

Make sure your local dependencies are up to date by running the following commands from the project root:

```sh
yarn install
```

### Running the Application in Development Mode

Flogo Web development environment is composed of a client side application and a server side application. During development time
they run as two separate services and as such you will need two terminal windows to run them.

**Start the Server Application**

In terminal 1 go to flogo-web project root and run:

```sh
yarn start server
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
yarn start client
```

Client application will start processing, once the processing progress reaches 100% you should see `ℹ ｢wdm｣: Compiled successfully`
in the terminal and the app will be ready to be accessed in your browser.

## Running Tests Locally

### Before running the tests

Make sure your dependencies are up to date:

```sh
yarn install
```

### Running the tests

From the project root:

```sh
yarn test
```

This will run the unit test for all the sub packages i.e. server, client and parser.

### Running tests for a single subpackage

From the project root:

```sh
yarn test <name-of-the-package>
```

For example

```sh
yarn test server
```

## Customize the server environment

Before starting the server copy and rename the [`.env.example`](/.env.example) to `.env`. Add or modify/uncomment
the environment variables defined in created `.env` file.

You can alternatively set regular environment variables.

## Build the docker image for development

To build the development docker image locally, run the following command from the project root
(you can change the `:dev-build` tag to another name you prefer):

```bash
docker build -f tools/docker/dev.Dockerfile -t flogo/flogo-web:dev-build .
```

The building process will start, it might take several minutes depending on your machine resources. Once the build is finished
then you should be able to see the docker image listed when running `docker images`.

To start the container, run and navigate to `http://localhost:5033` once the container starts. Note that you can change
the port `5033` in the command to a different port if needed:

```bash
docker run -it -p 5033:3303 flogo/flogo-web:dev-build
```

## Other tasks

All the commands listed in the following subsections are specified as `<command>: description` and they can be run from
the root of the project as:

```sh
yarn run <command>
```

### Managing engine/local data

- `clean:local`: Clean ALL your local data. This will remove the engine, database and logs.
- `clean:engines`: Remove the local engines only. This will force the server to rebuild the engine on next startup.

### Misc

- `update-global-flogo`: Update global flogo-cli to the latest available

## Project architecture and advanced usage.

The Flogo Web project follows a monorepo approach and it is composed of multiple subpackages. These packages are located in two directories:

- `/libs`: Independent and reusable modules.
- `/apps`: Deployable apps which integrate and compose the modules and libs. Currently there are only two apps; backend (server) and client (frontend).

> :books: You might want to look at [some pros and cons of monorepos](https://github.com/babel/babel/blob/master/doc/design/monorepo.md).

For this the project leverages [@angular/cli](https://cli.angular.io/) and [Nx](https://nrwl.io/nx/overview). It is advised for contributors of this project to become familiar with these tools so they can take advantage of their features such as code generation and dependency inspection.

Flogo Web uses npm/yarn scripts for its build process. Take a look at README.md of the packages as well as at the scripts section
in the `package.json` of the root project and the subpackages to find other commands available.

Project structure is following:

```
-- flogo-web (root package.json)
  |--- package.json (root package)
  |--- apps/
  |    |---- client/
  |    `---- server/
  `--- libs/
        |---- parser/
        `---- ...more libs
```
