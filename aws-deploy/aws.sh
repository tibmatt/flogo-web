#!/usr/bin/env bash

git config --global credential.helper 'cache --timeout=3600'

nohup ./start.sh > ../dist/public/web.log &
