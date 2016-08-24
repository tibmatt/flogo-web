#!/usr/bin/env bash
unset SCRIPT_ROOT
readonly SCRIPT_ROOT=$(
  unset CDPATH
  script_root=$(dirname "${BASH_SOURCE}")
  cd "${script_root}"
  pwd
)
source ${SCRIPT_ROOT}/init.sh
source ${SCRIPT_ROOT}/update-submodules.sh

# Get node packages
pushd ${BUILD_ROOT}
npm install
popd

# clean dist folder
rm -rf ${BUILD_ROOT}/dist
mkdir -p ${BUILD_ROOT}/dist

# create directory structure expected by flogo build process
mkdir -p ${BUILD_ROOT}/dist/build \
        ${BUILD_ROOT}/dist/submodules \
        ${BUILD_ROOT}/dist/contrib/trigger \
        ${BUILD_ROOT}/dist/contrib/activity


# Pull and tag flogo/flogo-base
docker::pull_and_tag "flogo/flogo-base:latest"

# Pull and tag flogo/flogo-base
docker::pull_and_tag "flogo/flogo-contrib:latest"

cid=$(docker create --name contrib-container flogo/flogo-contrib)
docker run --rm --volumes-from contrib-container \
      -v ${BUILD_ROOT}/dist/submodules:/submodules \
      alpine /bin/sh -c "ls -al /flogo/flogo-contrib && cp -r /flogo/flogo-contrib /submodules"
docker rm -f ${cid}
# cp -r ${BUILD_ROOT}/submodules/flogo-contrib ${BUILD_ROOT}/dist/submodules

# Build the application files, pre-create the engines and dump the database
DIST_BUILD=true npm run start release

# we don't need these after build
rm -rf ${BUILD_ROOT}/dist/submodules
rm -rf ${BUILD_ROOT}/dist/build/server/node_modules

# add flogo-cli source code to avoid pulling in from inside the container so we don't need to provide credentials for the private repo
# TODO: remove once flogo-cli repo is public
git clone --single-branch https://github.com/TIBCOSoftware/flogo-cli.git ${BUILD_ROOT}/dist/flogo-cli
rm -rf ${BUILD_ROOT}/dist/flogo-cli/.git


# Build flogo/flogo-web docker image
pushd ${BUILD_ROOT}/dist
docker::build_and_push flogo/flow-web
popd
# Build flogo/flow-service and flogo/state-service docker images
pushd ${BUILD_ROOT}/submodules/flogo-services
docker::build_and_push flogo/flow-service Dockerfile-flow-service
docker::build_and_push flogo/state-service Dockerfile-flow-state-service
popd
