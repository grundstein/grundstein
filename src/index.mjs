import path from 'path'
import cli from '@magic/cli'
import error from '@magic/error'
import fs from '@magic/fs'
import is from '@magic/types'

import { log } from '@grundstein/commons'

import { mergeConfig, writeFile } from './lib/index.mjs'

export const run = async () => {
  const cwd = process.cwd()

  const config = await mergeConfig(cwd)

  const dir = path.join(cwd, 'bootstrap')

  await fs.mkdirp(dir)

  await writeFile({ config, dir, name: 'grundsteinlegung' })

  await writeFile({ config, dir, name: 'services' })
}

export default run
