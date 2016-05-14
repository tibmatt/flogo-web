#!/usr/bin/env bash
# INSTALL JAVA (for state-server and process-server)
# needs to be java 8
sudo add-apt-repository ppa:openjdk-r/ppa -y
sudo apt-get update
sudo apt-get -y install openjdk-8-jdk

sudo update-ca-certificates -f
