FROM golang:1.7.0-alpine
MAINTAINER Aditya Wagle

WORKDIR /tmp/flogo-web

COPY . /tmp/flogo-web
VOLUME /tmp/flogo-web/build/docker-shared

## INSTALL NODE
RUN apk --no-cache add make nodejs python bash git g++ && \
    node --version && \
    cd /tmp/flogo-web/build/server && \
    echo "### RUNNING npm install ###" && \
      # progress=false is reported to increase npm install speed (https://github.com/npm/npm/issues/11283)
      npm set progress=false && \
      npm install --production && \
    echo "### RUNNING npm cache clear ###" && \
      npm cache clear && \
      apk --no-cache del make python g++ && \
      chmod 777 /tmp/flogo-web/docker-start.sh && \
    echo "Installing GB" && \
      go get github.com/constabulary/gb/... && \
    echo "### Installing flogo-cli ###" && \
      cd /tmp/flogo-web && \
      mkdir -p ${GOPATH}/src/github.com/TIBCOSoftware/flogo-cli && \
      cp -a flogo-cli/. ${GOPATH}/src/github.com/TIBCOSoftware/flogo-cli/ && \
      # will only fetch dependencies as flogo-cli source code is already in GOPATH
      go get github.com/TIBCOSoftware/flogo-cli/... && \
      go install github.com/TIBCOSoftware/flogo-cli/...

EXPOSE 3010

ENTRYPOINT /tmp/flogo-web/docker-start.sh
