#!/usr/bin/env bash

set -euf -o pipefail

source bash/config.sh

printf "${YELLOW}GRUNDSTEIN${NC} starting user env generation.\n"

echo "whoami? $(whoami)"

printf "${YELLOW}GRUNDSTEIN${NC} installing nodejs.\n"

export NVM_DIR="$USERHOME/.nvm"

git clone https://github.com/nvm-sh/nvm.git $NVM_DIR
cd $NVM_DIR
git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)`

# install node 13 and use it as default
$NVM_DIR/nvm.sh install $NODE_VERSION
$NVM_DIR/nvm.sh use $NODE_VERSION

# echo node versions
$NVM_DIR/nvm.sh --version
node --version
npm --version

printf "${GREEN}GRUNDSTEIN${NC} nodejs installed.\n"

printf "${YELLOW}GRUNDSTEIN${NC} cloning grundstein services.\n"

# clone the cloud env
git clone "$GIT_URL/cloud.grundstein.it" "$USERHOME/cloud.grundstein.it"

# clone the various grundstein services

printf "${YELLOW}GRUNDSTEIN${NC} cloning gms.\n"
git clone $GIT_URL/gms $USERHOME/gms || echo "gms cloned already"
cd $USERHOME/gms && git pull && npm install

printf "${YELLOW}GRUNDSTEIN${NC} cloning gas.\n"
git clone $GIT_URL/gas $USERHOME/gas || echo "gas cloned already"
cd $USERHOME/gas && git pull && npm install

printf "${GREEN}GRUNDSTEIN${NC} user env generation finished successfully.\n"
