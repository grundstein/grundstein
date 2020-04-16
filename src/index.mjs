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

  const dir = path.join(cwd, 'bootstrap')

  await fs.mkdirp(dir)

  // this writes the bootstrap/grundsteinlegung.sh file
  // this file gets executed on every host and installs all dependencies.
  await sh.grundsteinlegung({ ...config, dir })

  // this generates one file per host, including the services, this host should start.
  await sh.services({ ...config, dir })

  // this generates the bootstrap/dev.sh file,
  // which can be used to simulate the grundstein cloud locally.
  await sh.dev({ ...config, dir })
}

export default run
