@echo off
setlocal enabledelayedexpansion

echo.
echo Building docker image...
docker-compose build
if errorlevel 1 exit /b %errorlevel%

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
    echo Creating superuser...
    docker-compose run --rm app python manage.py createsuperuser
    if errorlevel 1 exit /b %errorlevel%
) else if "!superuser!"=="2" (
    rem Do nothing
) else (
    echo Invalid choice. Defaulting to 'No'.
)

echo.
echo Collect static files for Django admin panel?:
echo 1) Yes
echo 2) No
set /p collect_static="Choose (1 or 2): "
if "!collect_static!"=="1" (
    echo Collecting static files...
    docker-compose run --rm app python manage.py collectstatic --noinput
    if errorlevel 1 exit /b %errorlevel%
) else if "!collect_static!"=="2" (
    rem Do nothing
) else (
    echo Invalid choice. Defaulting to 'No'.
)

echo.
echo Running the application...
docker-compose up
if errorlevel 1 exit /b %errorlevel%

echo.
echo Script finished successfully.
