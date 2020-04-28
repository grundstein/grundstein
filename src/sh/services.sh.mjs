import path from 'path'

import { is, fs, log } from '@grundstein/commons'

import { colors, getHostnamesForHost, writeFile } from '../lib/index.mjs'

import internalCertificates from './internalCertificates.mjs'

export const createBash = async config => {
  const { host, env } = config
  const { services, repositories } = host

  let { ip } = host

  const hostnames = getHostnamesForHost(host)

  const { INSTALL_LOG, USERNAME, USERHOME } = env

  const { YELLOW, RED, GREEN, NC } = colors

  const dir = path.join(config.dir, 'hosts')

  await fs.mkdirp(dir)

  const serviceRootDir = `${USERHOME}/services`

  const serviceNames = Object.keys(services)

  const install = serviceNames
    .map(service => {
      const serviceDir = `${serviceRootDir}/${service}`

      return `


printf "${YELLOW}@grundstein/${service}${NC} install"

mkdir -p ${serviceRootDir}


if [ ! -d "${serviceDir}" ] ; then
  git clone git://github.com/grundstein/${service} ${serviceDir} >> ${INSTALL_LOG} 2>&1
else
  cd "${serviceDir}"
  git pull origin master >> ${INSTALL_LOG} 2>&1
fi


cd ${serviceDir}

npm install >> ${INSTALL_LOG} 2>&1

npm test >> ${INSTALL_LOG} 2>&1

npm link >> ${INSTALL_LOG} 2>&1

cd /

printf " - ${GREEN}done${NC}\\n\\n"


`
    })
    .join('')

  const clone = Object.entries(repositories)
    .map(
      ([name, r]) =>
        `


printf "${YELLOW}cloning page:${NC} ${name}"

DIR="${USERHOME}/repositories/${name}"

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

printf " - ${GREEN}done${NC}.\\n\\n"


`,
    )
    .join('\n')

  const runServices = Object.entries(services)
    .map(
      ([service, config]) => `


printf "${YELLOW}@grundstein/${service}${NC} setup"

cp /grundsteinlegung/src/systemd/${service}.service /etc/systemd/system/

systemctl enable ${service}

systemctl start ${service}

printf " - ${GREEN}done${NC}\\n\\n"


`,
    )
    .join('\n')

  let certificateScripts = ''

  // this assumes only one gps server.
  // this should scale for quite some time though, it's just the proxy.
  // this will likely be a high-mem, high cpu instance later.
  if (serviceNames.includes('gps')) {
    let createLetsencryptCertificates = ''

    if (is.defined(config.args.prod)) {
      const secretFile = '/.secrets/digitalocean.ini'
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



printf "${YELLOW}certbot${NC} - install"

add-apt-repository -y universe >> ${INSTALL_LOG} 2>&1
add-apt-repository -y ppa:certbot/certbot >> ${INSTALL_LOG} 2>&1
apt-get -y update >> ${INSTALL_LOG} 2>&1

# actually install certbot
TZ=${env.TZ} apt-get -y install \
python \
python3-certbot-dns-digitalocean
certbot \
>> ${INSTALL_LOG} 2>&1

printf " - ${GREEN}done${NC}\\n\\n"


printf "${YELLOW}certbot${NC} - generate certificates"

${createLetsencryptCertificates}

printf " - ${GREEN}done${NC}\\n\\n"



`

    // certificateScripts += internalCertificates(config)
  }

  let iptables = ''

  if (Object.keys(services).includes('gps')) {
    iptables = `



printf "${YELLOW}iptables${NC} - setup"

apt-get -y install iptables-persistent >> ${INSTALL_LOG} 2>&1

# flush rules
iptables -F

# internal
iptables -I INPUT 1 -i lo -j ACCEPT

# track connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# ports to open
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
iptables -A INPUT -p tcp --dport 4343 -j ACCEPT
iptables -A INPUT -p tcp --dport 2350 -j ACCEPT

# port redirects

iptables -t nat -A OUTPUT -o lo -p tcp --dport 80 -j REDIRECT --to-port 8080
iptables -t nat -A OUTPUT -o lo -p tcp --dport 443 -j REDIRECT --to-port 4343

iptables -A INPUT -j DROP

# save
netfilter-persistent save >> ${INSTALL_LOG} 2>&1
netfilter-persistent reload >> ${INSTALL_LOG} 2>&1

printf " - ${GREEN}done${NC}\\n\\n"



`
  }

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail

${certificateScripts}

printf "${YELLOW}grundstein${NC} service setup.\\n"

${install}

mkdir -p ${USERHOME}/repositories

${clone}

${iptables}

${runServices}

printf "${YELLOW}removing /grundstein.lock${NC}"

# this file got touch'ed in grundsteinlegung.sh
rm /grundstein.lock

printf " - ${GREEN}done${NC}\\n\\n"

echo "${YELLOW}GRUNDSTEIN${NC} - install finished." >> ${INSTALL_LOG}

printf "INSTALL FINISHED.\\n"
`.trimStart()

  await writeFile({ config, contents, dir, name: ip })

  return contents
}

export default async c => await Promise.all(c.hosts.map(host => createBash({ ...c, host })))
