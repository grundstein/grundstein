import path from 'path'

import { fs, log } from '@grundstein/commons'

import { colors, getAllHostnames, writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir, env } = config

  const { YELLOW, GREEN, NC } = colors

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const hostScripts = await fs.getFiles(path.join(dir, 'hosts'))

  const hostDir = `/home/${env.USERNAME}/hosts`

  const certDir = `/root/ca`

  const hostnames = getAllHostnames(config)

  const createRootCertificate = `

mkdir ${certDir}

mkdir -p ${certDir}/certs ${certDir}/crl ${certDir}/newcerts ${certDir}/private
chmod 700 private
touch index.txt
echo 2323 > serial


`

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}generate certificates${NC}\\n\\n"



printf "certificates: ${GREEN}generated${NC}"
`.trimStart()

  await writeFile({ name: 'internal-certificates', config, contents, dir })

  return contents
}
