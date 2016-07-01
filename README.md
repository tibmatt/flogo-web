
** For currently, the start.sh works on Mac OS **

# Prepare
1. [Install `Go`](https://golang.org/doc/install). Don't forget to setup your `$GOPATH`, you can following [Test your installation](https://golang.org/doc/install#testing), and add `$GOPATH/bin` to your path
1. [Install `gb`](https://getgb.io/docs/install/)
1. [Install `git`](https://git-scm.com/)
1. [Install `node`](https://nodejs.org/en/download/). Suggest you to download LTS version


# Getting started

1. `git status` // to check the branch
2. `git pull --rebase`
3. `git checkout develop`
4. `./start.sh`

If start successful, it you can see following output

```
=============================================================================================
[success] open http://localhost:3010 or http://localhost:3010/_config in your browser
=============================================================================================
```

# Run in development mode
Run `./start.sh dev` to start the development mode. Files will be watched for changes to automatically update the running environment.

**Note** browser will be automatically opened **but** you have to wait for the following message in the console to navigate the web app:

```
=============================================================================================
[success] open http://localhost:3010 or http://localhost:3010/_config in your browser
=============================================================================================
```

# flogo-web
Flogo web include flogo front-end and flogo design time server


## Few notable features

1. Application structure suitable for distributed contributions

2. Manage and Merge front-end libraries by NPM

3. Compile LESS

4. One command start everything

## upcoming features

1. Production vs Dev mode
1. flogo engine auto restart
