#!/bin/bash

common::envvars() {
  if [ -z "$BID" -a -n "$DOCKER_RELEASE_TAG" ]; then
    BID=${DOCKER_RELEASE_TAG}
  fi
}