export const env = {
  TZ: 'Europe/Vienna',
  USERNAME: 'grundstein',
  USERHOME: '/home/grundstein',
  NVM_NODE_VERSION: 13,
  NVM_DIR: '$USERHOME/.nvm',
  GIT_URL: 'git://github.com/grundstein',

  RED: '\\033[0;31m',
  GREEN: '\\033[0;32m',
  YELLOW: '\\033[1;33m',
  NC: '\\033[0m',
}

// service config:

// this is the central load balancer and proxy service.
export const gps = { port: 4343, name: 'grundstein positioning service' }

// this service redirects from http to https and from 8080 to 4343.
export const grs = { port: 8080, name: 'grundstein redirection service' }

// serves static files.
export const gms = { port: 2323, name: 'grundstein magic page server' }

// serves prebuilt api bundles.
export const gas = { port: 2324, name: 'grundstein api server' }

// watches, builds and rebuilds pages when they get updated in their remote git repositories
// export const gbs = { port: 23523, name: 'grundstein build service' }

// checks the various pages and apis for healthyness.
// sends warning notifications on error.
// export const ghs = { port: 23524, name: 'grundstein health checker' }

// logging service all other services use to log to.
// export const gul = { port: 23525, name: 'grundstein universal logger' }

export const hosts = [
  {
    // the root dns identifier of this pod
    name: 'localhost',

    // which ip addresses this server is reachable at. used by ssh to connect to the server.
    // this option will disappear once pods get provisioned through the api.
    ips: ['127.0.0.1'],

    // the hostnames this pod will serve.
    hostnames: ['localhost', 'localhorst'],

    // which services should be installed and started on this pod?
    services: {
      // gps,
      // grs,
      gms,
      gas,
      // gul,
      // ghs,
      // gbs,
    },

    // which repositories should gbs use to build from.
    // these repositories will be watched and rebuilt when pushed to.
    // in the future, the staging branch will also be served.
    repositories: {
      localhost: {
        host: 'github.com',
        org: 'magic-examples',
        repo: 'magic-examples.github.io',
        branch: 'dev',
      },
      localhorst: {
        host: 'github.com',
        org: 'magic-modules',
        repo: 'magic-modules.github.io',
        branch: 'dev',
      },
    },
  },
]

export default {
  hosts,
  env,
}
