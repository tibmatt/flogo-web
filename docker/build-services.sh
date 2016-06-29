#!/usr/bin/env bash
SUBMODULES_DIR=../submodules
cd $SUBMODULES_DIR/flogo-internal/docker

./build.sh flow-service
./build.sh flow-state-service
