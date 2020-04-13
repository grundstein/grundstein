#!/usr/bin/env bash

set -euf -o pipefail

source /grundsteinlegung/bash/config.sh

printf "${YELLOW}GRUNDSTEIN${NC} starting user env generation.\n"

echo "whoami? $(whoami)"

printf "${YELLOW}GRUNDSTEIN${NC} installing nodejs.\n"

export NVM_DIR="$USERHOME/.nvm"

git clone https://github.com/nvm-sh/nvm.git $NVM_DIR
cd $NVM_DIR
git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)`

source "/home/$USERNAME/.bashrc"

nvm --version

# install node 13 and use it as default
nvm install $NODE_VERSION
nvm use $NODE_VERSION

# echo node versions
node --version
npm --version

printf "${GREEN}GRUNDSTEIN${NC} nodejs installed.\n"

printf "${YELLOW}GRUNDSTEIN${NC} cloning grundstein services.\n"

# clone the cloud env
git clone "$GIT_URL/cloud.grundstein.it" "$USERHOME/cloud.grundstein.it"

# clone the various grundstein services

npm install -g grundstein/gms grundstein/gas

printf "${GREEN}GRUNDSTEIN${NC} user env generation finished successfully.\n"
