@echo off
setlocal enabledelayedexpansion

REM MiraiVPN Deployment Script for Windows
REM Usage: deploy.bat [build|push|release|rollback] [--dry-run] [--provision]

REM Configuration
set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%deploy-logs"
set "DIST_DIR=%SCRIPT_DIR%dist"
set "ENV_FILE=%SCRIPT_DIR%.env.deploy"

REM Create log directory
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Generate timestamp for this deployment
for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /value') do set datetime=%%i
set "TIMESTAMP=%datetime:~0,8%-%datetime:~8,6%"
set "RELEASE_NAME=miraivpn-%TIMESTAMP%"
set "RELEASE_ZIP=%DIST_DIR%\%RELEASE_NAME%.zip"
set "LOG_FILE=%LOG_DIR%\deploy-%TIMESTAMP%.log"

REM Initialize log
echo [%DATE% %TIME%] Starting deployment script > "%LOG_FILE%"
echo Arguments: %* >> "%LOG_FILE%"

REM Parse arguments
set "COMMAND="
set "DRY_RUN=0"
set "PROVISION=0"

:parse_args
if "%~1"=="" goto end_parse
if "%~1"=="--dry-run" (
    set "DRY_RUN=1"
    echo DRY RUN MODE ENABLED
) else if "%~1"=="--provision" (
    set "PROVISION=1"
    echo PROVISION MODE ENABLED
) else (
    set "COMMAND=%~1"
)
shift
goto parse_args
:end_parse

if "%COMMAND%"=="" (
    echo Usage: deploy.bat [build^|push^|release^|rollback] [--dry-run] [--provision]
    echo.
    echo Commands:
    echo   build     - Build and package artifacts locally
    echo   push      - Build, package and upload to server
    echo   release   - Full deployment: build, upload, deploy, restart services
    echo   rollback  - Rollback to previous release
    echo.
    echo Flags:
    echo   --dry-run  - Show commands without executing
    echo   --provision- Upload server configuration files
    exit /b 1
)

REM Load environment variables
call :load_env
if errorlevel 1 goto error

REM Pre-flight checks
call :preflight_checks
if errorlevel 1 goto error

REM Execute command
if "%COMMAND%"=="build" (
    call :do_build
) else if "%COMMAND%"=="push" (
    call :do_build
    if errorlevel 1 goto error
    call :do_push
) else if "%COMMAND%"=="release" (
    call :do_build
    if errorlevel 1 goto error
    call :do_push
    if errorlevel 1 goto error
    call :do_release
) else if "%COMMAND%"=="rollback" (
    call :do_rollback
) else (
    echo Unknown command: %COMMAND%
    exit /b 1
)

if errorlevel 1 goto error

echo.
echo Deployment completed successfully!
echo Log file: %LOG_FILE%
goto end

:error
echo.
echo Deployment failed! Check log file: %LOG_FILE%
exit /b 1

:end
echo Log file: %LOG_FILE%
exit /b 0

REM ========================================
REM Load environment variables from .env.deploy
REM ========================================
:load_env
echo Loading environment from %ENV_FILE%...
if not exist "%ENV_FILE%" (
    echo ERROR: %ENV_FILE% not found. Please create it with your deployment configuration.
    exit /b 1
)

for /f "tokens=1,* delims==" %%a in (%ENV_FILE%) do (
    if not "%%a"=="" if not "%%~a"=="REM" (
        set "%%a=%%b"
    )
)

REM Validate required variables
set "MISSING_VARS="
if "%VPS_HOST%"=="" set "MISSING_VARS=%MISSING_VARS% VPS_HOST"
if "%VPS_USER%"=="" set "MISSING_VARS=%MISSING_VARS% VPS_USER"
if "%REMOTE_ROOT%"=="" set "MISSING_VARS=%MISSING_VARS% REMOTE_ROOT"
if "%APP_URL%"=="" set "MISSING_VARS=%MISSING_VARS% APP_URL"
if "%X_API_KEY%"=="" set "MISSING_VARS=%MISSING_VARS% X_API_KEY"
if "%DB_HOST%"=="" set "MISSING_VARS=%MISSING_VARS% DB_HOST"
if "%DB_NAME%"=="" set "MISSING_VARS=%MISSING_VARS% DB_NAME"
if "%DB_USER%"=="" set "MISSING_VARS=%MISSING_VARS% DB_USER"

if not "%MISSING_VARS%"=="" (
    echo ERROR: Missing required environment variables:%MISSING_VARS%
    echo Please check your .env.deploy file.
    exit /b 1
)

echo Environment loaded successfully.
goto :eof

