import path from 'path'

import { fs, log } from '@grundstein/commons'

import { colors, getAllHostnames, writeFile } from '../lib/index.mjs'

export default config => {
  const { YELLOW, GREEN, NC } = colors

  const certDir = `/root/ca`

  const hostnames = getAllHostnames(config)

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

printf "${YELLOW}generate certificates${NC}\\n\\n"

printf "${YELLOW}root ca${NC} - generate\\n\\n"

mkdir ${certDir}

mkdir -p ${certDir}/certs ${certDir}/crl ${certDir}/newcerts ${certDir}/private
chmod 700 private
touch index.txt
echo 2323 > serial

printf "${YELLOW}openssl.cnf${NC} - copy\\n\\n"

cp /grundsteinlegung/bash/openssl.cnf ${certDir}/


PASSWORD=$(makepasswd --min 42 --max 42)

printf "${YELLOW}root key${NC} - generate\\n\\n"

openssl genrsa -aes256 -out ${certDir}/private/ca.key.pem 4096 -passout pass:\${PASSWORD}

chmod 400 ${certDir}/private/ca.key.pem

printf "${YELLOW}root certificate${NC} - generate\\n\\n"

openssl req -config openssl.cnf \
      -key private/ca.key.pem \
      -new -x509 -days 7300 -sha256 -extensions v3_ca \
      -out certs/ca.cert.pem \
      -passout pass:\${PASSWORD}

chmod 444 ${certDir}/certs/ca.cert.pem

printf "${YELLOW}root certificate${NC} - test\\n\\n"

openssl x509 -noout -text -in certs/ca.cert.pem

printf "root ca certificate setup - ${GREEN}done${NC}\\n\\n"

printf "certificates: ${GREEN}generated${NC}"
`.trimStart()

  return contents
}
