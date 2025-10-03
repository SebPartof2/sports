@echo off
echo Building MLB Scores Website for Cloudflare Pages...

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install --legacy-peer-deps
)

REM Build the project
echo Building project...
npm run build

REM Build for Cloudflare Pages
echo Building for Cloudflare Pages...
npm run pages:build

echo Build complete! Ready for deployment.
echo To deploy, run: npm run pages:deploy
echo Or connect your repository to Cloudflare Pages dashboard.
pause