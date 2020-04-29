import { is } from '@magic/test'

import config, { env, hosts } from '../src/defaultConfig.mjs'

import run from '../src/index.mjs'

import * as colors from '../src/lib/colors.mjs'

export default [
  { fn: is.object(config), info: 'config is an object' },
  { fn: is.deep.equal(config.env, env), info: 'config.env and env are deep equal' },
  { fn: is.deep.equal(config.hosts, hosts), info: 'config.hosts and hosts are deep equal' },
  { fn: hosts.every(host => host.ip), info: 'config.hosts: every host has an ip' },
  { fn: hosts.every(host => host.name), info: 'config.hosts: every host has a name' },
  { fn: hosts.every(host => host.fqdn), info: 'config.hosts: every host has a fqdn' },
  { fn: hosts.every(host => host.services), info: 'config.hosts: every host has services' },

  { fn: is.fn(run), info: 'src/index.mjs exports a function' },

  { fn: Object.values(colors).every(is.string), info: 'all lib/colors are strings' },
]
