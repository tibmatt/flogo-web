#!/bin/bash 

## Setup Docker
docker-machine create --driver virtualbox flogo
docker-machine start flogo
eval $(docker-machine env flogo)

docker pull redis
docker pull toke/mosquitto
