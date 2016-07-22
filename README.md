# flogo-web

## Prerequisites

- git
- Docker for Mac or Windows or Linux (https://www.docker.com)

Make sure you have access to TIBCO's Internal Docker registry at http://reldocker.tibco.com. 
All TIBCO LDAP users have read only access to the registry.


If you don't have access, please send email to [Aditya Wagle](mailto:awagle@tibco.com?subject=Flogo%20Docker%20Access) or [Pralhad Kulkarni](mailto:pkulkarn@tibco.com?subject=Flogo%20%20Access)

After you get git access, clone the [flogo-web repository](https://github.com/TIBCOSoftware/flogo-web.git)

```
git clone https://github.com/TIBCOSoftware/flogo-web.git
```

## Run the application

1. `cd` to the directory where you cloned the [flogo-web](https://github.com/TIBCOSoftware/flogo-web.git) or clone it if you haven't already.
1. Run `git status` // to make sure you're in **0.2alpha1** branch
1. To switch to **0.2alpha1** branch run `git checkout 0.2alpha1`
1. Run `docker login reldocker.tibco.com` to login to the docker registry. Use your LDAP credentials for login.
1. Run `docker-compose up`

Application and services will be started, when you see the following banner in the console flogo will be ready to be used in your browser:

```
=============================================================================================
[success] open http://localhost:3010 or http://localhost:3010/_config in your browser
=============================================================================================
```


## Upcoming features

1. flogo engine auto restart
