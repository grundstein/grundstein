#!/usr/bin/env bash

set -euf -o pipefail

source bash/config.sh

export NVM_DIR="$USERHOME/.nvm" && (
  git clone https://github.com/nvm-sh/nvm.git "$NVM_DIR"
  cd "$NVM_DIR"
  git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)`
) && \. "$NVM_DIR/nvm.sh"

# install node 13 and use it as default
nvm install $NODE_VERSION
nvm use $NODE_VERSION

# echo node versions
nvm --version
node --version
npm --version

# clone the cloud env
git clone "$GIT_URL/cloud.grundstein.it" "$USERHOME/cloud.grundstein.it"

# clone the various grundstein services

git clone $GIT_URL/gms $USERHOME/gms || echo "gms cloned already"
cd $USERHOME/gms && git pull && npm install

git clone $GIT_URL/gas $USERHOME/gas || echo "gas cloned already"
cd $USERHOME/gas && git pull && npm install
