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


  # Pull and tag flogo/flogo-base
  docker::pull_and_tag "flogo/flogo-base:latest"

  # Pull and tag flogo/flow-service
  docker::pull_and_tag "flogo/flow-service:latest"

  # Pull and tag flogo/state-service
  docker::pull_and_tag "flogo/state-service:latest"

    # Pull and tag flogo/flogo-contrib
  docker::pull_and_tag "flogo/flogo-contrib:latest"

  cid=$(docker create --name contrib-container flogo/flogo-contrib)
  docker run --rm --volumes-from contrib-container \
        -v ${SCRIPT_ROOT}/dist/submodules:/submodules \
        flogo/flogo-base /bin/sh -c "ls -al /flogo/flogo-contrib && cp -r /flogo/flogo-contrib /submodules"
  docker rm -f ${cid}

  # Pull and tag flogo/flogo-cli
  docker::pull_and_tag "flogo/flogo-cli:latest"

  cid=$(docker create --name cli-container flogo/flogo-cli)
  docker run --rm --volumes-from cli-container \
        -v ${SCRIPT_ROOT}/dist:/flogo-web \
        flogo/flogo-base /bin/sh -c "ls -al /flogo/flogo-cli && cp -r /flogo/flogo-cli /flogo-web"
  docker rm -f ${cid}

  # Build the application files, pre-create the engines and dump the database
  DIST_BUILD=true npm run start release

  # we don't need these after build
  rm -rf ${SCRIPT_ROOT}/dist/submodules
  rm -rf ${SCRIPT_ROOT}/dist/build/server/node_modules

  # Build flogo/flogo-web docker image
  pushd ${SCRIPT_ROOT}/dist
  #TODO: Change to build_and_push() after 0.2.0
  docker::build flogo/flow-web
  popd

fi


  
