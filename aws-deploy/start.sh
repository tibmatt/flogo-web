#!/usr/bin/env bash
#############################
# Colors
#############################

#############################
# Paths
#############################
FLOGO_INTERNAL_PATH="submodules/flogo-internal"
FLOGO_CONTRIB_PATH="submodules/flogo-contrib"
current_path=$PWD
cd ..
ROOT_PATH=$PWD
echo "####### ROOT_PATH=$PWD"
cd "${current_path}"

OS_ARCH="linux_amd64"


PUBLIC_DNS_NAME=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)
echo "Public DNS name: ${PUBLIC_DNS_NAME}"

# osx
# OS_ARCH="darwin_amd64"

#############################
# Utils
#############################
echoBlack()
{
  printf "$@\n"
}

echoDefault()
{
  now=$(date +"%T")
  printf "[$now]$@\n"
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
  printf "[Info][$now] $@\n"
}
echoError()
{
  now=$(date +"%T")
  printf "[Error][$now] $@\n"
}

echoSuccess()
{
  now=$(date +"%T")
  printf "[Success][$now] $@\n"
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
  rm_rf "${GOPATH}/pkg/${OS_ARCH}/github.com/TIBCOSoftware/flogo"
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
#check_command docker-machine
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
cd ..
rm -rf submodules/
git submodule update --init --remote

echoSuccess "update submodule\n"

#############################
# Step 3: start process and state server
#############################
echoHeader "Step3: start process and state server"

cd aws-deploy/setup

echoInfo " setup docker"
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
cd "$ROOT_PATH"
npm install
gulp build

cd "$ROOT_PATH"
cd dist/server

LOG_ROUTE="$HOME/flogo-logs"
mkdir -p "$LOG_ROUTE"
( npm run start-server 2>&1 | tee -a "$LOG_ROUTE/flogo-webserver-$(date +"%Y%m%d-%H%M").log" ) &
( npm run start-db 2>&1 | tee -a "$LOG_ROUTE/flogo-db-$(date +"%Y%m%d-%H%M").log" ) &

##########################
# Setp 5: start slack bot
#########################

echoInfo "stop slack bot"
lsof -i:5050 | grep node | awk '{print $2}' | xargs kill -9

echoInfo "start slack bot"
cd "${ROOT_PATH}/slack-integration"
npm install
FLOGO_PUBLIC_HOSTNAME="${PUBLIC_DNS_NAME}" node ./src > "$LOG_ROUTE/flogo-slackbot-$(date +"%Y%m%d-%H%M").log" 2>&1 &
