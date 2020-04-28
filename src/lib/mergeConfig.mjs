import path from 'path'

import { is, log } from '@grundstein/commons'

import defaultConfig from '../defaultConfig.mjs'

export const mergeConfig = async ({ cwd, args }) => {
  let config = {
    ...defaultConfig,
    cwd,
    args,
  }

  try {
    const { default: npmConfig } = await import('@grundstein/hosts')

    config = npmConfig
  } catch (e) {
    if (e.code !== 'ERR_MODULE_NOT_FOUND') {
      throw e
    }

    log.warn('NO_NPM_CONFIG', '@grundstein/hosts not installed. using local config.')
  }

  // load local config file if it exists in cwd.
  const localConfigFile = path.join(cwd, 'grundstein-config.mjs')

  try {
    const { default: localConfig } = await import(localConfigFile)
    config = {
      ...config,
      ...localConfig,
    }
  } catch (e) {
    if (e.code !== 'ERR_MODULE_NOT_FOUND') {
      throw e
    }

    log.warn('NO_LOCAL_CONFIG', `${localConfigFile} could not be found. using default config.`)
  }

  if (is.empty(config.env) || is.empty(config.hosts)) {
    log.error(
      'E_CONFIG_BROKEN',
      'the configuration is missing something. better debug coming soon, sorry.',
    )
    process.exit(1)
  }

  let { LOG_DIR = '/grundstein' } = config.env

  if (!LOG_DIR.startsWith('/var/log/')) {
    LOG_DIR = `/var/log/${LOG_DIR}/`.replace(/\/\//g, '/')
  }

  config.env.LOG_DIR = LOG_DIR

  config.env.INSTALL_LOG = LOG_DIR + 'install.log'
  config.env.ERROR_LOG = LOG_DIR + 'error.log'

  return config
}
