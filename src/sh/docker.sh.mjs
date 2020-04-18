import path from 'path'

import { log } from '@grundstein/commons'

import fs from '@magic/fs'

import { writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir } = config

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "GRUNDSTEIN - this script builds and runs docker, it needs the root.\\n\\n\\n"

if [[ $(sudo docker ps -q -f name=${containerName}) ]]; then
  sudo docker rm -f "${containerName}"
fi

sudo docker build dev --tag="${containerName}"

sudo docker run -td -p 2350:2350 -p 2351:2351 -p 8080:8080 -p 4343:4343 --name="${containerName}" "${containerName}"

sudo docker cp "./bootstrap/${installFile}" "${containerName}:/"

sudo docker exec -it "${containerName}" /usr/bin/env bash /${installFile}
`.trimStart()

  await writeFile({ name: 'docker', config, contents, dir })

  return contents
}
