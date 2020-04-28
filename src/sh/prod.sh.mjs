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

  const createHostInitScript = host => `
ssh root@${host.ip} bash -s < bootstrap/grundsteinlegung.sh
ssh root@${host.ip} bash -s < bootstrap/hosts/${host.ip}.sh
`

  const hostInitScripts = hosts.map(createHostInitScript).join('\n\n\n')

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "GRUNDSTEIN - running development environment.\\n"

${hostInitScripts}
`.trimStart()

  await writeFile({ name: 'prod', config, contents, dir })

  return contents
}
