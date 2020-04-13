#!/usr/bin/env bash

set -euf -o pipefail

# can not use config.sh in this file, will be fixed once this file gets generated.
export TZ="Europe/Vienna"
export USERNAME="grundstein"
export USERHOME="/home/grundstein"
export NVM_NODE_VERSION=13
export NVM_DIR="$USERHOME/.nvm"
export GIT_URL="git://github.com/grundstein"

ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

printf "${YELLOW}GRUNDSTEIN${NC} starting bootstrap\n"

# update apt sources
apt -y update

# install git

# curl needed for nvm
# makepasswd needed for user generation below
# nano should later be removed from the list, convenience install for dev.
apt -y install git makepasswd curl nano python software-properties-common python3-pip

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

printf "${YELLOW}GRUNDSTEIN${NC} starting git clone of grundsteinlegung.\n"

git clone git://github.com/grundstein/legung /grundsteinlegung

# /usr/bin/env bash /grundsteinlegung/bash/bootstrap-certbot.sh

chown grundstein:grundstein /grundsteinlegung/bash/nvm-install.sh

su - "$USERNAME" -c "/usr/bin/env bash /grundsteinlegung/bash/bootstrap-node.sh"

su - "$USERNAME" -c "/usr/bin/env bash /grundsteinlegung/bash/bootstrap-services.sh"
