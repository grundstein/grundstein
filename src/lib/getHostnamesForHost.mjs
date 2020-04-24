export const getHostnamesForHost = host => {
  const { hostnames = [], repositories = [] } = host

  return [hostnames, Object.keys(repositories)].flat()
}
