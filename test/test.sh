#!/usr/bin/env bash

set -euf -o pipefail

CONTAINER_NAME="grundstein-install-test"
INSTALL_FILE="grundsteinlegung.sh"

sudo docker build test --tag="$CONTAINER_NAME"

sudo docker rm "$CONTAINER_NAME" -f

sudo docker run --rm -td --name="$CONTAINER_NAME" "$CONTAINER_NAME"

sudo docker cp "./$INSTALL_FILE" "$CONTAINER_NAME:/"

sudo docker exec -it "$CONTAINER_NAME" /bin/bash #/$INSTALL_FILE

