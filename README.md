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
##  User Workflow
1. Download the `docker-compose-start.sh and docker-compose.yml` from [here](https://github.com/TIBCOSoftware/flogo-web/releases) and run `docker-compose-start.sh`.

Application and services will be started, when you see the following banner in the console flogo will be ready to be used in your browser:

```
=============================================================================================
[success] open http://localhost:3303 or http://localhost:3303/_config in your browser
=============================================================================================
```
## Trouble shooting

1. If you are having issues such as "Invalid volume destination path", try removing all docker images usning `docker rmi <image_id>`
2. If you are having issues developing or running with Web UI, try reloading with "New Incognito Window" or "New Private Window"

## Known Issues
See list [here](https://github.com/TIBCOSoftware/flogo-web/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

## Development and testing

See [DEVELOPER.md](DEVELOPER.md)

See [important-jsons-behaviour.md](docs/important-jsons-behaviour.md) for few important JSON transformations made in flogo-web which needs to be remembered