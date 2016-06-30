FROM flogo/flogo-cli

VOLUME "./docker-shared"

## INSTALL NODE
RUN apk --no-cache add nodejs python bash

# Create app directory
RUN mkdir -p /usr/app/src
WORKDIR /usr/app
COPY ["package.json","/usr/app"]
RUN npm install && npm cache clear

# Install app dependencies files
COPY [".babelrc", \
        "gulpfile.babel.js",  \
        "tsconfig.json", \
        "typings.json", \
    "/usr/app/"]

COPY submodules /usr/app/submodules
COPY typings /usr/app/typings
COPY gulp /usr/app/gulp
COPY contrib /usr/app/contrib

COPY src /usr/app/src

#INSTALL GULP
RUN mkdir -p $HOME && \
    npm install -g gulp-cli \
    && gulp prod.build \
    && rm -rf src \
    && npm cache clear

COPY ["docker/config-git.sh","docker/start.sh", "/usr/app/"]
EXPOSE 3010

CMD ["bash", "start.sh"]
