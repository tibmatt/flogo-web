FROM golang

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

# just so username and password are stored, necessary for installing activities and triggers
# TODO: replace for a better auth
#RUN git config --global credential.helper cache \
#    && git config --global credential.helper 'cache --timeout=3600'
#RUN git config --global credential.https://github.com.username "${GIT_USERNAME}"
#RUN git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/TIBCOSoftware/flogo-contrib.git flogo-cloned

COPY ["package.json","/usr/app"]
RUN npm install

# Install app dependencies files
COPY [".babelrc", "bg-start.sh", "gulpfile.babel.js",  "tsconfig.json", "typings.json", "/usr/app/"]

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

EXPOSE 3010
CMD ["gulp","prod.start"]
