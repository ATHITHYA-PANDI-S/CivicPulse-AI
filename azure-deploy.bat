@echo off
title CivicPulse AI - Azure Cloud Deployment
color 0B
echo =================================================================
echo   CIVICPULSE AI - AUTOMATED AZURE CLOUD DEPLOYMENT
echo   College Account: athithyapandi.24it@kct.ac.in
echo   GitHub: https://github.com/ATHITHYA-PANDI-S/CivicPulse-AI
echo =================================================================
echo.

echo [*] Step 1/3: Building client and server production bundles...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Please check the logs above.
    pause
    exit /b %errorlevel%
)
echo [OK] Build completed successfully.
echo.

echo [*] Step 2/3: Opening browser to sign in to Microsoft Azure...
echo [!] Please choose/enter your student email: athithyapandi.24it@kct.ac.in
call npx @azure/static-web-apps-cli login
echo.

echo [*] Step 3/3: Deploying CivicPulse AI to Azure Static Web Apps...
call npx @azure/static-web-apps-cli deploy ./NULL-POINTERS-/client/dist --env production --app-name civicpulse-ai
echo.

echo =================================================================
echo   DEPLOYMENT COMPLETE!
echo   Your website is now LIVE on Azure Cloud.
echo =================================================================
pause
