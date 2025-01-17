#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to check for Docker Compose command
check_docker_compose() {
  if command -v docker-compose &>/dev/null; then
    echo "docker-compose"
  elif command -v docker &>/dev/null && docker compose version &>/dev/null; then
    echo "docker compose"
  else
    echo "[x] Error: Docker Compose is not installed."
    exit 1
  fi
}

docker_compose_cmd=$(check_docker_compose)

echo -e "\nBuilding docker image...\n"
$docker_compose_cmd build

echo -e "\nRunning database migrations...\n"
$docker_compose_cmd run --rm app python manage.py makemigrations
$docker_compose_cmd run --rm app python manage.py migrate

STATICFILES_DIR="./app/staticfiles/"
if [ ! -d "$STATICFILES_DIR" ]; then
  echo -e "\nStatic files directory does not exist."
  echo -e "Creating...\n"
  $docker_compose_cmd run --rm app python manage.py collectstatic
fi

while true; do
  read -p $'\n[?] Do you want to create a superuser? (yes/no) [default: no]: ' superuser
  superuser=${superuser:-no}                                  # Default to 'no'
  superuser=$(echo "$superuser" | tr '[:upper:]' '[:lower:]') # Convert the options to lowercase

  case "$superuser" in
  yes)
    $docker_compose_cmd run --rm app python manage.py createsuperuser
    break
    ;;
  no)
    break
    ;;
  *)
    echo "Invalid choice. Please enter 'yes' or 'no'."
    ;;
  esac
done

echo -e "\nRunning the application...\n"
$docker_compose_cmd up
