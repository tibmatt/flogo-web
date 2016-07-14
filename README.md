# flogo-web

Flogo Web UI provides a web-based Designer & debugger to build Flogo applications 


## Prerequisites

- git: There are several excellent tools available for [git](https://git-scm.com/downloads)
- docker: Install the latest Docker for Mac or Windows (not toolbox). Refer to the getting started documentation on [docs.docker.com](https://docs.docker.com/)
- Access to the following git repositories:

1. [flogo-cli](https://github.com/TIBCOSoftware/flogo-cli.git)
2. [flogo-contrib](https://github.com/TIBCOSoftware/flogo-contrib.git)
3. [flogo-services](https://github.com/TIBCOSoftware/flogo-services.git)
4. [flogo-lib](https://github.com/TIBCOSoftware/flogo-lib.git)
5. [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git)

If you don't have git repo access, please email [Rajeev Kozhikkattuthodi](mailto:rkozhikk@tibco.com?subject=Flogo%20Git%20Access) or [Francisco Martinez](mailto:fmartinez@tibco.com?subject=Flogo%20Git%20Access)

## Setting up Flogo Web UI & dependencies

After you get git access, clone the [flogo-web repository](https://github.com/TIBCOSoftware/flogo-web.git)

```
git clone https://github.com/TIBCOSoftware/flogo-web.git
```

## Run Flogo Web UI 

1. `cd` to the directory where you cloned the [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git) or clone it if you haven't already.
1. Run `git status` // to make sure you're in **master** branch
1. Update github username and password in `docker-compose.yml` (you can also [generate a github personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) to use here instead of your password)
1. Run the following commands to update the submodules:
   
   `git submodule update --init -- submodules/flogo-services`

   `rm -rf submodules/flogo-contrib`
   
   `git submodule update --init --remote -- submodules/flogo-contrib`

1. Run `docker-compose up`

Application and services will be started, when you see the following banner in the console flogo will be ready to be used in your browser:

```
=============================================================================================
[success] open http://localhost:3010 or http://localhost:3010/_config in your browser
=============================================================================================
```

## Questions 

Post a question on [Tibbr](https://tibco.tibbr.com/tibbr/#!/subjects/48414) or Slack

