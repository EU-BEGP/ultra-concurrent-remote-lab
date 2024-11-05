#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo -e "\nBuilding docker image...\n"
docker-compose build

echo -e "\nRunning database migrations...\n"
docker-compose run --rm app python manage.py makemigrations
docker-compose run --rm app python manage.py migrate

STATICFILES_DIR="./app/staticfiles/"
if [ ! -d "$STATICFILES_DIR" ]; then
  echo -e "\nStatic files directory does not exist."
  echo -e "Creating...\n"
  docker-compose run --rm app python manage.py collectstatic
fi

while true; do
  read -p $'\n[?] Do you want to create a superuser? (yes/no) [default: no]: ' superuser
  superuser=${superuser:-no}                                  # Default to 'no'
  superuser=$(echo "$superuser" | tr '[:upper:]' '[:lower:]') # Convert the options to lowercase

  case "$superuser" in
  yes)
    docker-compose run --rm app python manage.py createsuperuser
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
docker-compose up
