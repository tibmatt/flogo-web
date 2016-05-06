#!/bin/bash

## Start docker
#docker-machine start flogo
#eval $(docker-machine env flogo)
#DOCKER_IP=$(docker-machine ip flogo)

#echo *** $DOCKER_IP

## Cleanup containers
docker stop $(docker ps -q -f "name=redis")
docker rm $(docker ps -a -q -f "name=redis")

## Start Redis
docker run --name flogo-redis -p 6379:6379 -d redis

#export FLOGO_REDIS_HOST=$DOCKER_IP
export FLOGO_REDIS_HOST=127.0.0.1

## Start Process Service
cd ../../submodules/flogo-internal/process-service
./process-service server ../config/server.yml &

## Start State Service
cd ../../../../../state-service/build/install/state-service/bin/
./state-service server ../config/server.yml &
