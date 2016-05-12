#!/usr/bin/env bash
sudo apt-get update -y
sudo apt-get -y install apt-transport-https ca-certificates
sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
sudo bash -c 'echo "deb https://apt.dockerproject.org/repo ubuntu-precise main" > /etc/apt/sources.list.d/docker.list'
sudo apt-get -y update
sudo apt-get -y purge lxc-docker
apt-cache policy docker-engine
sudo apt-get -y update
sudo apt-get -y install linux-image-extra-$(uname -r)
sudo apt-get -y update
sudo apt-get -y install docker-engine
sudo service docker start
sudo groupadd docker
sudo gpasswd -a ${USER} docker
sudo service docker restart
#newgrp docker
echo "==================================="
echo "==================================="
echo "End docker install"
