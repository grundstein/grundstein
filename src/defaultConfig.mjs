export const env = {
  TZ: 'Europe/Vienna',
  USERNAME: 'grundstein',
  USERHOME: '/home/grundstein',
  GIT_URL: 'git://github.com/grundstein',
  SSH_USER: 'root',
  LOG_DIR: 'grundstein',
}

export const hosts = [
  {
    // the (internal!) root dns identifier of this pod
    name: 'grund.stein',
    fqdn: 'cloud.grund.stein',

    // which ip addresses this server is reachable at. used by ssh to connect to the server.
    // this option will disappear once pods get provisioned through the api.
    ip: '172.17.0.2',

    // the hostnames this pod will serve publicly,
    // this is in addition to the hosts in the repositories list below
    hostnames: [],

    // which services should be installed and started on this pod?
    services: [
      // this service should run on only one pod.
      // last to be decentralized, it is the certificate root until @grundstein/gca exists.
      'gps',

      // redirects http to https and www. to apex domain
      'grs',

      // serves static html, js and css
      'gms',

      // serves the api lambdas
      'gas',
    ],

    // which repositories should we clone and update.
    repositories: {
      'grundstein.local': {
        host: 'github.com',
        org: 'magic-examples',
        repo: 'magic-examples.github.io',
        branch: 'dev',
        dir: 'docs',
      },
      'magic.local': {
        host: 'github.com',
        org: 'magic-modules',
        repo: 'magic-modules.github.io',
        branch: 'dev',
        dir: 'docs',
      },
    },
  },
]

export default {
  hosts,
  env,
}
