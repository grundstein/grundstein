#!/usr/bin/env bash

set -euf -o pipefail

source bash/config.sh

# actually install certbot
TZ=Europe/Vienna && apt -y install certbot

# install certbot digitalocean plugin.
pip3 install certbot-dns-digitalocean

