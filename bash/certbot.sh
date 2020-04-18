#!/usr/bin/env bash

set -euf -o pipefail

source /grundstein-config.sh

# prepare certbot install
add-apt-repository -y universe
add-apt-repository -y ppa:certbot/certbot
apt -y update

# actually install certbot
TZ=Europe/Vienna && apt -y install certbot

# install certbot digitalocean plugin.
pip3 install certbot-dns-digitalocean

