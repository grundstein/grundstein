import path from 'path'

import { log } from '@grundstein/commons'

import fs from '@magic/fs'

import { writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir } = config

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const hostScripts = await fs.getFiles(path.join(dir, 'hosts'))

  const hostDir = `/home/${config.env.USERNAME}/hosts`

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

source ${env.CONFIG_FILE}

printf "GRUNDSTEIN - running development environment.\\n"

${hostInitScripts}
`.trimStart()

  await writeFile({ name: 'dev', config, contents, dir })

  return contents
}
