import path from 'path'

import { fs } from '@grundstein/commons'

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

  let devDirectory = path.join(dir, '..', 'dev')
  const devDirectoryExists = await fs.exists(devDirectory)

  if (!devDirectoryExists) {
    devDirectory = path.join(dir, '..', 'node_modules', 'grundstein', 'dev')
  }

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}GRUNDSTEIN DEV DOCKER${NC} \\n\\n"

printf "this script builds and runs docker, it needs the root.\\n\\n\\n"

# remove docker if it is running
if [[ $(sudo docker ps -aq -f name=${containerName}) ]]; then
  sudo docker rm -f "${containerName}"
fi

sudo docker build ${devDirectory} --tag="${containerName}"

# TODO: change 2323:4343 to 443:4343 once the local certificates are being generated.
sudo docker run \
--cap-add=NET_ADMIN \
--privileged=true \
-td \
-p 2350:2350 \
-p 2351:2351 \
-p 80:8080 \
-p 2323:4343 \
--name="${containerName}" \
"${containerName}"

sudo docker cp "./bootstrap/${installFile}" "${containerName}:/"

sudo docker exec -it "${containerName}" /usr/bin/env bash /${installFile}

printf "${YELLOW}docker${NC} - dev build - ${GREEN}done${NC}\\n\\n\\n"



${hostScripts
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
      .join('\n\n')}



printf "dev env ${GREEN}started${NC}\\n\\n"
`.trimStart()

  await writeFile({ name: 'dev', config, contents, dir })

  return contents
}
