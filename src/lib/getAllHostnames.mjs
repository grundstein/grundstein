import  { getHostnamesForHost } from './getHostnamesForHost.mjs'

export const getAllHostnames = config => [
  ...new Set(config.hosts.map(getHostnamesForHost).flat())
]
