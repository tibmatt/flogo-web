#!/bin/bash

docker::build_and_push() {
  common::envvars

  local image_name="${1}"
  local file_name="${2:-Dockerfile}"
  local bid="$BID"

  docker::build_file "${file_name}" "${image_name}" "${bid}" && \
  docker::push_and_tag "${image_name}" "${bid}" 
}

docker::build() {
  docker::build_file "Dockerfile" "$@"
}

docker::build_file() {
  local file_name="$1"
  local image_name="$2"
  local bid="$3"
  local latest='latest'


  docker build --force-rm=true --rm=true -t $image_name:${bid:-latest} -f ${file_name} .
  rc=$?

  if [ $rc -ne 0 ]; then
    echo "Build failed"
    exit $rc
  fi
}

docker::pull_and_tag() {
  local base_name="$1"
  local docker_registry="$DOCKER_REGISTRY"

  if [ -n "$docker_registry" ]; then
    docker pull $docker_registry/$base_name && \
    docker tag -f $docker_registry/$base_name $base_name && \
    docker rmi $docker_registry/$base_name
  fi
}

docker::push_and_tag() {
  common::envvars
  local image_name="$1"
  local bid="$2"
  local docker_registry="$DOCKER_REGISTRY"
  local latest='latest'

  if [ -n "$bid" -a -n "$docker_registry" ]; then
    echo "Publishing image..."
    docker tag -f $image_name:$bid $image_name:$latest && \
    docker tag -f $image_name:$bid $docker_registry/$image_name:$bid && \
    docker tag -f $image_name:$bid $docker_registry/$image_name:$latest && \
    docker images | grep $image_name >> images.txt && \
    docker push $docker_registry/$image_name:$latest && \
    docker push $docker_registry/$image_name:$bid && \
    docker rmi $docker_registry/$image_name:$latest && \
    docker rmi $docker_registry/$image_name:$bid && \
    echo "Done."
  fi
}


docker::copy_tag_and_push() {
  common::envvars
  local src_image_name="$1"
  local dest_image_name="$2"
  local bid="$3"
  local docker_registry="${DOCKER_REGISTRY}"

  local latest='latest'
  

  if [ -n "${bid}" -a -n "${docker_registry}" ]; then
    echo "Retagging image from: ${src_image_name}:${bid} to: ${dest_image_name}:${bid} ..."
    docker tag -f ${src_image_name}:${bid} ${dest_image_name}:${latest} && \
    docker tag -f ${src_image_name}:${bid} ${docker_registry}/${dest_image_name}:${bid} && \
    docker tag -f ${src_image_name}:${bid} ${docker_registry}/${dest_image_name}:${latest} && \
    docker push ${docker_registry}/${dest_image_name}:${latest} && \
    docker push ${docker_registry}/${dest_image_name}:${bid} && \
    docker rmi ${docker_registry}/${dest_image_name}:${latest} && \
    docker rmi ${docker_registry}/${dest_image_name}:${bid} && \
    echo "Done."
  else
     # no bid and docker registry i.e. local machine
     docker tag -f ${src_image_name}:${latest} ${dest_image_name}:${latest}
  fi
}
