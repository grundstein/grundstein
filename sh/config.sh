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
