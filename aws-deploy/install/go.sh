#!/usr/bin/env bash
sudo apt-get -y update
sudo apt-get -y upgrade
sudo curl -O https://storage.googleapis.com/golang/go1.6.linux-amd64.tar.gz
sudo tar -xvf go1.6.linux-amd64.tar.gz

sudo mv go      /usr/local
export PATH=$PATH:$HOME/.golang_default/bin:/usr/local/go/bin
export GOPATH=$HOME/.golang_default

sudo rm -rf go1.6.linux-amd64.tar.gz
echo "export PATH=$PATH:$HOME/.golang_default/bin:/usr/local/go/bin" >> ~/.profile
echo "export GOPATH=$HOME/.golang_default" >> ~/.profile
echo "==================================="
echo "Instaling GB"
echo "==================================="
go get github.com/constabulary/gb/...
echo "==================================="
echo "==================================="
echo "End go install"
