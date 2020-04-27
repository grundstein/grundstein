import path from 'path'

import { fs, is, log } from '@grundstein/commons'

import { writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir, env } = config

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const localHostDir = path.join(dir, 'hosts')
  const remoteHostDir = `/home/${env.USERNAME}/`

  const { hosts } = config

  const hostInitScripts = hosts
    .map(
      host => `
scp -r ${localHostDir}/${host.ip}.sh ${env.SSH_USER}@${ip}:${remoteHostDir}/init.sh && \
ssh ${env.SSH_USER}@${host.ip} "/grundsteinlegung.sh" &
`,
    )
    .join('\n\n\n')

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "GRUNDSTEIN - running development environment.\\n"

${hostInitScripts}
`.trimStart()

  await writeFile({ name: 'prod', config, contents, dir })

  return contents
}
