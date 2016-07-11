#!/bin/sh

UpdateModules () {
  echo "Updating modules ..."
  rm -rf submodules/
  git submodule update --init --remote
}

ShowHelp () {
  echo " Usage: ./docker.sh <command>"
  echo ""
  echo "where <command> is one of:"
  echo " build, help, restart, stop, up"
  echo ""
  echo "./docker.sh build     build or rebuild the services"
  echo "./docker.sh help      quick help on how to use the script"
  echo "./docker.sh restart   restart the services"
  echo "./docker.sh stop      stop the services"
  echo "./docker.sh up        start the containers"
  echo ""
  echo ""
}

DockerUp () {
  echo "Docker up..."
  UpdateModules
  docker-compose up
}

DockerBuild () {
  echo "Docker build..."
  UpdateModules
  docker-compose build
}

DockerRestart () {
  echo "Docker restart..."
  docker-compose stop
  UpdateModules
  docker-compose up
}

case "$1" in
   "up") DockerUp
   ;;
   "stop") docker-compose stop
   ;;
   "build") DockerBuild
   ;;
   "restart") DockerRestart
   ;;
   "help") ShowHelp
   ;;
   *) ShowHelp
   ;;
esac




