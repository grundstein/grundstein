#!/usr/bin/env bash

set -euf -o pipefail

export TZ=Europe/Vienna

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

printf "${GREEN}GRUNDSTEIN${NC} starting ${RED}DE${NC}bootstrap\n"

# install git
apt remove -y certbot python3-pip #git makepasswd curl nano software-properties-common

# prepare certbot install
add-apt-repository --remove -y ppa:certbot/certbot

# install certbot digitalocean plugin.
pip3 uninstall certbot-dns-digitalocean

# cleanup unneeded packages
apt -y autoremove

printf "${GREEN}GRUNDSTEIN${NC} ${GREEN}DE${NC}bootstrap done\n"
