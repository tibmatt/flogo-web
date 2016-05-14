#!/usr/bin/env bash

# create dir if doesn't exist
mkdir -p ./dist/public

nohup sh start.sh > ./dist/public/web.log &
