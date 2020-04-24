import { cli, fs, log } from '@grundstein/commons'

import { getAllHostnames } from './getAllHostnames.mjs'

export const writeEtcHosts = async config => {
  const hostContent = await fs.readFile(path.join('/etc', 'hosts'), 'utf8')

  const hostnames = getAllHostnames(config)

  const missingHostnames = hostnames.filter(host => !hostContent.includes(host))

  if (missingHostnames.length) {
    const hostFileData = `
# grundstein local hosts

127.0.0.1     ${missingHostnames.join(' ')}

# grundstein local hosts end
`
    let newHostContent = hostContent + hostFileData

    if (hostContent.includes('# grundstein local hosts')) {
      newHostContent = hostContent.replace(
        /\n# grundstein local hosts(.*)# grundstein local hosts end\n/gim,
        hostFileData,
      )
    }

    newHostContent = newHostContent.replace(/\n/gim, '\\\\n')

    log('there are hostnames in your config that are missing from your local /etc/hosts.')

    const yesNo = await cli.prompt('we can add them for you. (Y/n)', { yesNo: true })

    if (yesNo) {
      log('adding to /etc/hosts now.')

      await cli.exec(`echo ${newHostContent} | sudo tee /etc/hosts`)
    } else {
      log.warn(
        'MISSING_DNS',
        `
please add the following to your /etc/hosts file:

${hostFileData}
`,
      )
    }
  }
}
