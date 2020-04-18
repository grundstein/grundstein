import path from 'path'
import cli from '@magic/cli'
import error from '@magic/error'
import fs from '@magic/fs'
import is from '@magic/types'

import { log } from '@grundstein/commons'

import { mergeConfig, writeFile } from './lib/index.mjs'

import sh from './sh/index.mjs'

export const run = async () => {
  const cwd = process.cwd()

  const config = await mergeConfig(cwd)

  config.dir = path.join(cwd, 'bootstrap')

  await fs.mkdirp(config.dir)

  // this writes the bootstrap/grundsteinlegung.sh file
  // this file gets executed on every host and installs all dependencies.
  await sh.grundsteinlegung(config)

  // this generates one file per host, including the services, this host should start.
  await sh.services(config)

  // builds and runs the development docker builds
  await sh.docker(config)

  // this generates the bootstrap/dev.sh file,
  // which can be used to simulate the grundstein cloud locally.
  await sh.dev(config)

  // generate the production shell script.
  // this script will scp the config files to the server,
  // then start the grundsteinlegung via ssh.
  await sh.prod(config)
}

export default run
