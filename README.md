# flogo-web

**Current start script is not available for windows**

## Prepare
Find requirements and setup instructions in [getting stated guide](getting-started-with-flogo.md).

## Run the application

### In production mode

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


### Run in development mode
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

## Few notable features

1. Application structure suitable for distributed contributions

2. Manage and Merge front-end libraries by NPM

3. Compile LESS

4. One command start everything

## Upcoming features

1. flogo engine auto restart
