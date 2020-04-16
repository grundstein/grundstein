#!/usr/bin/env bash

set -euf -o pipefail

export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export NC='\033[0m' # No Color

CONTAINER_NAME='grundstein-install-test'
INSTALL_FILE='grundsteinlegung.sh'

printf "${YELLOW}GRUNDSTEIN${NC} - this script runs docker, it needs the root.\n"

sudo docker build dev --tag="$CONTAINER_NAME"

if [[ $(sudo docker ps -q -f name=$CONTAINER_NAME) ]]; then
   sudo docker rm "$CONTAINER_NAME" -f
fi

sudo docker run --rm -td --name="$CONTAINER_NAME" "$CONTAINER_NAME"

sudo docker cp "./bootstrap/$INSTALL_FILE" "$CONTAINER_NAME:/"

sudo docker exec -it "$CONTAINER_NAME" /bin/bash /$INSTALL_FILE
