import path from 'path'

import { fs, log } from '@grundstein/commons'

import { colors, writeFile } from '../lib/index.mjs'

export default async config => {
  const { dir, env } = config

  const { YELLOW, GREEN, NC } = colors

  const containerName = 'grundstein-dev'
  const installFile = 'grundsteinlegung.sh'

  const hostScripts = await fs.getFiles(path.join(dir, 'hosts'))

  const hostDir = `/home/${env.USERNAME}/hosts`

  const certDir = `/home/${env.USERNAME}/certificates`

  const hostCertificateGenerators = config.hosts
    .map(host =>
      host.hostnames
        .map(name =>
          `
su - ${env.USERNAME} -c "mkdir -p ${certDir}/"

printf "${YELLOW}writing certificate${NC}: ${certDir}/${name}\\n"

openssl req -x509 -out ${certDir}/${name}.crt -keyout ${certDir}/${name}.key \
-newkey rsa:2048 -nodes -sha256 \
-subj '/CN=${name}' -extensions EXT -config <( \
printf "[dn]\nCN=${name}\\n[req]\\ndistinguished_name = dn\\n[EXT]\\n\
subjectAltName=DNS:${name}\\nkeyUsage=digitalSignature\\nextendedKeyUsage=serverAuth")

printf "root certificate ${GREEN}generated${NC}\\n\\n"


  `.trim(),
        )
        .join('\n'),
    )
    .join('\n')

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}generate certificates${NC}\\n\\n"

${hostCertificateGenerators}

printf "certificates: ${GREEN}generated${NC}"
`.trimStart()

  await writeFile({ name: 'dev-certificates', config, contents, dir })

  return contents
}
