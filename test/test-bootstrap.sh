#!/usr/bin/env bash

set -euf -o pipefail

CONTAINER_NAME="grundstein-install-test"
INSTALL_FILE="bootstrap-grundstein.sh"

sudo docker build test --tag="$CONTAINER_NAME"

if [[ $(sudo docker ps -q -f name=$CONTAINER_NAME) ]]; then
   sudo docker rm "$CONTAINER_NAME" -f
fi

sudo docker run --rm -td --name="$CONTAINER_NAME" "$CONTAINER_NAME"

sudo docker cp "./bash/$INSTALL_FILE" "$CONTAINER_NAME:/"

sudo docker exec -it "$CONTAINER_NAME" /bin/bash /$INSTALL_FILE

