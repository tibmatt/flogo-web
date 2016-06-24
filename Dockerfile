FROM golang

VOLUME "docker-shared"

#ENV GOPATH $HOME/.golang_default
#ENV PATH $PATH:$GOPATH/bin:/usr/local/go/bin
RUN go get github.com/constabulary/gb/...

# REPOS
RUN curl -sL https://deb.nodesource.com/setup_5.x | bash \
    && apt-get install -y nodejs git \
    && npm install -g gulp-cli

# Create app directory
RUN mkdir -p /usr/app/src
WORKDIR /usr/app

COPY ["package.json","/usr/app"]
RUN npm install

# Install app dependencies files
COPY [".babelrc",  "gulpfile.babel.js",  "tsconfig.json", "typings.json", "/usr/app/"]

# Install app dependencies folders
COPY ./docker /usr/app/docker
COPY ./submodules /usr/app/submodules
COPY ./typings /usr/app/typings
COPY ./gulp /usr/app/gulp
COPY ./src /usr/app/src
COPY ./contrib /usr/app/contrib

COPY submodules/flogo ${GOPATH}/src/github.com/TIBCOSoftware/flogo
RUN go get github.com/TIBCOSoftware/flogo/... \
    && go install github.com/TIBCOSoftware/flogo/...


RUN gulp prod.build

COPY ["docker/config-git.sh","docker/start.sh", "/usr/app/"]

EXPOSE 3010

CMD ["bash", "start.sh"]
