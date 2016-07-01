#!/bin/bash 

## Stop Flogo Engine
pkill flogo

## Stop State Service
ps ax | grep 'com.tibco.flogo.ss.service.FlogoServerService' | grep -v grep | awk '{ print "kill " $1 }' | bash

## Stop Process Service
ps ax | grep 'com.tibco.flogo.service.FlogoServerService' | grep -v grep | awk '{ print "kill " $1 }' | bash

## Stop Redis
eval $(docker-machine env flogo)
docker stop $(docker ps -q -f "name=redis")
docker rm $(docker ps -a -q -f "name=redis")

## Stop Docker
# docker-machine stop flogo

