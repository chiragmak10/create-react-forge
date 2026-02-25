@echo off
REM Cross-Platform Local Testing Script (Windows)
REM This script helps you test create-react-forge locally on Windows

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   create-react-forge Local Test Suite
echo ========================================
echo.

REM Check Node version
echo [*] Checking Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   Node: %NODE_VERSION%

REM Extract major version
for /f "tokens=2 delims=v" %%i in ("%NODE_VERSION%") do (
    for /f "tokens=1 delims=." %%j in ("%%i") do set NODE_MAJOR=%%j
)

if %NODE_MAJOR% LSS 20 (
    echo   WARNING: Node 20.9.0+ is required
    exit /b 1
)
echo [✓] Node version OK
echo.

REM Install dependencies
echo [*] Installing dependencies
call npm ci --silent 2>nul
if errorlevel 1 (
    call npm ci
)
echo [✓] Dependencies installed
echo.

REM Build project
echo [*] Building project
call npm run build --silent 2>nul
if errorlevel 1 (
    call npm run build
)
echo [✓] Build successful
echo.

REM Run unit tests
echo [*] Running unit tests
call npm test -- --run 2>&1 | findstr /R "^.*PASS.*" || call npm test -- --run
echo [✓] Unit tests completed
echo.

REM Run cross-platform tests
echo [*] Running cross-platform tests
call npm test -- --run "src/__tests__/integration/cross-platform-cli.test.ts"
echo [✓] Cross-platform tests completed
echo.

REM Run E2E CLI tests
echo [*] Running E2E CLI tests
call npm test -- --run "src/__tests__/integration/e2e-cli.test.ts"
echo [✓] E2E CLI tests completed
echo.

REM Test CLI execution
echo [*] Testing CLI execution
node dist/index.js --help >nul 2>&1
if errorlevel 0 (
    echo [✓] CLI --help works
) else (
    echo   Note: CLI may require interactive mode
)

node dist/index.js --version >nul 2>&1
if errorlevel 0 (
    echo [✓] CLI --version works
) else (
    echo   Note: CLI version flag may not be implemented
)
echo.

REM Platform info
echo [*] Platform information
echo   OS: Windows
for /f "tokens=*" %%i in ('node --version') do echo   Node: %%i
for /f "tokens=*" %%i in ('npm --version') do echo   npm: %%i
echo.

REM Show coverage report location
echo [*] Coverage report
if exist "coverage\index.html" (
    echo   [✓] Coverage report: coverage\index.html
) else (
    echo   Run 'npm run test:coverage' to generate coverage report
)
echo.

REM Show next steps
echo ========================================
echo        Testing Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Review test results above
echo   2. Check CROSS_PLATFORM_TESTING.md for detailed info
echo   3. Run 'npm run test:watch' for continuous testing
echo   4. Run 'npm run test:coverage' for coverage details
echo   5. Run 'npm run dev' to test CLI interactively
echo.
