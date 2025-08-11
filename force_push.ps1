Write-Host "Force pushing all changes to GitHub..." -ForegroundColor Green

# Add all files including the public directory
git add .

# Commit with a descriptive message
git commit -m "Force commit: Add missing public files and all changes for Netlify deployment"

# Push to GitHub
git push origin master

Write-Host "Done! Files should now be on GitHub." -ForegroundColor Green
Write-Host "Check: https://github.com/Ayzieldev/Taskflow" -ForegroundColor Yellow
Read-Host "Press Enter to continue"
