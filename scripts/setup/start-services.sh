#!/bin/bash

if [ -z "$SKIPCHECK_DOCKER_MACHINE" ]; then
  ## Start docker
  docker-machine start flogo
  eval $(docker-machine env flogo)
  DOCKER_IP=$(docker-machine ip flogo)
  echo *** $DOCKER_IP
fi;

## Cleanup containers
docker stop $(docker ps -q -f "name=redis")
docker rm $(docker ps -a -q -f "name=redis")

## Start Redis
docker run --name flogo-redis -p 6379:6379 -d redis

export FLOGO_REDIS_HOST=$DOCKER_IP

## Start Process Service
cd ../../submodules
SUBMODULES_PATH="$(pwd)"
cd "$SUBMODULES_PATH/flogo-services/flow-store-service/java/build/install/flow-service/bin/"
./flow-service server ../config/server.yml &

## Start State Service
cd "$SUBMODULES_PATH/flogo-services/flow-state-service/java/build/install/state-service/bin/"
./state-service server ../config/server.yml &
