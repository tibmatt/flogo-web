# flogo-web

## Prerequisites

- git
- docker and docker-machine (https://www.docker.com)

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

## Run the application

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


## Few notable features

1. Application structure suitable for distributed contributions

2. Manage and Merge front-end libraries by NPM

3. Compile LESS

4. One command start everything

## Upcoming features

1. flogo engine auto restart
