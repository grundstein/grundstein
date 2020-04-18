set -euf -o pipefail

source /grundstein-config.sh

printf "\${YELLOW}GRUNDSTEIN\${NC} starting user generation\\n"

# add user if it does not exist.
# one should be fine for now.
# we do not need to know the password.
id -u "$USERNAME" &>/dev/null || (
  PASSWORD=$(makepasswd --min 42 --max 42)
  useradd -m -p "$PASSWORD" -d "$USERHOME" -s /bin/bash "$USERNAME"
)

printf "\${GREEN}GRUNDSTEIN\${NC} user generated successfully.\\n"
