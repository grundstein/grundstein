#!/usr/bin/env bash

set -euf -o pipefail

export TZ="Europe/Vienna"

ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

export USERNAME="grundstein"
export USERHOME="/home/grundstein"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

printf "${YELLOW}GRUNDSTEIN${NC} starting bootstrap\n"

# update apt sources
apt -y update

# install git
apt -y install git software-properties-common makepasswd curl nano python3-pip

# prepare certbot install
add-apt-repository -y universe
add-apt-repository -y ppa:certbot/certbot
apt -y update

# actually install certbot
TZ=Europe/Vienna && apt -y install certbot

# install certbot digitalocean plugin.
pip3 install certbot-dns-digitalocean

# update packages
apt -y upgrade

# cleanup unneeded packages
apt -y autoremove

printf "${GREEN}GRUNDSTEIN${NC} apt installation done.\n"

printf "${YELLOW}GRUNDSTEIN${NC} starting user generation\n"
# remove user if it exists

id -u "$USERNAME" &>/dev/null && userdel grundstein

# add user. one should be fine for now. we do not need to know the password
PASSWORD=$(makepasswd --min 42 --max 42)
useradd -m -p "$PASSWORD" -d "$USERHOME" -s /bin/bash "$USERNAME"

printf "${GREEN}GRUNDSTEIN${NC} user generated successfully.\n"

printf "${GREEN}GRUNDSTEIN${NC} bootstrap done\n"

printf "${YELLOW}GRUNDSTEIN${NC} starting git clone of grundsteinlegung."

git clone git://github.com/grundstein/legung /grundsteinlegung

cd /grundsteinlegung

sudo su -c "/usr/bin/env bash bash/bootstrap-user-env.sh"
