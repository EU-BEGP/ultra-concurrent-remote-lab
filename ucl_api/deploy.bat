@echo off
setlocal enabledelayedexpansion

echo.
echo Building docker image...
docker-compose build

echo.
echo Running database migrations...
docker-compose run --rm app python manage.py makemigrations
if errorlevel 1 exit /b %errorlevel%
docker-compose run --rm app python manage.py migrate
if errorlevel 1 exit /b %errorlevel%

echo.
echo Create superuser?:
echo 1) Yes
echo 2) No
set /p superuser="Choose (1 or 2): "
if "!superuser!"=="1" (
    docker-compose run --rm app python manage.py createsuperuser
) else if "!superuser!"=="2" (
    rem Do nothing
) else (
    echo Invalid choice. Defaulting to 'No'.
)

echo.
echo Collect static files for django admin panel?:
echo 1) Yes
echo 2) No
set /p collect_static="Choose (1 or 2): "
if "!collect_static!"=="1" (
    docker-compose run --rm app python manage.py collectstatic
) else if "!collect_static!"=="2" (
    rem Do nothing
) else (
    echo Invalid choice. Defaulting to 'No'.
)

echo.
echo Running the application...
docker-compose up
