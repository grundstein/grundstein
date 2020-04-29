import path from 'path'

import { is, log } from '@grundstein/commons'

import { colors, writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir, env } = config

  const { GREEN, RED, YELLOW, NC } = colors

  const { INSTALL_LOG, LOG_DIR } = env

  const redirectLog = `>> ${INSTALL_LOG} 2>&1`

  const lockFileHandling = is.defined(config.args.force)
    ? 'rm -f /grundstein.lock'
    : `
if test -f "/grundstein.lock"; then
  printf "/grundstein.lock exists.\\n"
  printf "there is an installation running or a past installation failed.\\n"
  printf "to force reinstallation, add the --force flag to the grundstein command.\\n"
  exit 1
fi
`

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

export DEBIAN_FRONTEND=noninteractive

printf "${YELLOW}touch${NC} /grundstein.lock"

${lockFileHandling}

touch /grundstein.lock

printf " - ${GREEN}done${NC}\\n\\n"

printf "${YELLOW}log dir${NC} - mkdir -p ${LOG_DIR}"

mkdir -p ${LOG_DIR}

printf " - ${GREEN}created${NC}\\n\\n"

echo "GRUNDSTEIN - starting.\\n\\n" > ${INSTALL_LOG}

printf "${YELLOW}apt update${NC}"

apt-get -y update ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}language${NC} - setup"

sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen

locale-gen ${redirectLog}

export LANG='en_US.UTF-8'
export LANGUAGE='en_US:en'
export LC_ALL='en_US.UTF-8'

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}timezones${NC} - setup"

apt-get install -y tzdata ntp ${redirectLog}

ln -fs /usr/share/zoneinfo/${env.TZ} /etc/localtime

dpkg-reconfigure -f noninteractive tzdata ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"




printf "${YELLOW}install${NC} dependencies"

# curl needed for nvm
# makepasswd needed for user generation below
# nano should later be removed from the list, convenience install for dev.

apt-get -qq -y install \
git \
makepasswd \
curl \
software-properties-common \
nano \
${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}apt upgrade${NC}"

apt-get -qq -y upgrade ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}apt autoremove${NC}"

apt-get -y autoremove ${redirectLog}

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}git clone${NC} grundsteinlegung"

if [ ! -d "/grundsteinlegung" ] ; then
  git clone "${env.GIT_URL}/cli" /grundsteinlegung ${redirectLog}
else
  cd /grundsteinlegung
  git pull origin master ${redirectLog}
  cd /
fi

printf " - ${GREEN}cloned${NC}\\n\\n"



printf "${YELLOW}user generation${NC}"

# add user if it does not exist.
# one should be fine for now.
# we do not need to know the password.
id -u "${env.USERNAME}" &>/dev/null || (
  PASSWORD=$(makepasswd --min 42 --max 42)
  useradd -m -p "$PASSWORD" -d "${env.USERHOME}" -s /bin/bash "${env.USERNAME}"
)

printf " - ${GREEN}done${NC}\\n\\n"




printf "${YELLOW}nodejs${NC}"

command -v node >/dev/null 2>&1 && NODE_VERSION=$(node --version) || NODE_VERSION="0"

if (test "$NODE_VERSION" != "v13.*") then
  printf " - install - "

  /usr/bin/env bash /grundsteinlegung/bash/node.sh ${redirectLog}

  printf " - ${GREEN}done${NC}\\n\\n"
else
  echo " $NODE_VERSION - already ${GREEN}installed${NC}\\n\\n"
fi


`.trimStart()

  await writeFile({ name: 'grundsteinlegung', config, contents, dir })

  return contents
}
