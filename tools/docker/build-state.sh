#!/usr/bin/env bash

mkdir -p ${GOPATH}/src/github.com/TIBCOSoftware/

#Hardcode to v0.5.8
FLOGO_TAG_NAME=v0.5.8
cd ${GOPATH}/src/github.com/TIBCOSoftware/
	git clone https://github.com/TIBCOSoftware/flogo-services --branch ${FLOGO_TAG_NAME} --single-branch
	git clone https://github.com/TIBCOSoftware/flogo-lib --branch ${FLOGO_TAG_NAME} --single-branch

  go get ./...
	#Build flogo state
	pushd flogo-services/flow-store
		go install ./...

	popd
	#Build flogo flow
	pushd flogo-services/flow-state
		go install ./...
	popd

cp ${GOPATH}/bin/* ${BUILD_DIR}/


