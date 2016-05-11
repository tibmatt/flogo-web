#!/usr/bin/env bash
sudo apt-get -y update
sudo apt-get -y install build-essential libssl-dev
curl https://raw.githubusercontent.com/creationix/nvm/v0.16.1/install.sh | sh

export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
nvm install 5.2.0
nvm alias default 5.2.0

echo "nvm use default" >> ~/.profile
