#!/usr/bin/env bash

flogoCliDockerFile="docker/flogo-cli/Dockerfile"
cd ..
docker build -t "flogo/flogo-cli" --file="$flogoCliDockerFile" .
