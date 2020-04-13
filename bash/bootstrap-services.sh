#!/usr/bin/env bash

set -euf -o pipefail

source /grundsteinlegung/bash/config.sh

printf "${YELLOW}GRUNDSTEIN${NC} starting grundstein service setup.\n"

echo "whoami? $(whoami)"

printf "${YELLOW}GRUNDSTEIN${NC} git clone cloud.grundstein.it\n"

git clone "git://github.com/grundstein/${GIT_CLOUD_REPO}" "/home/${USERNAME}/${GIT_CLOUD_REPO}"

printf "${YELLOW}GRUNDSTEIN${NC} npm install grundstein services.\n"

npm install -g grundstein/gms grundstein/gas grundstein/gps

printf "${GREEN}GRUNDSTEIN${NC} service setup finished successfully.\n"
