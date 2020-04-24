import path from 'path'

import { is, fs, log } from '@grundstein/commons'

import { colors, getHostnamesForHost, writeFile } from '../lib/index.mjs'

import internalCertificates from './internalCertificates.mjs'

export const createBash = async config => {
  log('Configure host:', config.host)

  const { host, env } = config
  const { services, repositories } = host

  let { ips } = host
  if (!is.array(ips)) {
    ips = [ips]
  }

  const hostnames = getHostnamesForHost(host)

  const { INSTALL_LOG, USERNAME, USERHOME } = env

  const { YELLOW, RED, GREEN, NC } = colors

  const dir = path.join(config.dir, 'hosts')

  await fs.mkdirp(dir)

  const serviceList = Object.keys(services)
    .map(s => `grundstein/${s}`)
    .join(' ')

  const install = `npm install -g ${serviceList} >> ${INSTALL_LOG} 2>&1`

  const clone = Object.entries(repositories)
    .map(
      ([name, r]) =>
        `
printf "${YELLOW}cloning page:${NC} ${name}\\n"

DIR="${USERHOME}/repositories/${name}"

printf "writing repository to $DIR\\n"

if [ ! -d "$DIR" ] ; then
  git clone -b ${r.branch} git://${r.host}/${r.org}/${r.repo} $DIR >> ${INSTALL_LOG} 2>&1
else
  cd "$DIR"
  git pull origin ${r.branch} >> ${INSTALL_LOG} 2>&1
fi

cd "$DIR"

npm install >> ${INSTALL_LOG} 2>&1

npm test >> ${INSTALL_LOG} 2>&1

npm run build >> ${INSTALL_LOG} 2>&1

# copy docs directory, if it exists
if [ -d "$DIR/docs" ]; then
  mkdir -p /var/www/html/
  cp -r ./docs /var/www/html/${name}
fi

# copy api directory, if it exists
if [ -d "$DIR/api" ]; then
  mkdir -p /var/www/api
  cp -r ./api /var/www/api/${name}
fi

printf "${GREEN}GRUNDSTEIN${NC} - page for ${name} cloned.\\n\\n"
`,
    )
    .join('\n')

  const runServices = Object.entries(services)
    .map(
      ([service, config]) => `
printf "${YELLOW}@grundstein/${service}${NC} setup\\n\\n"

cp /grundsteinlegung/src/systemd/${service}.service /etc/systemd/system/

systemctl enable ${service}

systemctl start ${service}

printf "@grundstein/${service} setup - ${GREEN}done${NC}\\n\\n"
  `,
    )
    .join('\n')

  let certificateScripts = ''

  // this assumes only one gps server.
  // this should scale for quite some time though, it's just the proxy.
  // this will likely be a high-mem, high cpu instance later.
  if (serviceList.includes('grundstein/gps')) {

    let createLetsencryptCertificates

    if (config.args.prod) {
      const secretFile = '/root/.secrets/digitalocean.ini'
      createLetsencryptCertificates = `


if test -f "${secretFile}"; then

  printf "${YELLOW}certbot certonly${NC} - generate certificates for ${hostnames.join(' ')}\\n"

  certbot certonly \
    --dns-digitalocean \
    --dns-digitalocean-credentials ~/.secrets/digitalocean.ini \
    --dns-digitalocean-propagation-seconds 60 \
    ${hostnames.join(' -d ')}

  printf "certbot certonly - ${GREEN}done${NC}\\n\\n"
fi

`
    }

    certificateScripts += `
printf "${YELLOW}certbot${NC} - install\\n"

add-apt-repository -y universe >> ${INSTALL_LOG} 2>&1
add-apt-repository -y ppa:certbot/certbot >> ${INSTALL_LOG} 2>&1
apt-get -y update >> ${INSTALL_LOG} 2>&1

# actually install certbot
TZ=${env.TZ} apt-get -y install \
python \
python3-pip \
certbot \
>> ${INSTALL_LOG} 2>&1

# install certbot digitalocean plugin.
pip3 install certbot-dns-digitalocean >> ${INSTALL_LOG} 2>&1

printf "certbot install: ${GREEN}done${NC}\\n\\n"


printf "${YELLOW}certbot${NC} - generate certificates\\n\\n"

${createLetsencryptCertificates}

printf "certificate generation ${GREEN}done${NC}\\n\\n"

    `.trim()

    certificateScripts += internalCertificates(config)
  }

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail



printf "${YELLOW}set hostname${NC} to ${host.name}\\n"

# tail wants +2 to remove the first line.
HOST_FILE_CONTENT=$(tail -n +2 /etc/hosts)

NEW_HOST_FILE_CONTENT="127.0.0.1  ${host.fqdn} ${host.name}\n\${HOST_FILE_CONTENT} localhost\n"

echo "\${NEW_HOST_FILE_CONTENT}"

echo "\${NEW_HOST_FILE_CONTENT}" > /etc/hosts

echo "${host.name}" > /etc/hostname

printf "\\n\\nhostname: \$(hostname) fqdn: \$(hostname -f)\\n\\n"



printf "${YELLOW}grundstein${NC} service setup.\\n"

${install}

mkdir -p ${USERHOME}/repositories

${clone}

${certificateScripts}

${runServices}

printf "service setup ${GREEN}done${NC}\\n\\n"

printf "${YELLOW}removing /grundstein.lock${NC}"

# this file got touch'ed in grundsteinlegung.sh
rm /grundstein.lock

printf "- ${GREEN}done${NC}\\n\\n"

`.trimStart()

  await Promise.all(ips.map(async name => await writeFile({ config, contents, dir, name })))

  return contents
}

export default async c => await Promise.all(c.hosts.map(host => createBash({ ...c, host })))