REM ========================================
REM Pre-flight checks
REM ========================================
:preflight_checks
echo Performing pre-flight checks...

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not found in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm not found in PATH.
    echo Please install npm (comes with Node.js).
    exit /b 1
)

REM Check PHP
where php >nul 2>nul
if errorlevel 1 (
    echo ERROR: PHP not found in PATH.
    echo Please install PHP 8.3+ and add to PATH.
    echo Download from: https://windows.php.net/download/
    exit /b 1
)

REM Check Composer
where composer >nul 2>nul
if errorlevel 1 (
    echo ERROR: Composer not found in PATH.
    echo Please install Composer from https://getcomposer.org/
    exit /b 1
)

REM Check PuTTY tools for remote operations
if not "%COMMAND%"=="build" (
    where pscp >nul 2>nul
    if errorlevel 1 (
        echo ERROR: pscp not found in PATH.
        echo Please install PuTTY and add to PATH.
        echo Download from: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
        exit /b 1
    )

    where plink >nul 2>nul
    if errorlevel 1 (
        echo ERROR: plink not found in PATH.
        echo Please install PuTTY and add to PATH.
        exit /b 1
    )
)

echo Pre-flight checks passed.
goto :eof

REM ========================================
REM Build artifacts
REM ========================================
:do_build
echo Building artifacts...

REM Create dist directory
if not exist "%DIST_DIR%" mkdir "%DIST_DIR%"

REM Build frontend
echo Building frontend...
cd "%SCRIPT_DIR%"
if %DRY_RUN%==1 (
    echo [DRY RUN] cd "%SCRIPT_DIR%" ^& npm ci
    echo [DRY RUN] npm run build
) else (
    call :run_cmd npm ci
    if errorlevel 1 goto :eof
    call :run_cmd npm run build
    if errorlevel 1 goto :eof
)

REM Create frontend .env.production
if %DRY_RUN%==1 (
    echo [DRY RUN] Creating frontend/.env.production
) else (
    echo NEXT_PUBLIC_API_URL=%APP_URL%%API_BASE%/api > frontend\.env.production
    echo NEXT_PUBLIC_API_KEY=%X_API_KEY% >> frontend\.env.production
)

REM Build backend
echo Building backend...
cd "%SCRIPT_DIR%backend"
if %DRY_RUN%==1 (
    echo [DRY RUN] cd "%SCRIPT_DIR%backend" ^& composer install --no-dev --optimize-autoloader
) else (
    call :run_cmd composer install --no-dev --optimize-autoloader
    if errorlevel 1 goto :eof
)

REM Create backend .env
if %DRY_RUN%==1 (
    echo [DRY RUN] Creating backend/.env
) else (
    (
        echo APP_ENV=production
        echo APP_URL=%APP_URL%
        echo X_API_KEY=%X_API_KEY%
        echo.
        echo DB_HOST=%DB_HOST%
        echo DB_PORT=%DB_PORT%
        echo DB_DATABASE=%DB_NAME%
        echo DB_USERNAME=%DB_USER%
        echo DB_PASSWORD=%DB_PASS%
        echo.
        echo JWT_SECRET=%JWT_SECRET%
        echo JWT_EXP_MIN=15
        echo JWT_REFRESH_EXP_DAYS=30
        echo.
        echo STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY%
        echo STRIPE_WEBHOOK_SECRET=%STRIPE_WEBHOOK_SECRET%
        echo.
        echo RESEND_API_KEY=%RESEND_API_KEY%
        echo MAIL_FROM=%MAIL_FROM%
        echo.
        echo ALLOWED_ORIGINS=%APP_URL%,http://localhost:3001
    ) > "%SCRIPT_DIR%backend\.env"
)

REM Build bot
echo Building bot...
cd "%SCRIPT_DIR%"
if %DRY_RUN%==1 (
    echo [DRY RUN] cd "%SCRIPT_DIR%" ^& npm ci
) else (
    call :run_cmd npm ci
    if errorlevel 1 goto :eof
)

