#!/bin/bash

## Start docker
#docker-machine start flogo
#eval $(docker-machine env flogo)
#DOCKER_IP=$(docker-machine ip flogo)

#echo *** $DOCKER_IP

## Cleanup containers
docker stop $(docker ps -q -f "name=flogo-toke-mosquitto")
docker rm $(docker ps -a -q -f "name=flogo-toke-mosquitto")

## Start Mosquitto
docker run --name flogo-toke-mosquitto -ti -p 1883:1883 -p 9001:9001 -d toke/mosquitto

export FLOGO_MQTT_HOST=127.0.0.1
#export FLOGO_MQTT_HOST=$DOCKER_IP
