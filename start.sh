#!/usr/bin/env bash
#############################
# Colors
#############################
FG_DEFAULT="\e[39m"
FG_BLACK="\e[30m"
FG_RED="\e[31m"
FG_GREEN="\e[32m"
FG_YELLOW="\e[33m"
FG_BLUE="\e[34m"
FG_PURPLE="\e[35m"
FG_CYAN="\e[36m"
FG_LIGHTGRAY="\e[37m"
NC='\033[0m'

#############################
# Paths
#############################
FLOGO_INTERNAL_PATH="submodules/flogo-internal"
FLOGO_CONTRIB_PATH="submodules/flogo-contrib"
CURRENT_PATH=$PWD

#############################
# Utils
#############################
echoBlack()
{
  printf "${FG_BLACK}$@${NC}\n"
}

echoDefault()
{
  now=$(date +"%T")
  printf "[$now]${FG_DEFAULT}$@${NC}\n"
}
echoHeader()
{
  echoBlack "======================================================"
  echoBlack "## $@"
  echoBlack "======================================================"
}
echoInfo()
{
  now=$(date +"%T")
  printf "${FG_YELLOW}[Info][$now] ${NC}${FG_DEFAULT}$@${NC}\n"
}
echoError()
{
  now=$(date +"%T")
  printf "${FG_RED}[Error][$now] $@${NC}\n"
}

echoSuccess()
{
  now=$(date +"%T")
  printf "${FG_GREEN}[Success][$now] $@${NC}\n"
}
check_command(){
  local cmd="$1"; shift
  result=0;

  if ! command -v $cmd >/dev/null; then
    result=0
    echoError "$cmd doesn't exist, please install $cmd"
    exit 1
  else
    result=1
    echoInfo "$cmd exist"
  fi
#  echo "$result";
}

open_url(){
  # open the url in browser
  if which open > /dev/null
  then
    open $1
  else
    echoError "Not support auto open url"
  fi
}

rm_rf(){
  if [ -d "$1" -o -f "$1" ]
  then
    rm -rf $1
  fi
}

remove_flogo(){

  echoInfo "Start remove flogo command"
  # remove flogo command
  rm_rf "${GOPATH}/bin/flogo"
  # remove flogo pkg
  rm_rf "${GOPATH}/pkg/darwin_amd64/github.com/TIBCOSoftware/flogo"
  # remove flogo src
  rm_rf "${GOPATH}/src/github.com/TIBCOSoftware/flogo"
  echoInfo "Finish remove flogo command"
}

update_flogo(){
  echoInfo "Start update flogo command"
  remove_flogo
  go get github.com/TIBCOSoftware/flogo/...
  echoInfo "Finish update flogo command"
}

#############################
# Step 1: check environment
#############################
## TODO when a command doesn't exist, then install it automatically

echoHeader "Step1: check environment"

#============================
# go
#============================
check_command go

#============================
# gb
#============================
check_command gb

#============================
# git
#============================
check_command git

#============================
# node
#============================
check_command node

#============================
# gulp
#============================
check_command gulp

#============================
# npm
#============================
check_command npm

#============================
# docker-machine & docker
#============================
check_command docker-machine
check_command docker

#============================
# flogo
#============================
# check_command flogo
update_flogo

#############################
# Step 2: update submodule
#############################
echoHeader "Step2: update submodule: flogo-internal, flogo-contrib"

git submodule init
git submodule update

echoSuccess "update submodule\n\n"

#############################
# Step 3: start process and state server
#############################
echoHeader "Step3: start process and state server"

echoInfo " setup docker"
cd "${FLOGO_INTERNAL_PATH}/utils/demo/cli/setup"
sh setup-docker.sh

echoInfo "stop process and state server"
sh stop-env.sh

echoInfo "stop flogo-web and pouchdb"
lsof -i:3010 | grep node | awk '{print $2}' | xargs kill -9
lsof -i:5984 | grep node | awk '{print $2}' | xargs kill -9

echoInfo "setup env"
sh setup-env.sh

echoInfo "start mqtt"
sh start-mosquitto.sh &

echoInfo "start process and state server"
sh start-services.sh &

#############################
# Step 4: start flogo-web
#############################
echoHeader "Step4: start flogo-web"
cd $CURRENT_PATH
npm install
gulp && open_url "http://localhost:3010"
