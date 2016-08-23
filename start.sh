#!/usr/bin/env bash

if [[ "$1" == "help" ]]; then
  echo "usage: start.sh [--mode <m>| --skip <s>][--help]"
  echo "Flogo start"
  echo "  --mode|-m dev or prod (Default dev)"
  echo "  --skip|-s skip component"
  echo "    * flow-service: skip flow service initialization"
  echo "    * state-service: skip state service initialization"
  echo "    * engine: skip engine install/update"
  echo "    * contrib: do not fetch latest contrib repository changes"
  exit 0
fi

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

export SKIPCHECK_DOCKER_MACHINE=""

STD_IN=0
SKIP_COMPONENTS=();
FLOGO_WEB_MODE=dev

prefix=""
key=""
value=""
for keyValue in "$@"
do
  case "${prefix}${keyValue}" in
    -s=*|--skip=*)  key="-s";     value="${keyValue#*=}";;
    -m=*|--mode=*) key="-m";  value="${keyValue#*=}";;
    *)                                      value=$keyValue;;
  esac
  case $key in
    -s) SKIP_COMPONENTS=("${SKIP_COMPONENTS[@]}" "${value//,/ }")  prefix=""; key="";;
    -m) FLOGO_WEB_MODE=echo "$value" | awk '{print tolower($0)}' prefix=""; key="";;
    *)   prefix="${keyValue}=";;
  esac
done

#############################
# Utils
#############################
echoBlue()
{
  printf "${FG_BLUE}$@${NC}\n"
}

echoDefault()
{
  now=$(date +"%T")
  printf "[$now]${FG_DEFAULT}$@${NC}\n"
}
echoHeader()
{
  echoBlue "======================================================"
  echoBlue "## $@"
  echoBlue "======================================================"
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

compare_versions () {
    if [[ $1 == $2 ]]
    then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    # fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++))
    do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++))
    do
        if [[ -z ${ver2[i]} ]]
        then
            # fill empty fields in ver2 with zeros
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]}))
        then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]}))
        then
            return 2
        fi
    done
    return 0
}

check_version() {
    local command="$1"
    local targetVersion="$2"
    result=0;

    installed_version=$("$command" --version 2>&1 | grep '[0-9]\+\.[0-9]\+\.[0-9]\+$')
    installed_version=${installed_version//v}

    compare_versions $installed_version $targetVersion
    local result_compare=$?;

    if [[ $result_compare != 2 ]]; then
        result=0
        echoInfo "$command version $installed_version is OK"
    else
        result=1
        echoError "$command version is lower than required version, please upgrade to $targetVersion or greater"
        exit 1
    fi
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
  rm_rf "${GOPATH}/bin/flogo-cli"
  # remove flogo pkg
  rm_rf "${GOPATH}/pkg/$(go run scripts/detect-arch.go)/github.com/TIBCOSoftware/flogo-cli"
  # remove flogo src
  rm_rf "${GOPATH}/src/github.com/TIBCOSoftware/flogo-cli"
  echoInfo "Finish remove flogo command"
}

update_flogo(){
  echoInfo "Start update flogo command"
  remove_flogo
  go get github.com/TIBCOSoftware/flogo-cli/...
  echoInfo "Finish update flogo command"
}

should_run(){
 [[ ! " ${SKIP_COMPONENTS[@]} " =~ " $1 " ]]
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
check_version node "4.0"

#============================
# npm
#============================
check_command npm
check_version npm "3.0"


#============================
# docker-machine & docker
#============================
check_command docker

#============================
# flogo
#============================
# check_command flogo
if should_run 'engine'; then
  update_flogo
else
  echoInfo 'Skipping engine reinstall'
fi

#############################
# Step 2: update submodule
#############################
echoHeader "Step2: update submodules: flogo-contrib, flogo-services"
git submodule update --init -- submodules/flogo-services

if should_run 'contrib'; then
  # make sure always pulls the latest changes from flogo-contrib
  rm -rf submodules/flogo-contrib
  git submodule update --init --remote -- submodules/flogo-contrib
  echoSuccess "update submodule\n"
else
  echoInfo 'Skipping contrib submodule update'
fi

#############################
# Step 3: start process and state server
#############################
echoHeader "Step3: start process and state server"

if should_run 'flow-service'; then
  docker-compose stop flogo-flow-service
  docker-compose up -d flogo-flow-service
else
 echoInfo 'Skipping flow service'
fi

if should_run 'state-service'; then
  docker-compose stop flogo-state-service
  docker-compose up -d flogo-state-service
else
 echoInfo 'Skipping state service'
fi

#############################
# Step 4: start flogo-web
#############################
echoInfo "stop flogo-web and pouchdb"
pkill --signal SIGINT flogoweb

echoHeader "Step4: start flogo-web in mode '${FLOGO_WEB_MODE}'"
cd $CURRENT_PATH

npm install
npm run start $FLOGO_WEB_MODE
