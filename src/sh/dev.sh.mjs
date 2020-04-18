import path from 'path'

import { log } from '@grundstein/commons'

import fs from '@magic/fs'

import { colors, writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir, env } = config

  const { YELLOW, GREEN, NC } = colors

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const hostScripts = await fs.getFiles(path.join(dir, 'hosts'))

  const hostDir = `/home/${env.USERNAME}/hosts`

  const hostInitScripts = hostScripts
    .map(script =>
      `
sudo docker exec -it ${containerName} mkdir -p ${hostDir}

sudo docker cp ${script} ${containerName}:${hostDir}/

sudo docker exec -it ${containerName} /usr/bin/env bash ${hostDir}/${path.basename(script)}
`.trim(),
    )
    .join('\n\n')

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}starting dev env${NC}\\n\\n"

printf "${YELLOW}certificates${NC} - generate self-signed certificates\\n"

${hostInitScripts}

printf "dev env ${GREEN}started${NC}"
`.trimStart()

  await writeFile({ name: 'dev', config, contents, dir })

  return contents
}
