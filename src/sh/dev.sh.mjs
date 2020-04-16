import { log } from '@grundstein/commons'

import { writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir } = config

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "GRUNDSTEIN - running a development build.\\n\\n\\n"

printf "GRUNDSTEIN - this script runs docker, it needs the root.\\n\\n\\n"

sudo docker build dev --tag="${containerName}"

if [[ $(sudo docker ps -q -f name=${containerName}) ]]; then
   sudo docker rm "${containerName}" -f
fi

sudo docker run --rm -td --name="${containerName}" "${containerName}"

sudo docker cp "./bootstrap/${installFile}" "${containerName}:/"

sudo docker exec -it "${containerName}" /usr/bin/env bash /${installFile}
`.trimStart()

  await writeFile({ name: 'dev', config, contents, dir })

  return contents
}
