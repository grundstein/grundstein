#!/usr/bin/env bash

set -euf -o pipefail

source /grundsteinlegung/bash/config.sh

printf "${YELLOW}GRUNDSTEIN${NC} starting user env generation.\n"

echo "whoami? $(whoami)"

printf "${YELLOW}GRUNDSTEIN${NC} installing nodejs.\n"

export NVM_DIR="$USERHOME/.nvm"

bash /grundstein/legung/bash/nvm-install.sh

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
