#!/usr/bin/env bash

set -o errexit
set -o nounset

set -o pipefail

FORCE=0
VERBOSE=0

if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi

if [[ "${1-}" =~ ^-*h(elp)?$ ]]; then
  echo "Usage: ./setup.sh\n\n"
  exit
fi

if [[ "${1-}" =~ ^-*f(orce)?$ ]]; then
  echo "MAY the FORCE be with you!"

  FORCE=1
fi

if [[ "${1-}" =~ ^-*v(erbose)?$ ]]; then
  echo "Verbose run. I will be chatty."

  VERBOSE=1
fi

function check_or_create_lockfile() {
  if [[ "$FORCE" == 1 ]]; then
    printf "FORCE is set, removing lock file $LOCK_FILE\n"

    rm -f "$LOCK_FILE"
  fi

  if test -f "$LOCK_FILE"; then
    printf "$LOCK_FILE exists.\n"
    printf "there is an installation running or a past installation failed.\n"
    printf "to force reinstallation, add the --force flag to the grundstein command.\n"
    exit 1
  fi

  printf "creating lock file: $LOCK_FILE\n"
  touch "$LOCK_FILE"
}

function remove_lockfile() {
  printf "deleting lock file: $LOCK_FILE\n"
  rm -f "$LOCK_FILE"
}

function apt_upgrade() {
  apt update -y
  apt upgrade -y

  # make sure we have git
  apt install -y git
}

function create_log_dir() {
  printf "create log dir: $LOG_DIR\n"

  mkdir -p "$LOG_DIR"
}

function create_user() {
  log_todo "create user $GRUNDSTEIN_USER\n"

  printf "the grundstein user\n"

  id -u "grundstein" &>/dev/null || (
    PASSWORD=$(makepasswd --min 42 --max 42)
    # useradd -m -p "$PASSWORD" -d "/home/$GRUNDSTEIN_USER" -s /bin/bash "$GRUNDSTEIN_USER"
  )

  log_end "creating user $GRUNDSTEIN_USER"
}

function log_todo() {
  printf '\n\n\e[31m%s\e[0m' "TODO "
  printf "$@"
}

function log_end() {
  printf '\e[32m%s\e[0m' 'FINISHED:'
  printf "$@"
}

function setup_ssh() {
  log_todo "SSH: setup"

  printf "create remote-235325 user with root privileges\n"
  printf "disable password auth\n"
  printf "disable root login\n"
  printf "change port from 22 to 2411\n"
  printf "??? Connect via separate local ssh session to make sure we can still connect via key and remote-235235 user\n"
  printf "Reload ssh after changes.\n"

  log_end ": SSH setup\n"
}


function log_if_verbose() {
  if [[ "$VERBOSE" == 1 ]]; then
    printf "$@"
  fi
}

function start() {
  log_if_verbose "\n"
  log_if_verbose "starting at $(date)\n"
  log_if_verbose '\e[32m%s\e[0m' "grundstein/legung"
  log_if_verbose "\n\n"

  # create a lockfile if it does not exist
  # exit if the lockfile already exists
  check_or_create_lockfile

  # create the log directory to track our progress
  create_log_dir

  create_user

  setup_ssh
}

function register() {
  printf "\n\nregister: $@\n\n"
}

function end() {
  remove_lockfile
}
