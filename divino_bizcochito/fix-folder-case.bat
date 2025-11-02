@echo off
echo Fixing ProtectedRoute folder case for Git...
cd /d "c:\Users\Jaco\Documents\GitHub\Divino_bizcochito_web\divino_bizcochito"

echo Step 1: Moving folder to temporary name...
git mv src/app/components/ProtectedRoute src/app/components/ProtectedRoute_TEMP

echo Step 2: Committing temporary rename...
git commit -m "temp: rename ProtectedRoute to temp name"

echo Step 3: Moving folder to final lowercase name...
git mv src/app/components/ProtectedRoute_TEMP src/app/components/protectedRoute

echo Step 4: Committing final rename...
git commit -m "fix: rename ProtectedRoute folder to lowercase for case-sensitive filesystems"

echo Done! Now you can push with: git push
pause
