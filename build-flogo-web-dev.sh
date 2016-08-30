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
  git submodule update --init --remote --recursive
  source ${SCRIPT_ROOT}/submodules/flogo-cicd/scripts/init.sh
 
  echo  "#### Building flogo/flogo-base"
  pushd ${SCRIPT_ROOT}
  docker::build_and_push flogo/flogo-base Dockerfile.base
  popd


  echo "#### Building flogo/flogo-contrib"
  pushd ${SCRIPT_ROOT}/submodules/flogo-contrib
  docker::build_and_push flogo/flogo-contrib 
  popd

  echo "#### Building flogo/flogo-cli"
  pushd ${SCRIPT_ROOT}/submodules/flogo-cli
  docker::build_and_push flogo/flogo-cli 
  popd

  echo "#### Building flogo/flow-service and flogo/state-service docker images"
  pushd ${SCRIPT_ROOT}/submodules/flogo-services
  docker::build_and_push flogo/flow-service Dockerfile-flow-service
  docker::build_and_push flogo/state-service Dockerfile-flow-state-service
  popd
 
  # Get node packages
  pushd ${SCRIPT_ROOT}
  npm install
  popd

  # clean dist folder
  rm -rf ${SCRIPT_ROOT}/dist
  mkdir -p ${SCRIPT_ROOT}/dist

  # create directory structure expected by flogo build process
  mkdir -p ${SCRIPT_ROOT}/dist/build \
          ${SCRIPT_ROOT}/dist/submodules \
          ${SCRIPT_ROOT}/dist/contrib/trigger \
          ${SCRIPT_ROOT}/dist/contrib/activity
  cp -r ${SCRIPT_ROOT}/submodules/flogo-contrib ${SCRIPT_ROOT}/dist/submodules

  # Build the application files, pre-create the engines and dump the database
  DIST_BUILD=true npm run start release

  # we don't need these after build
  rm -rf ${SCRIPT_ROOT}/dist/submodules
  rm -rf ${SCRIPT_ROOT}/dist/build/server/node_modules

  # add flogo-cli source code to avoid pulling in from inside the container so we don't need to provide credentials for the private repo
  # TODO: remove once flogo-cli repo is public
  git clone --single-branch https://github.com/TIBCOSoftware/flogo-cli.git ${SCRIPT_ROOT}/dist/flogo-cli
  rm -rf ${SCRIPT_ROOT}/dist/flogo-cli/.git


  echo "#### Building flogo/flogo-web docker image"
  pushd ${SCRIPT_ROOT}/dist
  docker::build_and_push flogo/flow-web
  popd
  
fi



