#!/usr/bin/env node

import { cli, is, log } from '@grundstein/commons'

import run from './index.mjs'

const opts = {
  options: [
    ['--help', '-help', 'help', '--h', '-h'],
    ['--prod', '-p'],
    ['--force', '-f'],
  ],
  single: ['--prod', '--force'],
  help: {
    name: 'grundstein',
    header: 'sets up servers.',
    options: {
      '--prod': 'connect to production server and start installation.',
      '--force': 'force reinstallation. use with caution. treat this like git push -f.',
    },
    example: `
# run development:
grundstein --dev
`,
  },
}

const { args } = cli(opts)

const doIt = async () => {
  const isProd = is.defined(args.prod)
  const isForced = is.defined(args.force)

  if (isForced && isProd) {
    log.warn('SERVER INSTALL', 'This will force installation on your production server!')

    const yesNo = await cli.prompt('Are you sure? (y/N)', { yesNo: true })

    if (!yesNo) {
      log('Aborting.')
      process.exit(0)
    }
  }

  await run(args)

  if (!isProd) {
    await cli.spawn('/usr/bin/env', ['bash', 'bootstrap/dev.sh'])
  } else {
    log.error('PROD_NOT_IMPLEMENTED', 'production mode is not implemented. yet.')
    process.exit()
  }
}

doIt()
