#!/bin/bash


readonly RELEASE_VERSION=${RELEASE_VERSION:-"v0.9.0-rc.2"}

readonly CLI_VERSION="master"
readonly CORE_VERSION=${RELEASE_VERSION:master}

export BUILD_ARGS="--build-arg CLI_VERSION=${CLI_VERSION} --build-arg CORE_VERSION=${CORE_VERSION}"


docker build ${BUILD_ARGS} --force-rm=true --rm=true -t flogo/flogo-web:${RELEASE_VERSION:-latest} -f tools/docker/Dockerfile .

