#!/usr/bin/env bash
sudo apt-get -y update
sudo apt-get -y install build-essential libssl-dev
curl https://raw.githubusercontent.com/creationix/nvm/v0.16.1/install.sh | sh

export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
nvm install 5.2.0
nvm alias default 5.2.0

echo "nvm use default" >> ~/.profile



# needed for sqlite dependencies
npm install -y -g node-gyp
sudo apt-get -y install python-software-properties python g++ make


# INSTALL JAVA (for state-server and process-server)
# needs to be java 8
sudo add-apt-repository ppa:openjdk-r/ppa -y
sudo apt-get update
sudo apt-get -y install openjdk-8-jdk

sudo update-ca-certificates -f


#/home/ubuntu/.nvm/v5.2.0/bin/npm install -g gulp
npm install -g gulp

