import path from 'path'

import { cli, fs, is, log } from '@grundstein/commons'

import { mergeConfig, writeFile, writeEtcHosts } from './lib/index.mjs'

import sh from './sh/index.mjs'

export const run = async args => {
  const cwd = process.cwd()

  const config = await mergeConfig({ cwd, args })

  config.dir = path.join(cwd, 'bootstrap')

  await fs.rmrf(config.dir)
  await fs.mkdirp(config.dir)

  await writeEtcHosts(config)

  // this writes the bootstrap/grundsteinlegung.sh file
  // this file gets executed on every host and installs all dependencies.
  await sh.grundsteinlegung(config)

  // this generates one file per host, including the services, this host should start.
  await sh.services(config)

  // generate the bootstrap/dev.sh file,
  // which can be used to simulate the grundstein cloud locally.
  await sh.dev(config)

  // generate the production shell script.
  // this script will scp the config files to the server,
  // then start the grundsteinlegung via ssh.
  await sh.prod(config)
}

export default run
