#!/usr/bin/env bash
unset SCRIPT_ROOT
readonly SCRIPT_ROOT=$(
  unset CDPATH
  script_root=$(dirname "${BASH_SOURCE}")
  cd "${script_root}"
  pwd
)
if [ -d "${SCRIPT_ROOT}/submodules/flogo-cicd" ]; then
  rm -rf ${SCRIPT_ROOT}/submodules/flogo-cicd
  git submodule update --init --remote -- submodules/flogo-cicd
  source ${SCRIPT_ROOT}/submodules/flogo-cicd/scripts/init.sh
  # Build flogo/flogo-cli docker image
  pushd ${SCRIPT_ROOT}
  cp ${SCRIPT_ROOT}/submodules/flogo-cicd/docker/flogo-base/Dockerfile ./Dockerfile.base
  # Pull and tag alpine:latest
  docker::pull_and_tag "mhart/alpine-node:6.4.0"
  # Build flogo/base docker image
  docker::build_and_push flogo/flogo-base Dockerfile.base
  popd
fi

