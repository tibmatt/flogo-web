#!/usr/bin/env bash
unset SCRIPT_ROOT
readonly SCRIPT_ROOT=$(
  unset CDPATH
  script_root=$(dirname "${BASH_SOURCE}")
  cd "${script_root}"
  pwd
)
source ${SCRIPT_ROOT}/init.sh

pushd ${BUILD_ROOT}
# Pull and tag alpine:latest
docker::pull_and_tag "mhart/alpine-node:6.4.0"
# Build flogo/base docker image
docker::build_and_push flogo/flogo-base Dockerfile.base

popd