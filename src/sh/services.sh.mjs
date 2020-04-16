import path from 'path'

import { log } from '@grundstein/commons'

import fs from '@magic/fs'

import { writeFile } from '../lib/index.mjs'

export const createBash = async config => {
  log('Configure host:', config.host)

  const { host } = config
  const { name, services, repositories } = host

  const dir = path.join(config.dir, 'hosts')

  await fs.mkdirp(dir)

  const serviceList = Object.keys(services)
    .map(s => `grundstein/${s}`)
    .join(' ')

  const install = `npm install -g ${serviceList}`

  const clone = Object.entries(repositories)
    .map(
      ([name, r]) =>
        `
printf "\${YELLOW}GRUNDSTEIN\${NC} - cloning page for ${name}

git clone -b ${r.branch} git://${r.host}/${r.org}/${r.repo} ./${name}

cd ./${name}

npm install

npm test

npm run build

printf "\${GREEN}GRUNDSTEIN\${NC} - page for ${name} cloned.
`,
    )
    .join('\n')

  const sh = `
${install}

mkdir -p /home/$USERNAME/repositories

cd /home/$USERNAME/repositories

${clone.trim()}

cd /
    `.trim()

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

source /grundsteinlegung/bash/config.sh

printf "\${YELLOW}GRUNDSTEIN\${NC} starting grundstein service setup.\\n"

${sh}

printf "\${GREEN}GRUNDSTEIN\${NC} service setup finished successfully.\\n"

`.trimStart()

  await writeFile({ config, contents, dir, name })

  return contents
}

export default async c => await Promise.all(c.hosts.map(host => createBash({ ...c, host })))
