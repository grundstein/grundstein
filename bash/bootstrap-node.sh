#!/usr/bin/env bash

set -euf -o pipefail

source /grundsteinlegung/bash/config.sh

printf "${YELLOW}GRUNDSTEIN${NC} starting user env generation.\n"

echo "whoami? $(whoami)"

printf "${YELLOW}GRUNDSTEIN${NC} installing nodejs.\n"

bash /grundsteinlegung/bash/nvm-install.sh

printf "${YELLOW}GRUNDSTEIN${NC} install node ${NODE_VERSION} and use it as default"

nvm install $NODE_VERSION
nvm use $NODE_VERSION

printf "${GREEN}GRUNDSTEIN${NC} nodejs ${NODE_VERSION} installed.\n"
