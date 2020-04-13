#!/usr/bin/env bash

set -euf -o pipefail

source /grundsteinlegung/bash/config.sh

printf "${YELLOW}GRUNDSTEIN${NC} starting user env generation.\n"

echo "whoami? $(whoami)"

printf "${YELLOW}GRUNDSTEIN${NC} npm install grundstein services.\n"

npm install -g grundstein/gms grundstein/gas grundstein/gps

printf "${GREEN}GRUNDSTEIN${NC} npm install finished successfully.\n"
