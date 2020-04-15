## @grundstein/legung

### WIP. NOT IN PRODUCTION, TESTED AND/OR BENCHMARKED YET!

Grundstein (plural Grundsteine) [german]

* A ceremonial stone set at the corner of a building.

* By extension, that which is prominent, fundamental, noteworthy, or central.
Exceptional service is the cornerstone of the hospitality industry.
That is the cornerstone of any meaningful debate about budgets and projects, regulations and policies.

via: [wiktionary](https://en.wiktionary.org/wiki/grundstein)

### grundstein installer bash scripts.

expects ssh and bash on your server, all other dependencies get installed automagically.

### features:

#### user management

adds grundstein user(s)

#### installs all dependencies

nodejs, git, makepasswd, curl

#### certbot

generates letsencrypt certificates using certbot and certbot-dns-digitalocean

#### systemd init

sets up grundstein systemd.service files


### installation

```bash
git clone git://github.com/grundstein/legung ./grundstein
cd ./grundstein
```

### testing

these tests will spawn a local docker container with ubuntu 18.04.

this docker container will then be set up using grundsteinlegung.sh

```bash
# run the test locally
./test/test.sh
```

##### suggestion:

we use a digitalocean floating ip, this will allow us to seamlessly change pods later,
once there are updates.

### connect your server
./connect.sh
```
