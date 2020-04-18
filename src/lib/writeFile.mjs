import path from 'path'
import { log } from '@grundstein/commons'
import { fs } from '@magic/fs'

import sh from '../sh/index.mjs'

export const writeFile = async ({ dir, name, config, contents }) => {
  const file = path.join(dir, `${name}.sh`)

  const fileDir = path.dirname(file)

  try {
    await fs.mkdirp(fileDir)

    await fs.writeFile(file, contents)
  } catch (e) {
    log.error('E_WRITE_FILE', e)
    process.exit(1)
  }

  log.success('Wrote:', file)
}
