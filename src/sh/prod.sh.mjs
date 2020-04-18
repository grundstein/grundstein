import path from 'path'

import { is, log } from '@grundstein/commons'

import fs from '@magic/fs'

import { writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir, env } = config

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const localHostDir = path.join(dir, 'hosts')
  const remoteHostDir = `/home/${env.USERNAME}/hosts`

  const { hosts } = config

  const hostInitScripts = hosts
    .map(host => {
      let { ips } = host

      if (!is.array(ips)) {
        ips = [ips]
      }

      return ips
        .map(ip =>
          `
scp -r ${localHostDir}/${ip}/* ${env.SSH_USER}@${ip}:${remoteHostDir} && \
ssh ${env.SSH_USER}@${ip} "/grundsteinlegung.sh" &
`.trim(),
        )
        .join('\n')
    })
    .join('\n')

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "GRUNDSTEIN - running development environment.\\n"

${hostInitScripts}
`.trimStart()

  await writeFile({ name: 'prod', config, contents, dir })

  return contents
}
