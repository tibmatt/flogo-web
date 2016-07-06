#!/bin/bash

## Setup Docker
if [ -z "$SKIPCHECK_DOCKER_MACHINE" ]; then
  docker-machine create --driver virtualbox flogo
  docker-machine start flogo
  eval $(docker-machine env flogo)
fi

docker pull redis
docker pull toke/mosquitto
