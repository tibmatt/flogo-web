#!/usr/bin/env bash
#############################
# Colors
#############################
FG_BLACK="\e[30m"
FG_RED="\e[31m"
FG_GREEN="\e[32m"
FG_YELLOW="\e[33m"
FG_BLUE="\e[34m"
FG_PURPLE="\e[35m"
FG_CYAN="\e[36m"
FG_WHITE="\e[37m"
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

echoInfo()
{
  printf "${FG_YELLOW}[Info] ${NC}${FG_BLACK}$@${NC}\n"
}
echoError()
{
  printf "${FG_RED}[Error]$@${NC}\n"
}

echoSuccess()
{
  printf "${FG_GREEN}[Success]$@${NC}\n"
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

#############################
# Step 1: check environment
#############################
## TODO when a command doesn't exist, then install it automatically

echoBlack "======================================================"
echoBlack "## Step1: check environment"
echoBlack "======================================================"

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

#############################
# Step 2: update submodule
#############################
echoBlack "======================================================"
echoBlack "## Step2: update submodule: flogo-internal, flogo-contrib"
echoBlack "======================================================"

git submodule init
git submodule update

echoBlack "[Success]update submodule"

#############################
# Step 3: start process and state server
#############################
echoBlack "======================================================"
echoBlack "## Step3: start process and state server"
echoBlack "======================================================"

echoBlack "## setup docker"
cd "${FLOGO_INTERNAL_PATH}/utils/demo/cli/setup"
sh setup-docker.sh

echoBlack "## stop process and state server"
sh stop-env.sh

echoBlack "## stop flogo-web and pouchdb"
lsof -i:3010 | grep node | awk '{print $2}' | xargs kill -9
lsof -i:5984 | grep node | awk '{print $2}' | xargs kill -9

echoBlack "## setup env"
sh setup-env.sh

echoBlack "## start mqtt"
sh start-mosquitto.sh &

echoBlack "## start process and state server"
sh start-services.sh &

echoBlack "## start flogo-web"
cd $CURRENT_PATH
npm install
gulp && open_url "http://localhost:3010"

#############################
# Step 1: check environment
#############################


#############################
# Step 1: check environment
#############################
