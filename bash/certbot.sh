#!/usr/bin/env bash

set -euf -o pipefail

source /grundstein-config.sh

printf "${YELLOW}GRUNDSTEIN${NC} - prepare certbot install\n"
add-apt-repository -y universe > /dev/null
add-apt-repository -y ppa:certbot/certbot > /dev/null
apt -y -qq update

# actually install certbot
apt -y install certbot > /dev/null

# install certbot digitalocean plugin.
pip3 install certbot-dns-digitalocean

printf "${GREEN}GRUNDSTEIN${NC} - certbot install done\n"
