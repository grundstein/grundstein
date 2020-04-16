import { log } from '@grundstein/commons'

export const createHostBash = conf => {
  log('Configure host:', conf.host)

  const { services, repositories } = conf.host

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

  return sh
}

export default config => {
  const hostConfigScript = config.hosts.map(host => createHostBash({ ...config, host }))

  return `
#!/usr/bin/env bash

set -euf -o pipefail

source /grundsteinlegung/bash/config.sh

printf "\${YELLOW}GRUNDSTEIN\${NC} starting grundstein service setup.\\n"

${hostConfigScript}

printf "\${GREEN}GRUNDSTEIN\${NC} service setup finished successfully.\\n"

`.trimStart()
}
