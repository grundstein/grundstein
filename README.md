## grundsteinlegung

### WIP. NOT IN PRODUCTION, TESTED AND/OR BENCHMARKED YET!

Grundstein (plural Grundsteine) [german]

* A ceremonial stone set at the corner of a building.

* By extension, that which is prominent, fundamental, noteworthy, or central.

via: [wiktionary](https://en.wiktionary.org/wiki/Grundstein)

--------------------------------------------------

#### requirements:

##### server

tested on ubuntu.

##### required:
ssh, and bash on your server,

grundsteinlegung.sh is a bash script and gets sent to the server via ssh,
all other dependencies get installed automagically.

might work on other linuxes, if systemd and apt exist there.

##### client

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
git clone git://github.com/grundstein/legung ./domain.com

cd domain.com

npm install

# start dev server
npm start

# deploy to your own server (after editing /grundstein-config.mjs to add your ip)
TBD

```

##### suggestion:

we use a digitalocean floating ip, this will allow us to seamlessly change pods later,
if there are updates to grundstein that require a reinstall.

by leaving a number of old pods alive, we can also rollback easily.
