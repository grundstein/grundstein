#!/usr/bin/env bash

# the (internal!) root dns identifier of this pod
NAME='grund.stein'
FQDN='cloud.grund.stein'

# which ip addresses this server is reachable at. used by ssh to connect to the server.
# this option will disappear once pods get provisioned through the api.
IP='172.17.0.2'

SERVICES=("gas" "gps" "gss" "grs")

GRUNDSTEIN_USER='grundstein'

# LOG_DIR='/var/log/grundstein/'
LOG_DIR='./log/'

LOCK_FILE="./grundstein.lock"

SSH_AUTHORIZED_KEYS=(
  'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDJlDfX3NLHRU04A+KkOme/WYqbCmVejJ3JLJJCdm+0g+TNgaawSfRLUUydM7WzNrbebi+esMVHjGl/wHojN4sLwZJi7RgyohhBILBzxn9Ll/6MRmbGoidIpjFz1ggoE3M3/FBxtayyp9WdwDnweE2+7fbJFdSTkcemLaPT/KH3twOHrEBlt+GjsZCJvq/TixTUK0xWQrEuwAIRhVsriBcGAVdxLTXuSWgEw8XEtIn6lHD+cILH67JrIa6tO1X3n+wcMzwp5GY+0wAsVH+GhIEuYmKteFGNCqGEYdkCM0uLGQmiA/CxgfI1QIFj/rj1l+sggmMymopIsH92Ml3fsEA1 j@familiar'
)

# load the grundstein functionality and make it available in this file
source "./functions.sh"

# initiate the whole grundstein build chain
start

# register all of our domains and git repositories
declare -A pod_magic_local=(
  ["domain"]="magic.local"
  ["dir"]="docs"
  ["git_host"]="github.com"
  ["git_org"]="magic"
  ["git_repo"]="core"
  ["git_branch"]="master"
)

register "$pod_magic_core"

# declare -A pod_grundstein_it=(
#   ["domain"]="grundstein.local"
#   ["dir"]="docs"
#   ["git_host"]="github.com"
#   ["git_org"]="grundstein"
#   ["git_repo"]="grundstein.it"
#   ["git_branch"]="master"
# )
# register "$pod_grundstein_it"


# cleanup lockfile to make sure we can rerun the script
end
