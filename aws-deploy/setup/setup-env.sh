#!/bin/bash

## Setup Docker
#docker-machine create --driver virtualbox flogo
#docker-machine start flogo
#eval $(docker-machine env flogo)

## Run setup-docker.sh first
# docker pull redis

## Build Process Service
#cd ../.././../../process-service/
cd ../../submodules/flogo-internal/flow-service
./gradlew installDist

## Build State Service
cd ../flow-state-service
./gradlew installDist

