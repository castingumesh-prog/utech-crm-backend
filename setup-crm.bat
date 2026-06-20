@echo off
setlocal

echo ==================================================
echo U TECH CRM - AUTOMATED SETUP & VALIDATION
echo ==================================================

echo.
echo [1/9] Checking Node.js...
node -v
IF %ERRORLEVEL% NEQ 0 (
echo ERROR: Node.js is not installed.
exit /b 1
)

echo.
echo [2/9] Checking NPM...
npm -v
IF %ERRORLEVEL% NEQ 0 (
echo ERROR: NPM is not installed.
exit /b 1
)

echo.
echo [3/9] Installing dependencies...
call npm install
IF %ERRORLEVEL% NEQ 0 (
echo ERROR: npm install failed.
exit /b 1
)

echo.
echo [4/9] Checking MySQL port 3306...
netstat -ano | findstr :3306

echo.
echo [5/9] Running DB diagnostic...
call npm run db:check
IF %ERRORLEVEL% NEQ 0 (
echo.
echo ==========================================
echo DATABASE DIAGNOSTIC FAILED
echo ==========================================
echo Verify:
echo - MySQL service is running
echo - DB_HOST is correct
echo - DB_PORT is correct
echo - DB_USER is correct
echo - DB_PASSWORD is correct
echo - DB_NAME exists
exit /b 1
)

echo.
echo [6/9] Importing schema if available...
IF EXIST database\schema.sql (
echo Schema file found.
mysql -u root -p utech_crm ^< database\schema.sql
)

echo.
echo [7/9] Running Jest tests...
call npm test -- --runInBand
IF %ERRORLEVEL% NEQ 0 (
echo ERROR: Tests failed.
exit /b 1
)

echo.
echo [8/9] Starting backend...
start cmd /k "npm start"

echo.
echo [9/9] Setup completed.
echo If the database diagnostic passed and tests passed,
echo the backend should now be running.

endlocal
