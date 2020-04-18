import { log } from '@grundstein/commons'

import { writeFile } from '../lib/index.mjs'

export default async config => {
  log('Creating grundsteinlegung.sh', config)

  const { dir } = config

  const bashConfig = Object.entries(config.env)
    .map(([key, value]) => `export ${key}="${value}"`)
    .join('\n')

  const writeBashConfig = Object.entries(config.env)
    .map(([key, value]) => `echo 'export ${key}="${value}"' >> /grundstein-config.sh`)
    .join('\n')

  const { env } = config

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "GRUNDSTEIN writing config file\\n"

# ${bashConfig}

${writeBashConfig}

printf "GRUNDSTEIN wrote /grundstein-config.sh file successfully\\n"

printf "GRUNDSTEIN source config file to get it\'s content and make sure it works\\n"

source /grundstein-config.sh

ln -snf /usr/share/zoneinfo/${env.TZ} /etc/localtime && echo ${env.TZ} > /etc/timezone

printf "\${YELLOW}GRUNDSTEIN\${NC} starting bootstrap\\n"

echo "apt update"
apt-get -y update > /dev/null
echo "apt update finished"

echo "install dependencies"

# curl needed for nvm
# makepasswd needed for user generation below
# nano should later be removed from the list, convenience install for dev.
apt-get -qq -y install git makepasswd curl python software-properties-common python3-pip nano > /dev/null

echo "apt upgrade"
apt-get -qq -y upgrade > /dev/null
echo "apt upgrade done"

# cleanup unneeded packages
echo "apt autoremove"
apt-get -y autoremove > /dev/null
echo "apt autoremove done"

printf "\${GREEN}GRUNDSTEIN\${NC} apt installation done.\\n"


printf "\${YELLOW}GRUNDSTEIN\${NC} starting git clone of grundsteinlegung.\\n"

git clone --quiet "$GIT_URL/legung" /grundsteinlegung

printf "\${GREEN}GRUNDSTEIN\${NC} grundsteinlegung cloned. starting service setup\\n"

# generate grundstein user
/usr/bin/env bash /grundsteinlegung/bash/create-user.sh

/usr/bin/env bash /grundsteinlegung/bash/node.sh

/usr/bin/env bash /grundsteinlegung/bash/certbot.sh
`.trimStart()

  await writeFile({ name: 'grundsteinlegung', config, contents, dir })

  return contents
}
