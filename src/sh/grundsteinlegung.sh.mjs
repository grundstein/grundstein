import { log } from '@grundstein/commons'

import { colors, writeFile } from '../lib/index.mjs'

export default async config => {
  log('Creating grundsteinlegung.sh', config)

  const { dir, env } = config

  const { GREEN, RED, YELLOW, NC } = colors

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

export DEBIAN_FRONTEND=noninteractive



printf "${YELLOW}apt update${NC}\\n"

apt-get -y -qq update > /dev/null

printf "apt update: ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}timezones${NC} - setup\\n"

ln -fs /usr/share/zoneinfo/${env.TZ} /etc/localtime

apt-get install -y -qq tzdata > /dev/null

dpkg-reconfigure -f noninteractive tzdata > /dev/null

printf "timezones: ${GREEN}done${NC}\\n\\n"

printf "${YELLOW}install${NC} dependencies\\n"

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
> /dev/null

printf "install dependencies: ${GREEN}done${NC}\\n\\n"


printf "${YELLOW}apt upgrade${NC}\\n"

apt-get -qq -y upgrade > /dev/null

printf "apt upgrade: ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}apt autoremove${NC}\\n"

apt-get -y autoremove > /dev/null

printf "apt autoremove ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}git clone${NC} grundsteinlegung.\\n"

git clone --quiet "${env.GIT_URL}/cli" /grundsteinlegung

printf "grundsteinlegung ${GREEN}cloned${NC}\\n\\n"



printf "${YELLOW}user generation${NC}\\n"

# add user if it does not exist.
# one should be fine for now.
# we do not need to know the password.
id -u "${env.USERNAME}" &>/dev/null || (
  PASSWORD=$(makepasswd --min 42 --max 42)
  useradd -m -p "$PASSWORD" -d "${env.USERHOME}" -s /bin/bash "${env.USERNAME}"
)

printf "user generation: ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}certbot${NC} - install\\n"

add-apt-repository -y universe > /dev/null
add-apt-repository -y ppa:certbot/certbot > /dev/null
apt-get -y -qq update

# actually install certbot
TZ=${env.TZ} apt-get -qq -y install certbot > /dev/null

# install certbot digitalocean plugin.
pip3 install certbot-dns-digitalocean > /dev/null

printf "certbot install: ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}install${NC} nodejs\\n"
# install nodejs
/usr/bin/env bash /grundsteinlegung/bash/node.sh

printf "nodejs install ${GREEN}done${NC}\\n\\n"

`.trimStart()

  await writeFile({ name: 'grundsteinlegung', config, contents, dir })

  return contents
}
