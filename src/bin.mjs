#!/usr/bin/env node

import { cli, is, log } from '@grundstein/commons'

import run from './index.mjs'

const opts = {
  options: [
    ['--help', '-help', 'help', '--h', '-h'],
    ['--prod', '-p'],
    ['--force', '-f'],
    ['--build', '-b'],
  ],
  single: ['--prod', '--force'],
  help: {
    name: 'grundstein',
    header: 'sets up servers.',
    options: {
      '--prod': 'connect to production server and start installation.',
      '--force': 'force reinstallation. use with caution. treat this like git push -f.',
      '--build': 'only build sh files, do not (re)start any services',
    },
    example: `
# run development:
grundstein

# connect to server and (re)install the services.
grundstein --prod
`,
  },
}

const { args } = cli(opts)

const doIt = async () => {
  const isProd = is.defined(args.prod)
  const isForced = is.defined(args.force)
  const isBuild = is.defined(args.build)

  if (isForced && isProd) {
    log.warn('SERVER INSTALL', 'This will force (re?)installation on your production server!')
    log.info('all services should keep working and restart automatically. it is prod though!')

    const yesNo = await cli.prompt('Are you sure?', { yesNo: true })

    if (!yesNo) {
      log('Aborting.')
      process.exit(0)
    }
  }

  await run(args)

  if (!isBuild) {
    if (!isProd) {
      await cli.spawn('/usr/bin/env', ['bash', 'bootstrap/dev.sh'])
    } else {
      await cli.spawn('/usr/bin/env', ['bash', 'bootstrap/prod.sh'])
    }
  }
}

doIt()
