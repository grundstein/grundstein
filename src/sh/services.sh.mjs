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

  const redirectLog = `>> ${INSTALL_LOG} 2>&1`

  const { YELLOW, RED, GREEN, NC } = colors

  const dir = path.join(config.dir, 'hosts')

  await fs.mkdirp(dir)

  const serviceRootDir = `${USERHOME}/services`

  const install = services
    .map(
      service => `


printf "${YELLOW}@grundstein/${service}${NC} install"

mkdir -p ${serviceRootDir}


if [ ! -d "${serviceRootDir}/${service}" ] ; then
  git clone git://github.com/grundstein/${service} ${serviceRootDir}/${service} ${redirectLog}
else
  cd "${serviceRootDir}/${service}"
  git pull origin master ${redirectLog}
fi


cd ${serviceRootDir}/${service}

rm -rf node_modules package-lock.json ${redirectLog}

npm install ${redirectLog}

npm test ${redirectLog}

npm link ${redirectLog}

cd /

printf " - ${GREEN}done${NC}\\n\\n"


`,
    )
    .join('')

  const clone = Object.entries(repositories)
    .map(
      ([name, r]) =>
        `


printf "${YELLOW}cloning page:${NC} ${name}"

DIR="${USERHOME}/repositories/${name}"

if [ ! -d "$DIR" ] ; then
  git clone -b ${r.branch} git://${r.host}/${r.org}/${r.repo} $DIR ${redirectLog}
else
  cd "$DIR"
  git pull origin ${r.branch} ${redirectLog}
fi

cd "$DIR"

npm install ${redirectLog}

npm test ${redirectLog}

npm run build ${redirectLog}

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

  const runServices = services
    .map(
      service => `


printf "${YELLOW}@grundstein/${service}${NC} setup"

cp /grundsteinlegung/src/systemd/${service}.service /etc/systemd/system/

systemctl enable ${service}

systemctl restart ${service}

printf " - ${GREEN}done${NC}\\n\\n"


`,
    )
    .join('\n')

  let certificateScripts = ''

  // this assumes only one gps server.
  // this should scale for quite some time though, it's just the proxy.
  // this will likely be a high-mem, high cpu instance later.
  if (services.includes('gps')) {
    let createLetsencryptCertificates = ''

    if (is.defined(config.prod)) {
      const secretFile = '/.secrets/digitalocean.ini'

      const apexNames = [...new Set(hostnames.map(h => h.split('.').slice(-2).join('.')))]

      const certificateList = apexNames
        .map(
          name => `
  printf "${YELLOW}certbot certonly${NC} - generate certificates for ${name}"

  certbot certonly \\
    -n \\
    --dns-digitalocean \\
    --dns-digitalocean-credentials ${secretFile} \\
    --dns-digitalocean-propagation-seconds 10 \\
    --agree-tos \\
    --cert-name ${name} \\
    --email grundstein@jaeh.at \\
    -d *.${name} -d ${name} \\
    ${redirectLog}

  printf " - ${GREEN}done${NC}\\n\\n"

      `,
        )
        .join('\n\n\n')

      createLetsencryptCertificates = `

if test -f "${secretFile}"; then

  # add-apt-repository -y universe

  # add-apt-repository -y ppa:certbot/certbot

  # apt-get -y update

  # actually install certbot
  apt-get -y install \\
  python \\
  python3-certbot-dns-digitalocean \\
  certbot \\
  ${redirectLog}

  printf " - ${GREEN}done${NC}\\n\\n"


  printf "${YELLOW}certbot${NC} - generate certificates"

  ${certificateList}


  chown grundstein:root -R /etc/letsencrypt/archive /etc/letsencrypt/live
fi


`
    }

    certificateScripts += createLetsencryptCertificates

    // certificateScripts += internalCertificates(config)
  }

  let iptables = ''

  if (services.includes('gps')) {
    iptables = `



printf "${YELLOW}iptables${NC} - setup"

apt-get -y install iptables-persistent ${redirectLog}

# flush rules
iptables -F
iptables -t nat -F

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

iptables -t nat -A PREROUTING -p tcp -m tcp --dport 443 -j REDIRECT --to-ports 4343
iptables -t nat -A PREROUTING -p tcp -m tcp --dport 80 -j REDIRECT --to-ports 8080

iptables -A INPUT -j DROP

# save
iptables-save > /etc/iptables/rules.v4

netfilter-persistent save ${redirectLog}
netfilter-persistent reload ${redirectLog}

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
rm -f /grundstein.lock

printf " - ${GREEN}done${NC}\\n\\n"

echo "${YELLOW}GRUNDSTEIN${NC} - install finished." >> ${INSTALL_LOG}

printf "INSTALL FINISHED.\\n"
`.trimStart()

  await writeFile({ config, contents, dir, name: ip })

  return contents
}

export default async c => await Promise.all(c.hosts.map(host => createBash({ ...c, host })))
