import path from 'path'

import { log } from '@grundstein/commons'

import fs from '@magic/fs'

import { writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir } = config

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const localHostDir = path.join(dir, 'hosts')
  const remoteHostDir = `/home/${config.env.USERNAME}/hosts`

  const { hosts } = config

  const hostInitScripts = hosts.map(host => {
    console.log({ host })
    return `
    scp -r ${localHostDir} ${config.env.SSH_USER}@${config.env.HOST}:${remoteHostDir}
  `.trim()
  }).join('\n')

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "GRUNDSTEIN - running development environment.\\n"

${hostInitScripts}
`.trimStart()

  await writeFile({ name: 'prod', config, contents, dir })

  return contents
}
