@echo off

:: Exit immediately if a command fails
setlocal enabledelayedexpansion
set EXIT_CODE=0

echo.
echo Building docker image...
docker-compose build || set EXIT_CODE=1

if !EXIT_CODE! NEQ 0 exit /b %EXIT_CODE%

echo.
echo Running database migrations...
docker-compose run --rm app python manage.py makemigrations || set EXIT_CODE=1
docker-compose run --rm app python manage.py migrate || set EXIT_CODE=1

if !EXIT_CODE! NEQ 0 exit /b %EXIT_CODE%

set STATICFILES_DIR=.\app\staticfiles\

:: Check if the static files directory exists
if not exist "!STATICFILES_DIR!" (
    echo.
    echo Static files directory does not exist.
    echo Creating...
    docker-compose run --rm app python manage.py collectstatic || set EXIT_CODE=1
)

if !EXIT_CODE! NEQ 0 exit /b %EXIT_CODE%

:: Ask user if they want to create a superuser
:ask_superuser
set /p superuser="Do you want to create a superuser? (yes/no) [default: no]: "
if "%superuser%"=="" set superuser=no

:: Handle user input for superuser creation
if "%superuser%"=="yes" (
    docker-compose run --rm app python manage.py createsuperuser
) else if "%superuser%"=="no" (
    echo Skipping superuser creation...
) else (
    echo Invalid choice. Please literally enter 'yes' or 'no'.
    goto ask_superuser
)

echo.
echo Running the application...
docker-compose up
