#!/usr/bin/env bash
echo "===Installing docker"
sh docker.sh
echo "===Installing go"
sh go.sh
echo "===Installing java"
sh java.sh
echo "===Installing node"
sh node.sh
