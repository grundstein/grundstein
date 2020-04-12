#!/usr/bin/env bash

set -euf -o pipefail

export TZ=Europe/Vienna

export USERNAME="grundstein"
export USERHOME="/home/grundstein"
export NODE_VERSION=13
export NVM_DIR="$USERHOME/.nvm"
export GIT_URL="git://github.com/grundstein"

# update apt sources
apt update

# install git
apt install -y git software-properties-common makepasswd curl nano

# prepare certbot install
# add-apt-repository -y universe
# add-apt-repository -y ppa:certbot/certbot
# apt update

# actually install certbot
# apt install -y certbot

# install certbot digitalocean plugin.
# pip3 install certbot-dns-digitalocean

# update packages
# apt upgrade

# autoremove unneeded packages
# apt autoremove

# add user. one should be fine. we do not need to know the password

id -u "$USERNAME" &>/dev/null && userdel grundstein

PASSWORD=$(makepasswd --min 42 --max 42)
useradd -m -p "$PASSWORD" -d "$USERHOME" -s /bin/bash "$USERNAME"

# switch to grundstein user

su - $USERNAME <<!
echo "switched to $(whoami)"

export NVM_DIR="$USERHOME/.nvm" && (
  git clone https://github.com/nvm-sh/nvm.git "$NVM_DIR"
  cd "$NVM_DIR"
  git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)`
) && \. "$NVM_DIR/nvm.sh"

# install node 13 and use it as default
nvm install $NODE_VERSION
nvm use $NODE_VERSION

# clone the cloud env
git clone "$GIT_URL/cloud.grundstein.it" "$USERHOME/cloud.grundstein.it"

# clone the various grundstein services

git clone $GIT_URL/gms $USERHOME/gms || echo "gms cloned already"
cd $USERHOME/gms && git pull && npm install

git clone $GIT_URL/gas $USERHOME/gas || echo "gas cloned already"
cd $USERHOME/gas && git pull && npm install

# create systemd startup files
!

echo "root again $(whoami)"

git clone $GIT_URL/legung /grundsteinlegung
cp /grundsteinlegung/systemd/* /lib/systemd/system

# reload daemon to load new .service files
systemctl daemon-reload

# run services
systemctl start gms
systemctl start gas
# not built yet
# systemctl start gul
# systemctl start ghs

# enable services
systemctl enable gms
systemctl enable gas
# systemctl enable gul
# systemctl enable ghs

# iptables port forwards
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 4343

# make iptables port forwards sticky
echo "iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080" >> /etc/rc.local
echo "iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 4343" >> /etc/rc.local

# clean up
apt remove -y curl makepasswd
apt -y autoremove
