import path from 'path'

import { log } from '@grundstein/commons'

import fs from '@magic/fs'

import { colors, writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir } = config

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const { YELLOW, RED, GREEN, NC } = colors

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}GRUNDSTEIN DEV DOCKER${NC} \\n\\n"

printf "this script builds and runs docker, it needs the root.\\n\\n\\n"

if [[ $(sudo docker ps -q -f name=${containerName}) ]]; then
  sudo docker rm -f "${containerName}"
fi

sudo docker build dev --tag="${containerName}"

sudo docker run -td -p 2350:2350 -p 2351:2351 -p 80:8080 -p 443:4343 --name="${containerName}" "${containerName}"

sudo docker cp "./bootstrap/${installFile}" "${containerName}:/"

sudo docker exec -it "${containerName}" /usr/bin/env bash /${installFile}

printf "docker dev build: ${GREEN}done${NC}"
`.trimStart()

  await writeFile({ name: 'docker', config, contents, dir })

  return contents
}
