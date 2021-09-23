## Grundstein (plural Grundsteine) [german]

* A ceremonial stone set at the corner of a building.
* By extension, that which is prominent, fundamental, noteworthy, or central.

via: [wiktionary](https://en.wiktionary.org/wiki/Grundstein)

--------------------------------------------------

### WIP. NOT IN PRODUCTION, TESTED AND/OR BENCHMARKED YET!

## grundstein

runs a production ci/cd environment for us (and you?).

it is built to serve [magic](https://github.com/magic) pages and apis.

#### requirements:

##### server

tested on ubuntu.

preinstalled: systemd, apt, ssh, and bash.

grundsteinlegung.sh is a bash script and gets sent to the server via ssh,
all other dependencies get installed automagically.

might work on other linuxes, if systemd and apt exist there.

##### development

expects docker and nodejs to be installed on your computer.

### features:

#### user management

adds grundstein user(s)

#### installs all dependencies

nodejs, git, makepasswd, curl

#### certbot

generates letsencrypt certificates using certbot and certbot-dns-digitalocean

#### systemd init

sets up grundstein systemd.service files and starts and enables the services

### installation

```bash
npm i -g grundstein
```

### custom configuration

grundstein needs a configuration to work.

the easiest way to get started is to perform a grundsteinlegung.

```bash
git clone git://github.com/grundstein/legung ./cloud.domain.com

cd cloud.domain.com

npm install

# add a digitalocean api token to .secrets/digitalocean.ini to generate letsencrypt certificates.
# at the moment, this also requires you to use the digitalocean nameservers for your domain!

# start dev server
npm start

# deploy to your own server (after editing /grundstein-config.mjs to add your ip)
npm run prod

```

##### suggestion

we use a digitalocean floating ip, this will allow us to setup a separate pod,
prepare it, and then just reassign the ip address to the new version.

by leaving a number of old pods alive, we can also rollback easily.

all of this without touching dns.


##### TODO:

* create pods through digitalocean api

* name them by git hash

* keep 3 versions alive at all times
