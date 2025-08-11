@echo off
echo Completing git operations for Netlify deployment...
echo.

echo Current git status:
git status

echo.
echo Committing staged files...
git commit -m "Add missing index.html and manifest.json for Netlify deployment"

echo.
echo Pushing to GitHub...
git push origin master

echo.
echo Done! Check your GitHub repository to confirm the files are there.
pause
