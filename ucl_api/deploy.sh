#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo -e "\nBuilding docker image...\n"
docker-compose build

echo -e "\nRunning database migrations...\n"
docker-compose run --rm app python manage.py makemigrations
docker-compose run --rm app python manage.py migrate

echo -e "\nCreate superuser?:"
echo "1) Yes"
echo "2) No"
read -p "Choose (1 or 2): " superuser
case $superuser in
1) docker-compose run --rm app python manage.py createsuperuser ;;
2) : ;;
*) echo "Invalid choice. Defaulting to 'No'." && : ;;
esac

echo -e "\nCollect static files for django admin panel?:"
echo "1) Yes"
echo "2) No"
read -p "Choose (1 or 2): " collect_static
case $collect_static in
1) docker-compose run --rm app python manage.py collectstatic ;;
2) : ;;
*) echo "Invalid choice. Defaulting to 'No'." && : ;;
esac

echo -e "\nRunning the application...\n"
docker-compose up
