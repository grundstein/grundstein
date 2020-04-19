import path from 'path'

import { is, log } from '@grundstein/commons'

import fs from '@magic/fs'

import { colors, writeFile } from '../lib/index.mjs'

export const createBash = async config => {
  log('Configure host:', config.host)

  const { host, env } = config
  const { services, repositories } = host

  let { ips } = host
  if (!is.array(ips)) {
    ips = [ips]
  }

  const { USERNAME, USERHOME } = env

  const { YELLOW, RED, GREEN, NC } = colors

  const dir = path.join(config.dir, 'hosts')

  await fs.mkdirp(dir)

  const serviceList = Object.keys(services)
    .map(s => `grundstein/${s}`)
    .join(' ')

  const install = `npm install -g ${serviceList}`

  const clone = Object.entries(repositories)
    .map(([name, r]) =>
      `
printf "${YELLOW}cloning page:${NC} ${name}\\n"

DIR="${USERHOME}/repositories/${name}"

printf "writing repository to $DIR\\n"

if [ ! -d "$DIR" ] ; then
  git clone -b ${r.branch} git://${r.host}/${r.org}/${r.repo} $DIR > /dev/null
else
  cd "$DIR"
  git pull origin ${r.branch} > /dev/null
fi

cd "$DIR"

npm install

npm test

npm run build

if [ -d "$DIR/docs" ]; then
  mkdir -p /var/www/html/
  cp -r ./docs /var/www/html/${name}
fi

if [ -d "$DIR/api" ]; then
  mkdir -p /var/www/api
  cp -r ./api /var/www/api/${name}
fi

printf "${GREEN}GRUNDSTEIN${NC} - page for ${name} cloned.\\n\\n"
`.trim(),
    )
    .join('\n')

  const runServices = Object.entries(services)
    .map(([service, config]) => {
      const conf = Object.entries(config)
        .filter(([k]) => k !== 'name')
        .map(([k, v]) => `--${k}="${v}"`)
        .join(' ')

      return `
cp /grundsteinlegung/src/systemd/${service}.service /etc/systemd/system/

systemctl enable ${service}
systemctl start ${service}
  `.trim()
    })
    .join('\n')

  const sh = `
${install}

mkdir -p ${USERHOME}/repositories

${clone}

${runServices}
    `.trim()

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}grundstein${NC} service setup.\\n"

${sh}

printf "service setup ${GREEN}done${NC}\\n\\n"
`.trimStart()

  await Promise.all(
    ips.map(async name => await writeFile({ config, contents, dir, name })),
  )

  return contents
}

export default async c => await Promise.all(c.hosts.map(host => createBash({ ...c, host })))
