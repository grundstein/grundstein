import path from 'path'
import cli from '@magic/cli'
import error from '@magic/error'
import fs from '@magic/fs'
import is from '@magic/types'

import { log } from '@grundstein/commons'

import config from '@grundstein/hosts'

export const run = async () => {
  const cwd = process.cwd()

  const defaultEnv = {
    TZ: 'Europe/Vienna',
    USERNAME: 'grundstein"',
    USERHOME: '$HOME/grundstein',
    NODE_INSTALL_VERSION: '13',
    GIT_URL: 'git://github.com/grundstein',
    GIT_CLOUD_REPO: 'cloud.grundstein.it',
    CONFIG_FILE: 'grundstein-config.sh',

    RED: '\\033[0;31m',
    GREEN: '\\033[0;32m',
    YELLOW: '\\033[1;33m',
    NC: '\\033[0m',
  }

  const env = {
    ...defaultEnv,
    ...config.env,
  }

  const bashConfig = Object.entries(env).map(([key, value]) =>
    `export ${key}="${value}"`)
    .join('\n')

  const writeBashConfig = Object.entries(env).map(([key, value]) =>
    `echo 'export ${key}="${value}"' >> /grundstein-config.sh`)
    .join('\n')

  const { hosts, repos } = config

  if (is.empty(env) || is.empty(hosts) || is.empty(repos)) {
    const err = error(
      'E_CONFIG_BROKEN',
      'the configuration is missing something. better debug coming soon, sorry.',
    )
    log.error(err)
    process.exit(1)
  }

  log({ env })
  log({ hosts })
  log({ repos })

  const bootstrapDir = path.join(cwd, 'bootstrap')

  await fs.mkdirp(bootstrapDir)

  const bootstrapFile = path.join(bootstrapDir, 'grundsteinlegung.sh')

  const bootstrapScriptContents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "GRUNDSTEIN writing config file\\n"

${bashConfig}

${writeBashConfig}

printf "GRUNDSTEIN wrote /grundstein-config.sh file successfully\\n"

printf "GRUNDSTEIN source config file to get it\'s content and make sure it works\\n"

source /grundstein-config.sh

ln -snf /usr/share/zoneinfo/${env.TZ} /etc/localtime && echo ${env.TZ} > /etc/timezone

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

  log(`Wrote ${bootstrapFile}.`)
  log('use "npm run test:cli" to run a local docker testrun.')
}

export default run
