FROM golang

# Create app directory
RUN mkdir -p /usr/app/src
WORKDIR /usr/app

ENV PATH $HOME/.golang_default/bin:/usr/local/go/bin:$PATH
ENV GOPATH $HOME/.golang_default

EXPOSE 3010

# REPOS
RUN curl -sL https://deb.nodesource.com/setup_5.x | sh \
    && apt-get install -y nodejs git \
    && npm install -g gulp-cli

 COPY ["package.json","/usr/app"]
 RUN npm install

 # Install app dependencies files
 COPY [".babelrc", "bg-start.sh", "gulpfile.babel.js",  "tsconfig.json", "typings.json", "/usr/app/"]

 # Install app dependencies folders
 COPY ./docker /usr/app/docker
 COPY ./scripts /usr/app/scripts
 COPY ./submodules /usr/app/submodules
 COPY ./typings /usr/app/typings
 COPY ./gulp /usr/app/gulp
 COPY ./src /usr/app/src
 COPY ./contrib /usr/app/contrib

 RUN gulp prod.build
 CMD ["gulp","prod.start"]
