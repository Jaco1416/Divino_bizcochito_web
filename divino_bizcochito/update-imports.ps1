# Script para actualizar todas las importaciones de ProtectedRoute a minúsculas
$files = @(
    "src\app\admin\usuarios\page.tsx",
    "src\app\admin\usuarios\[id]\page.tsx",
    "src\app\admin\toppings\page.tsx",
    "src\app\admin\toppings\[id]\page.tsx",
    "src\app\admin\toppings\crear\page.tsx",
    "src\app\admin\rellenos\page.tsx",
    "src\app\admin\rellenos\[id]\page.tsx",
    "src\app\admin\rellenos\crear\page.tsx",
    "src\app\admin\recetas\page.tsx",
    "src\app\admin\productos\crear\page.tsx",
    "src\app\admin\productos\page.tsx",
    "src\app\admin\pedidos\page.tsx",
    "src\app\admin\categorias\crear\page.tsx",
    "src\app\views\perfil\page.tsx",
    "src\app\components\AddRecipe\AddRecipe.tsx"
)

$oldPattern = "@/app/components/ProtectedRoute/ProtectedRoute"
$newPattern = "@/app/components/protectedRoute/ProtectedRoute"

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $newContent = $content -replace [regex]::Escape($oldPattern), $newPattern
        Set-Content $fullPath -Value $newContent -NoNewline
        Write-Host "Updated: $file"
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll files updated successfully!" -ForegroundColor Green
