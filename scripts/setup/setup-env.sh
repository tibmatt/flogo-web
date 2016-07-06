#!/bin/bash

if [ -z "$SKIPCHECK_DOCKER_MACHINE" ]; then
  ## Setup Docker
  docker-machine create --driver virtualbox flogo
  docker-machine start flogo
  eval $(docker-machine env flogo)
fi

## Run setup-docker.sh first
# docker pull redis

## Build Process Service
cd ../../submodules/flogo-services/flow-store-service/java
./gradlew installDist

## Build State Service
cd ../../flow-state-service/java
./gradlew installDist

## Build Flogo Engine
#cd ../engine
#gb build
