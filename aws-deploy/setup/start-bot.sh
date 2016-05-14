#!/usr/bin/env bash

# stop it if it is running
lsof -i:5050 | grep node | awk '{print $2}' | xargs kill -9

cd ../../slack-integration
npm install
FLOGO_PUBLIC_HOSTNAME="$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)" node ./src > "$HOME/flogo-logs/flogo-slackbot-$(date +"%Y%m%d-%H%M").log" 2>&1 &
