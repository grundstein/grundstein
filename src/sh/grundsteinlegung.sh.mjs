import path from 'path'

import { is, log } from '@grundstein/commons'

import { colors, writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir, env } = config

  const { GREEN, RED, YELLOW, NC } = colors

  const { INSTALL_LOG, LOG_DIR } = env

  const logDir = path.dirname(INSTALL_LOG)

  const lockFileHandling =
    is.defined(config.args.force)
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

printf "${YELLOW}log dir${NC} - mkdir ${logDir}"

mkdir -p ${logDir}

printf " - ${GREEN}created${NC}\\n\\n"


mkdir -p ${LOG_DIR}

echo "" > ${INSTALL_LOG}

printf "${YELLOW}apt update${NC}"

apt-get -y update >> ${INSTALL_LOG} 2>&1

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}timezones${NC} - setup"

ln -fs /usr/share/zoneinfo/${env.TZ} /etc/localtime

apt-get install -y tzdata >> ${INSTALL_LOG} 2>&1

dpkg-reconfigure -f noninteractive tzdata >> ${INSTALL_LOG} 2>&1

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
ntp \
nano \
>> ${INSTALL_LOG} 2>&1

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}apt upgrade${NC}"

apt-get -qq -y upgrade >> ${INSTALL_LOG} 2>&1

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}apt autoremove${NC}"

apt-get -y autoremove >> ${INSTALL_LOG} 2>&1

printf " - ${GREEN}done${NC}\\n\\n"



printf "${YELLOW}git clone${NC} grundsteinlegung"

if [ ! -d "/grundsteinlegung" ] ; then
  git clone "${env.GIT_URL}/cli" /grundsteinlegung >> ${INSTALL_LOG} 2>&1
else
  cd /grundsteinlegung
  git pull origin master
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


printf "${YELLOW}install${NC} nodejs"

/usr/bin/env bash /grundsteinlegung/bash/node.sh >> ${INSTALL_LOG} 2>&1

printf " - ${GREEN}done${NC}\\n\\n"

`.trimStart()

  await writeFile({ name: 'grundsteinlegung', config, contents, dir })

  return contents
}
