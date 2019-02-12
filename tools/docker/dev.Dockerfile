FROM node:10.14 as base
ARG GOLANG_VERSION=1.11.2
ARG GOLANG_SRC_URL=https://dl.google.com/go/go${GOLANG_VERSION}.linux-amd64.tar.gz
ARG GOLANG_SRC_SHA256=1dfe664fa3d8ad714bbd15a36627992effd150ddabd7523931f077b3926d736d
ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH
RUN curl -fsSL "$GOLANG_SRC_URL" -o golang.tar.gz && \
  echo "$GOLANG_SRC_SHA256 golang.tar.gz" | sha256sum -c - && \
  tar -C /usr/local -xzf golang.tar.gz && \
  rm golang.tar.gz && \
  mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH" && \
  npm install -g yarn


FROM base AS builder
RUN go get -u github.com/project-flogo/cli/...
ENV BUILD_DIR /tmp/build
ENV FLOGO_WEB_LOCALDIR ${BUILD_DIR}/dist/local
COPY / ${BUILD_DIR}/
WORKDIR ${BUILD_DIR}
RUN yarn --pure-lockfile && yarn release && \
  cd dist/apps/server && \
  yarn --pure-lockfile --production=true && \
  npx modclean -Pr -n default:safe,default:caution


FROM base as release
ENV NODE_ENV production
ENV FLOGO_WEB_LOCALDIR /flogo-web/local
ENV FLOGO_WEB_PUBLICDIR /flogo-web/apps/client
COPY --from=builder /tmp/build/dist/ /flogo-web/
COPY --from=builder $GOPATH/ $GOPATH/
WORKDIR /flogo-web/
RUN cd local/engines/flogo-web && flogo build
CMD ["yarn", "--cwd=apps/server", "start"]
