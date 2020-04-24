import path from 'path'

import { is, log } from '@grundstein/commons'

import defaultConfig from '../defaultConfig.mjs'

export const mergeConfig = async cwd => {
  let config = defaultConfig

  try {
    const { default: npmConfig } = await import('@grundstein/hosts')

    config = npmConfig
  } catch (e) {
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
    log.warn('NO_LOCAL_CONFIG', `${localConfigFile} could not be found. using default config.`)
  }

  if (is.empty(config.env) || is.empty(config.hosts)) {
    log.error(
      'E_CONFIG_BROKEN',
      'the configuration is missing something. better debug coming soon, sorry.',
    )
    process.exit(1)
  }

  let { INSTALL_LOG = '/grundstein' } = config.env

  if (!INSTALL_LOG.startsWith('/var/logs/')) {
    INSTALL_LOG = `/var/logs/${INSTALL_LOG}`.replace(/\/\//g, '/')
  }

  config.env.INSTALL_LOG = INSTALL_LOG

  log('env', JSON.stringify(config.env, null, 2))
  log('hosts', JSON.stringify(config.hosts, null, 2))

  return config
}
