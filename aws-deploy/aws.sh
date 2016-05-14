#!/usr/bin/env bash

git config --global credential.helper 'cache --timeout=3600'

LOG_DIR="../dist/public"
mkdir -p "$LOG_DIR"
nohup ./start.sh > "$LOG_DIR/web.log" &
