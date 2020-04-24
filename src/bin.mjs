#!/usr/bin/env node

import { cli } from '@grundstein/commons'

import run from './index.mjs'

const opts = {
  options: [['--help', '-help', 'help', '--h', '-h']],
  help: {
    name: 'grundstein',
    header: 'sets up servers.',
    example: `
# run setup:
grundstein
`,
  },
}

const { args } = cli(opts)

run(args)
