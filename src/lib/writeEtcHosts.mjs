import path from 'path'

import { cli, fs, log } from '@grundstein/commons'

import { getAllHostnames } from './getAllHostnames.mjs'

export const writeEtcHosts = async config => {
  const START_LABEL = '# grundstein local hosts start'
  const END_LABEL = '# grundstein local hosts end'
  const labelRegex = new RegExp(`${START_LABEL}(.*)${END_LABEL}`, 'gim')

  const hostContent = await fs.readFile(path.join('/etc', 'hosts'), 'utf8')

  const hostnames = getAllHostnames(config)

  const missingHostnames = hostnames.filter(host => !hostContent.includes(host))

  console.log({ hostnames })

  if (missingHostnames.length) {
    const hostFileData = `
${START_LABEL}

127.0.0.1     ${missingHostnames.join(' ')}

${END_LABEL}
`

    let newHostContent = hostContent + hostFileData

    if (hostContent.includes(START_LABEL)) {
      newHostContent = hostContent.replace(labelRegex, hostFileData)
    }

    log('there are hostnames in your config that are missing from your local /etc/hosts.')

    log(newHostContent)

    newHostContent = newHostContent.replace(/\n/gim, '\\\\n')

    log.warn(
      'This command requires root. It also changes files on your machine.',
      `
If this makes you uncomfortable,
just copy the lines above into your /etc/hosts file manually.
`.trim(),
    )

    const yesNo = await cli.prompt('Add them now?', { yesNo: true })

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
