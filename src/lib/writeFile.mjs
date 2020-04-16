import path from 'path'
import { log } from '@grundstein/commons'
import { fs } from '@magic/fs'

import sh from '../sh/index.mjs'

export const writeFile = async ({ dir, name, config, contents }) => {
  const file = path.join(dir, `${name}.sh`)

  try {
    await fs.writeFile(file, contents)
  } catch (e) {
    log.error('E_WRITE_FILE', e)
    process.exit(1)
  }

  log.success('Wrote:', file)
}
