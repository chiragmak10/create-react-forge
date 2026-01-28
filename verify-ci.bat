@echo off
echo === Running CI Verification ===
echo.

echo Step 1: Running lint...
call npm run lint
if %errorlevel% neq 0 (
    echo FAILED: Lint check failed
    exit /b %errorlevel%
)
echo [32mPASSED: Lint check[0m
echo.

echo Step 2: Running build...
call npm run build
if %errorlevel% neq 0 (
    echo FAILED: Build failed
    exit /b %errorlevel%
)
echo [32mPASSED: Build[0m
echo.

echo Step 3: Running tests...
call npm run test
if %errorlevel% neq 0 (
    echo FAILED: Tests failed
    exit /b %errorlevel%
)
echo [32mPASSED: Tests[0m
echo.

echo === All CI checks passed! ===
