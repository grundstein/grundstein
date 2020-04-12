#!/usr/bin/env bash

set -euf -o pipefail

CONTAINER_NAME="grundstein-install-test"
INSTALL_FILE="grundsteinlegung.sh"

sudo docker rm "$CONTAINER_NAME" -f

sudo docker run --rm -td --name="$CONTAINER_NAME" -p 127.0.0.1:80:80 ubuntu:18.04

sudo docker cp $INSTALL_FILE "$CONTAINER_NAME":/$INSTALL_FILE

sudo docker exec -it "$CONTAINER_NAME" /bin/bash /$INSTALL_FILE

