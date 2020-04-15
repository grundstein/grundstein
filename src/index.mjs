import path from 'path'
import cli from '@magic/cli'
import error from '@magic/error'
import fs from '@magic/fs'
import is from '@magic/types'

import { env, hosts, repos } from '@grundstein/hosts'

export const run = async () => {
  const cwd = process.cwd()

  if (is.empty(env) || is.empty(hosts) || is.empty(repos)) {
    const err = error('E_CONFIG_BROKEN', 'the configuration is missing something. better debug coming soon, sorry.')
    log.error(err)
    process.exit(1)
  }

  const bootstrapDir = path.join(cwd, 'bootstrap')

  await fs.mkdirp(bootstrapDir)

  const bootstrapFile = path.join(bootstrapDir, 'grundsteinlegung.sh')

  const bootstrapScriptContents = `
#!/usr/bin/env bash

set -euf -o pipefail

export TZ='${env.TZ}'
export GIT_URL='git://github.com/grundstein'

ln -snf /usr/share/zoneinfo/${env.TZ} /etc/localtime && echo ${env.TZ} > /etc/timezone

RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

printf "\${YELLOW}GRUNDSTEIN\${NC} starting bootstrap\\n"

# update apt sources
apt -y update

# install dependencies

# curl needed for nvm
# makepasswd needed for user generation below
# nano should later be removed from the list, convenience install for dev.
apt -y install git makepasswd curl nano python software-properties-common python3-pip

# update packages
apt -y upgrade

# cleanup unneeded packages
apt -y autoremove

printf "\${GREEN}GRUNDSTEIN\${NC} apt installation done.\\n"

printf "\${YELLOW}GRUNDSTEIN\${NC} starting git clone of grundsteinlegung.\\n"

git clone "$GIT_URL/legung" /grundsteinlegung

printf "\${GREEN}GRUNDSTEIN\${NC} grundsteinlegung cloned. starting service setup\\n"

# generate grundstein user
/usr/bin/env bash /grundsteinlegung/bash/create-user.sh

# install and setup certbot
# /usr/bin/env bash /grundsteinlegung/bash/certbot.sh

/usr/bin/env bash /grundsteinlegung/bash/node.sh

/usr/bin/env bash /grundsteinlegung/bash/services.sh
`.trimStart()

  await fs.writeFile(bootstrapFile, bootstrapScriptContents)
}

export default run
