FROM golang:1.6.2-alpine
MAINTAINER Aditya Wagle

VOLUME "./docker-shared"
#COPY * /tmp/flogo-web/

WORKDIR /tmp/flogo-web

COPY ["package.json","/tmp/flogo-web"]

# Install app dependencies files
COPY [".babelrc", \
        "gulpfile.babel.js",  \
        "tsconfig.json", \
        "typings.json", \
        "docker-start.sh",\
    "/tmp/flogo-web/"]

COPY submodules /tmp/flogo-web/submodules
COPY typings /tmp/flogo-web/typings
COPY gulp /tmp/flogo-web/gulp
COPY contrib /tmp/flogo-web/contrib

COPY src /tmp/flogo-web/src

COPY gulp /tmp/flogo-web/gulp

#flogo-web will be at /tmp/flogo-web



## INSTALL NODE
RUN apk --no-cache add make nodejs python bash git g++ && \
    node --version && \
    echo "### RUNNING npm install ### " && \
    npm install  && \
    echo "### RUNNING npm cache clear ### " && \
    echo "Installing GULP CLI" && \
    npm install -g gulp-cli && \
    npm cache clear && \
    chmod 777 /tmp/flogo-web/docker-start.sh && \
    echo "Starting local build" && \
    gulp build && \
    echo "Installing GB" && \
    go get github.com/constabulary/gb/...

WORKDIR /tmp/flogo-web

EXPOSE 3010

ENTRYPOINT /tmp/flogo-web/docker-start.sh
