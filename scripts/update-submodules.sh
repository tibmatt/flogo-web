#!/usr/bin/env bash
cd ..
git submodule update --init -- submodules/flogo-services
# make sure always pulls the latest changes from flogo-contrib
rm -rf submodules/flogo-contrib
git submodule update --init --remote -- submodules/flogo-contrib
