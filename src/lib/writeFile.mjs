import path from 'path'
import { log } from '@grundstein/commons'
import { fs } from '@magic/fs'

import bash from '../bash/index.mjs'

export const writeFile = async ({ dir, name, config }) => {
  const file = path.join(dir, `${name}.sh`)

  try {
    const contents = bash[name](config)

    await fs.writeFile(file, contents)
  } catch (e) {
    log.error('E_WRITE_FILE', e)
    process.exit(1)
  }

  log.success('Wrote:', file)
}
