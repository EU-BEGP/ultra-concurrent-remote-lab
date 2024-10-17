#!/bin/bash

# Check the environment and start the appropriate server
if [ "$ENVIRONMENT" = "production" ]; then

  echo "Starting in production mode..."

  # Wait for the database to be ready
  python manage.py wait_for_db

  # Start Gunicorn
  gunicorn --bind 0.0.0.0:8000 --workers=2 app.wsgi:application

elif [ "$ENVIRONMENT" = "development" ]; then

  echo "Starting in development mode..."

  # Wait for the database to be ready
  python manage.py wait_for_db

  # Start Gunicorn with reload configuration
  gunicorn --bind 0.0.0.0:8000 --workers=2 --reload app.wsgi:application

fi