REM Create release directory structure
set "RELEASE_DIR=%DIST_DIR%\%RELEASE_NAME%"
if %DRY_RUN%==1 (
    echo [DRY RUN] Creating release directory structure in %RELEASE_DIR%
) else (
    if exist "%RELEASE_DIR%" rmdir /s /q "%RELEASE_DIR%"
    mkdir "%RELEASE_DIR%\frontend"
    mkdir "%RELEASE_DIR%\backend"
    mkdir "%RELEASE_DIR%\bot"

    REM Copy frontend artifacts
    xcopy "%SCRIPT_DIR%.next" "%RELEASE_DIR%\frontend\.next\" /e /i /h /y >nul
    xcopy "%SCRIPT_DIR%public" "%RELEASE_DIR%\frontend\public\" /e /i /h /y >nul
    copy "%SCRIPT_DIR%package.json" "%RELEASE_DIR%\frontend\" >nul
    copy "%SCRIPT_DIR%package-lock.json" "%RELEASE_DIR%\frontend\" >nul
    copy "%SCRIPT_DIR%frontend\.env.production" "%RELEASE_DIR%\frontend\.env.local" >nul

    REM Copy backend artifacts
    xcopy "%SCRIPT_DIR%backend\public" "%RELEASE_DIR%\backend\public\" /e /i /h /y >nul
    xcopy "%SCRIPT_DIR%backend\src" "%RELEASE_DIR%\backend\src\" /e /i /h /y >nul
    xcopy "%SCRIPT_DIR%backend\vendor" "%RELEASE_DIR%\backend\vendor\" /e /i /h /y >nul
    xcopy "%SCRIPT_DIR%backend\sql" "%RELEASE_DIR%\backend\sql\" /e /i /h /y >nul
    copy "%SCRIPT_DIR%backend\composer.json" "%RELEASE_DIR%\backend\" >nul
    copy "%SCRIPT_DIR%backend\.env" "%RELEASE_DIR%\backend\" >nul

    REM Copy bot artifacts
    xcopy "%SCRIPT_DIR%src\bot" "%RELEASE_DIR%\bot\src\bot\" /e /i /h /y >nul
    copy "%SCRIPT_DIR%package.json" "%RELEASE_DIR%\bot\" >nul
    copy "%SCRIPT_DIR%package-lock.json" "%RELEASE_DIR%\bot\" >nul
)

REM Create zip archive
if %DRY_RUN%==1 (
    echo [DRY RUN] Creating zip archive: %RELEASE_ZIP%
) else (
    if exist "%RELEASE_ZIP%" del "%RELEASE_ZIP%"
    powershell "Compress-Archive -Path '%RELEASE_DIR%' -DestinationPath '%RELEASE_ZIP%'" 2>>"%LOG_FILE%"
    if errorlevel 1 (
        echo ERROR: Failed to create zip archive
        exit /b 1
    )
)

echo Build completed. Release: %RELEASE_NAME%
echo Zip location: %RELEASE_ZIP%
goto :eof

REM ========================================
REM Push artifacts to server
REM ========================================
:do_push
echo Pushing artifacts to server...

if %DRY_RUN%==1 (
    echo [DRY RUN] pscp -P %VPS_PORT% "%RELEASE_ZIP%" %VPS_USER%@%VPS_HOST%:%REMOTE_ROOT%/
    echo [DRY RUN] plink -P %VPS_PORT% %VPS_USER%@%VPS_HOST% "cd %REMOTE_ROOT% && unzip -q %RELEASE_NAME%.zip && rm %RELEASE_NAME%.zip"
) else (
    echo Uploading release archive...
    call :run_cmd pscp -P %VPS_PORT% "%RELEASE_ZIP%" %VPS_USER%@%VPS_HOST%:%REMOTE_ROOT%/
    if errorlevel 1 goto :eof

    echo Extracting on server...
    call :run_remote_cmd "cd %REMOTE_ROOT% && unzip -q %RELEASE_NAME%.zip && rm %RELEASE_NAME%.zip"
    if errorlevel 1 goto :eof
)

if %PROVISION%==1 (
    call :provision_server
    if errorlevel 1 goto :eof
)

echo Push completed.
goto :eof

REM ========================================
REM Release deployment
REM ========================================
:do_release
echo Performing release deployment...

if %DRY_RUN%==1 (
    echo [DRY RUN] Creating backup on server
    echo [DRY RUN] Switching symlink
    echo [DRY RUN] Running database migrations
    echo [DRY RUN] Reloading services
    echo [DRY RUN] Starting bot
) else (
    REM Create backup if current exists
    call :run_remote_cmd "if [ -L %REMOTE_CURRENT% ]; then mkdir -p %REMOTE_BACKUPS% && tar -czf %REMOTE_BACKUPS%/backup-%TIMESTAMP%.tar.gz -C %REMOTE_ROOT% current && echo 'Backup created'; fi"

    REM Switch symlink
    call :run_remote_cmd "ln -sfn %REMOTE_RELEASES%/%RELEASE_NAME% %REMOTE_CURRENT%"
    if errorlevel 1 goto :eof

    REM Run database migrations (idempotent)
    call :run_remote_cmd "mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% %DB_NAME% < %REMOTE_CURRENT%/backend/sql/001_init.sql 2>/dev/null || echo 'Migration completed or already exists'"

    REM Reload PHP-FPM and Nginx
    call :run_remote_cmd "systemctl reload php8.3-fpm && systemctl reload nginx"
    if errorlevel 1 goto :eof

    REM Start/restart bot with PM2
    call :run_remote_cmd "cd %REMOTE_CURRENT%/bot && npm ci && pm2 startOrReload ecosystem.config.js --only miraivpn-bot 2>/dev/null || pm2 start 'npm run dev' --name miraivpn-bot --time"
    call :run_remote_cmd "pm2 save"
)

