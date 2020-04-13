#!/usr/bin/env bash

set -euf -o pipefail

export TZ=Europe/Vienna

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

printf "${GREEN}GRUNDSTEIN${NC} starting bootstrap\n"

# update apt sources
apt update -q -y

# install git
apt install -q -y git software-properties-common makepasswd curl nano python3-pip

# prepare certbot install
add-apt-repository -q universe
add-apt-repository -q ppa:certbot/certbot
apt update

# actually install certbot
apt install -y -q certbot

# install certbot digitalocean plugin.
pip3 install -q certbot-dns-digitalocean

# update packages
apt -y -q upgrade

# cleanup unneeded packages
apt -y -q autoremove

printf "${GREEN}GRUNDSTEIN${NC} apt installation done."

print "${GREEN}GRUNDSTEIN${NC}"

printf "${GREEN}GRUNDSTEIN${NC} bootstrap done\n"
