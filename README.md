# flogo-web
Project Flogo Web UI  

## Prerequisites

- git
- Docker for Mac or Windows or Linux (https://www.docker.com) 1.12.0-rc4-beta20 or later
- GO Lang 1.7 - Download it from here https://golang.org/dl/ and install and install as shown here https://golang.org/doc/install 
- Node JS 6.4.0 - Download it from here https://nodejs.org/en/download/releases/ 

Make sure you have access to TIBCO's Internal Docker registry at http://reldocker.tibco.com. All TIBCO LDAP users have read only access to the registry.


If you don't have access, please send email to [Aditya Wagle](mailto:awagle@tibco.com?subject=Flogo%20Docker%20Access) or [Prahlad Kulkarni](mailto:pkulkarn@tibco.com?subject=Flogo%20%20Access)

After you get git access, clone the [flogo-web repository](https://github.com/TIBCOSoftware/flogo-web.git)

```
git clone https://github.com/TIBCOSoftware/flogo-web.git
```
## Building the application
1. `cd` to the directory where you cloned the [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git) or clone it if you haven't already.
1. Choose docker registry 
    1. #### Private Docker Registry 
       1. Start your own registry as shown below
            ```
            docker run -d -p 5000:5000 --restart=always --name registry registry:2
            ```
       1. Set environment variable `export DOCKER_REGISTRY=localhost:5000/`

    1. #### TIBCO Docker Registry
        1. Run `docker login reldocker.tibco.com` to login to the docker registry. Use your LDAP credentials for login.
        1. Set environment variable `export DOCKER_REGISTRY=reldocker.tibco.com/`
        
1. Install flogo-cli as shown here https://github.com/TIBCOSoftware/flogo-cli
1. Install GB a go based project build tool as shown here https://getgb.io
1. Make sure the following are created in $GOPATH/bin folder and `$GOPATH/bin` is included in your environment `PATH`
    ```
    -rwxr-xr-x   1 root  staff  8301852 Aug 30 18:17 flogo*
    -rwxr-xr-x   1 root  staff  9089788 Aug 30 18:18 gb*
    -rwxr-xr-x   1 root  staff  9169036 Aug 30 18:18 gb-vendor*
    ```
1. Run `./build-flogo-web-dev.sh` . This will generate a docker-compose-start.sh file e.g.
```
    #!/bin/bash
    script_root=$(dirname "${BASH_SOURCE}")
    export DOCKER_REGISTRY=reldocker.tibco.com/
    docker-compose -f ${script_root}/docker-compose.yml up
    docker-compose rm -f
```
## Run the application

1. `cd` to the directory where you cloned the [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git) or clone it if you haven't already.
1. Run `git status` to make sure you're in **0.2alpha1** branch
1. To switch to **0.2alpha1** branch run `git checkout 0.2alpha1`
1. Run `docker login reldocker.tibco.com` to login to the docker registry. Use your LDAP credentials for login.
1. Down the generated `docker-compose-start.sh` and `docker-compose.yml` into any folder from https://github.com/TIBCOSoftware/flogo-web/releases section for the tagged release.
1. Run `docker-compose-start.sh`


Application and services will be started, when you see the following banner in the console flogo will be ready to be used in your browser:

```
=============================================================================================
[success] open http://localhost:3010 or http://localhost:3010/_config in your browser
=============================================================================================
```
## Trouble shooting

1. If you are having issues such as "Invalid volume destination path", try removing all docker images usning `docker rmi <image_id>`
2. If you are having issues developing or running with Web UI, try reloading with "New Incognito Window" or "New Private Window"

## Known Issues
See list [here](https://github.com/TIBCOSoftware/flogo-web/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

## Upcoming features

1. flogo engine auto restart
