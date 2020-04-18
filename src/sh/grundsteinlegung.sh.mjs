import { log } from '@grundstein/commons'

import { colors, writeFile } from '../lib/index.mjs'

export default async config => {
  log('Creating grundsteinlegung.sh', config)

  const { dir, env } = config

  const { GREEN, RED, YELLOW, NC } = colors

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail


echo "apt update"
apt-get -y -qq update > /dev/null
echo "apt update finished"



printf "${YELLOW}timezones${NC} - setup\\n"

ln -fs /usr/share/zoneinfo/${env.TZ} /etc/localtime

apt-get install -y -qq tzdata > /dev/null

dpkg-reconfigure -f noninteractive tzdata > /dev/null



printf "${YELLOW}install${NC} dependencies\\n"

# base dependencies first

apt-get -qq -y install \
software-properties-common \
apt-utils > /dev/null

# curl needed for nvm
# makepasswd needed for user generation below
# nano should later be removed from the list, convenience install for dev.
apt-get -qq -y install \
git \
makepasswd \
curl \
python \
software-properties-common \
python3-pip \
nano \
apt-utils > /dev/null

printf "${YELLOW}apt upgrade${NC}\\n"
apt-get -qq -y upgrade > /dev/null
printf "apt upgrade: ${GREEN}done${NC}\\n"

# cleanup unneeded packages
printf "${YELLOW}apt autoremove${NC}\\n"

apt-get -y autoremove > /dev/null

printf "apt autoremove ${GREEN}done${NC}\\n"

printf "install dependencies: ${GREEN}done${NC}\\n"


printf "${YELLOW}git clone${NC} grundsteinlegung.\\n"

git clone --quiet "$GIT_URL/legung" /grundsteinlegung

printf "grundsteinlegung ${GREEN}cloned${NC}\\n"



printf "${YELLOW}GRUNDSTEIN${NC} starting user generation\\n"

# add user if it does not exist.
# one should be fine for now.
# we do not need to know the password.
id -u "$USERNAME" &>/dev/null || (
  PASSWORD=$(makepasswd --min 42 --max 42)
  useradd -m -p "$PASSWORD" -d "$USERHOME" -s /bin/bash "$USERNAME"
)

printf "${GREEN}GRUNDSTEIN${NC} user generated successfully.\\n"



printf "${YELLOW}GRUNDSTEIN${NC} - prepare certbot install\\n"

add-apt-repository -y universe > /dev/null
add-apt-repository -y ppa:certbot/certbot > /dev/null
apt-get -y -qq update

# actually install certbot
TZ=${env.TZ} apt-get -qq -y install certbot > /dev/null

# install certbot digitalocean plugin.
TZ=${env.TZ} pip3 install certbot-dns-digitalocean

printf "${GREEN}GRUNDSTEIN${NC} - certbot install done\\n"

# install nodejs
/usr/bin/env bash /grundsteinlegung/bash/node.sh

`.trimStart()

  await writeFile({ name: 'grundsteinlegung', config, contents, dir })

  return contents
}
