import path from 'path'

import { is, fs, log } from '@grundstein/commons'

import { colors, getHostnamesForHost, writeFile } from '../lib/index.mjs'

export const createBash = async config => {
  log('Configure host:', config.host)

  const { host, env } = config
  const { services, repositories } = host

  let { ips } = host
  if (!is.array(ips)) {
    ips = [ips]
  }

  const hostnames = getHostnamesForHost(host)

  const { ERROR_LOG, INSTALL_LOG, USERNAME, USERHOME } = env

  const { YELLOW, RED, GREEN, NC } = colors

  const dir = path.join(config.dir, 'hosts')

  await fs.mkdirp(dir)

  const serviceList = Object.keys(services)
    .map(s => `grundstein/${s}`)
    .join(' ')

  const install = `npm install -g ${serviceList} >> ${INSTALL_LOG} 2>> ${ERROR_LOG}`

  const clone = Object.entries(repositories)
    .map(
      ([name, r]) =>
        `
printf "${YELLOW}cloning page:${NC} ${name}\\n"

DIR="${USERHOME}/repositories/${name}"

printf "writing repository to $DIR\\n"

if [ ! -d "$DIR" ] ; then
  git clone -b ${r.branch} git://${r.host}/${r.org}/${r.repo} $DIR >> ${INSTALL_LOG} 2>> ${ERROR_LOG}
else
  cd "$DIR"
  git pull origin ${r.branch} >> ${INSTALL_LOG} 2>> ${ERROR_LOG}
fi

cd "$DIR"

npm install >> ${INSTALL_LOG} 2>> ${ERROR_LOG}

npm test >> ${INSTALL_LOG} 2>> ${ERROR_LOG}

npm run build >> ${INSTALL_LOG} 2>> ${ERROR_LOG}

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

  const maybeCreateCertificates = () => {
    if (serviceList.includes('grundstein/gca')) {
      return `
printf "${YELLOW}certbot${NC} - install\\n"

add-apt-repository -y universe >> ${INSTALL_LOG} 2>> ${ERROR_LOG}
add-apt-repository -y ppa:certbot/certbot >> ${INSTALL_LOG} 2>> ${ERROR_LOG}
apt-get -y update >> ${INSTALL_LOG} 2>> ${ERROR_LOG}

# actually install certbot
TZ=${env.TZ} apt-get -y install \
python \
python3-pip \
certbot \
> ${INSTALL_LOG}

# install certbot digitalocean plugin.
pip3 install certbot-dns-digitalocean >> ${INSTALL_LOG} 2>> ${ERROR_LOG}

printf "certbot install: ${GREEN}done${NC}\\n\\n"


printf "${YELLOW}certbot${NC} - generate certificates\\n\\n"

# certbot certonly \
#  --dns-digitalocean \
#  --dns-digitalocean-credentials ~/.secrets/digitalocean.ini \
#  --dns-digitalocean-propagation-seconds 60 \
#  ${hostnames.join(' -d ')}

printf "certificate generation ${GREEN}done${NC}\\n\\n"

      `.trim()
    }

    return ''
  }

  const contents = `
#!/usr/bin/env bash

set -euf -o pipefail



printf "${YELLOW}set hostname${NC} to ${host.name}"

# hostnamectl set-hostname ${host.name}

printf "\\n\\nhostname: \$(hostname) fqdn: \$(hostname -f)\\n\\n"



${maybeCreateCertificates()}



printf "${YELLOW}grundstein${NC} service setup.\\n"

${install}

mkdir -p ${USERHOME}/repositories

${clone}

${runServices}

printf "service setup ${GREEN}done${NC}\\n\\n"
`.trimStart()

  await Promise.all(ips.map(async name => await writeFile({ config, contents, dir, name })))

  return contents
}

export default async c => await Promise.all(c.hosts.map(host => createBash({ ...c, host })))
