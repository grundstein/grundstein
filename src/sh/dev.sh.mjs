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

  const configString = JSON.stringify(config, null, 2)
  const configFile = await writeFile({ name: 'config.json', contents: configString, config, dir })

  const hostInitScripts = hostScripts
    .map(script =>
      `
printf "${YELLOW}add init script${NC}: ${script}\\n"

sudo docker exec -it ${containerName} mkdir -p "${hostDir}"

sudo docker cp "${configFile}" "${containerName}:/"

sudo docker cp "${script}" "${containerName}:${hostDir}/"

sudo docker exec -it ${containerName} /usr/bin/env bash ${hostDir}/${path.basename(script)}

printf "add init script: ${GREEN}done${NC}\\n\\n"
`.trim(),
    )
    .join('\n\n')

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}starting dev env${NC}\\n\\n"

printf "${YELLOW}certificates${NC} - generate self-signed certificates\\n"

${hostInitScripts}

printf "dev env ${GREEN}started${NC}\\n\\n"
`.trimStart()

  await writeFile({ name: 'dev', config, contents, dir })

  return contents
}
