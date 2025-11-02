# Script para actualizar TODAS las importaciones de protectedRoute a ProtectedRoute (mayúscula)
$ErrorActionPreference = "Continue"

$files = Get-ChildItem -Path "src" -Filter "*.tsx" -Recurse | Where-Object { 
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    $content -match "@/app/components/protectedRoute/ProtectedRoute" -or
    $content -match "'@/app/components/protectedRoute/ProtectedRoute'"
}

$count = 0
foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw
        $newContent = $content -replace "@/app/components/protectedRoute/ProtectedRoute", "@/app/components/ProtectedRoute/ProtectedRoute"
        $newContent = $newContent -replace "'@/app/components/protectedRoute/ProtectedRoute'", "'@/app/components/ProtectedRoute/ProtectedRoute'"
        
        if ($content -ne $newContent) {
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            Write-Host "✓ Updated: $($file.FullName.Replace((Get-Location).Path + '\', ''))" -ForegroundColor Green
            $count++
        }
    } catch {
        Write-Host "✗ Error updating $($file.FullName): $_" -ForegroundColor Red
    }
}

Write-Host "`n$count files updated successfully!" -ForegroundColor Cyan
