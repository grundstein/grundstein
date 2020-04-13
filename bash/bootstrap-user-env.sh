#!/usr/bin/env bash

set -euf -o pipefail

source /grundsteinlegung/bash/config.sh

printf "${YELLOW}GRUNDSTEIN${NC} starting user env generation.\n"

echo "whoami? $(whoami)"

printf "${YELLOW}GRUNDSTEIN${NC} installing nodejs.\n"

export NVM_DIR="$USERHOME/.nvm"

bash /grundsteinlegung/bash/nvm-install.sh

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

printf "${GRUNDSTEIN} install node ${NODE_VERSION} and use it as default"

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
