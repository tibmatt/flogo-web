FROM desertbit/golang-gb:1.6-alpine

#INSTALL FLOGO ENGINE
COPY submodules/flogo-cli ${GOPATH}/src/github.com/TIBCOSoftware/flogo-cli
RUN apk add --no-cache git \
    && git config --system http.sslverify false \
    && go get github.com/TIBCOSoftware/flogo-cli/... \
    && go install github.com/TIBCOSoftware/flogo-cli/...
