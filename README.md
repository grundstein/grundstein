## @grundstein/legung

### WIP. NOT IN PRODUCTION, TESTED AND/OR BENCHMARKED YET!

### grundstein installer bash scripts.

expects ssh and bash on your server, all other dependencies get installed automagically.

### features:

#### user management

adds grundstein user(s)

#### systemd init

sets up grundstein systemd.service files

#### installs all dependencies

nodejs, git, makepasswd, curl

##### certbot

generates letsencrypt certificates using certbot and certbot-dns-digitalocean

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

### deploy

before deploying, /etc/hosts has to get a `grundstein` entry.

replace 127.0.0.1 with your ip address.

```bash
echo '127.0.0.1    grundstein' | sudo tee --append /etc/hosts
```

##### suggestion:

we use a digitalocean floating ip, this will allow us to seamlessly change pods later,
once there are updates.

### connect your server
./connect.sh
```