echo Release deployment completed.
goto :eof

REM ========================================
REM Rollback deployment
REM ========================================
:do_rollback
echo Performing rollback...

if %DRY_RUN%==1 (
    echo [DRY RUN] Finding latest backup
    echo [DRY RUN] Switching symlink back
    echo [DRY RUN] Reloading services
) else (
    REM Find latest backup
    for /f %%i in ('plink -P %VPS_PORT% %VPS_USER%@%VPS_HOST% "ls -t %REMOTE_BACKUPS%/backup-*.tar.gz 2>/dev/null | head -1"') do set "LATEST_BACKUP=%%i"

    if "!LATEST_BACKUP!"=="" (
        echo ERROR: No backup found for rollback
        exit /b 1
    )

    REM Extract backup to new release directory
    set "ROLLBACK_RELEASE=%REMOTE_RELEASES%/rollback-%TIMESTAMP%"
    call :run_remote_cmd "mkdir -p %ROLLBACK_RELEASE% && tar -xzf !LATEST_BACKUP! -C %ROLLBACK_RELEASE%"

    REM Switch symlink
    call :run_remote_cmd "ln -sfn %ROLLBACK_RELEASE% %REMOTE_CURRENT%"

    REM Reload services
    call :run_remote_cmd "systemctl reload php8.3-fpm && systemctl reload nginx"
    call :run_remote_cmd "cd %REMOTE_CURRENT%/bot && pm2 startOrReload ecosystem.config.js --only miraivpn-bot 2>/dev/null || pm2 start 'npm run dev' --name miraivpn-bot --time"
)

echo Rollback completed.
goto :eof

REM ========================================
REM Provision server with configuration files
REM ========================================
:provision_server
echo Provisioning server...

if %DRY_RUN%==1 (
    echo [DRY RUN] Uploading Nginx configuration
    echo [DRY RUN] Uploading PM2 ecosystem config
    echo [DRY RUN] Installing PM2 globally
) else (
    REM Upload Nginx config
    if exist "%SCRIPT_DIR%server\nginx_miraivpn.conf" (
        call :run_cmd pscp -P %VPS_PORT% "%SCRIPT_DIR%server\nginx_miraivpn.conf" %VPS_USER%@%VPS_HOST%:/etc/nginx/sites-available/miraivpn.conf
        call :run_remote_cmd "ln -sf /etc/nginx/sites-available/miraivpn.conf /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"
    )

    REM Upload PM2 ecosystem config
    if exist "%SCRIPT_DIR%server\ecosystem.config.js" (
        call :run_cmd pscp -P %VPS_PORT% "%SCRIPT_DIR%server\ecosystem.config.js" %VPS_USER%@%VPS_HOST%:%REMOTE_ROOT%/
    )

    REM Install PM2 if not present
    call :run_remote_cmd "which pm2 >/dev/null 2>&1 || npm install -g pm2"
)

echo Server provisioning completed.
goto :eof

REM ========================================
REM Helper functions
REM ========================================
:run_cmd
echo Running: %*
echo [%DATE% %TIME%] Running: %* >> "%LOG_FILE%"
if %DRY_RUN%==1 (
    echo [DRY RUN] %*
) else (
    %* >> "%LOG_FILE%" 2>&1
)
set "EXIT_CODE=%errorlevel%"
echo [%DATE% %TIME%] Exit code: %EXIT_CODE% >> "%LOG_FILE%"
if %EXIT_CODE% neq 0 (
    echo ERROR: Command failed with exit code %EXIT_CODE%
    exit /b %EXIT_CODE%
)
goto :eof

:run_remote_cmd
echo Running remote: %*
echo [%DATE% %TIME%] Running remote: %* >> "%LOG_FILE%"
if %DRY_RUN%==1 (
    echo [DRY RUN] plink -P %VPS_PORT% %VPS_USER%@%VPS_HOST% "%*"
) else (
    plink -P %VPS_PORT% %VPS_USER%@%VPS_HOST% "%*" >> "%LOG_FILE%" 2>&1
)
set "EXIT_CODE=%errorlevel%"
echo [%DATE% %TIME%] Remote exit code: %EXIT_CODE% >> "%LOG_FILE%"
if %EXIT_CODE% neq 0 (
    echo ERROR: Remote command failed with exit code %EXIT_CODE%
    exit /b %EXIT_CODE%
)
goto :eof
