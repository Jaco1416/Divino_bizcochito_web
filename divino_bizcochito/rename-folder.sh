#!/bin/bash
# Script para forzar el cambio de nombre de la carpeta ProtectedRoute en Git
# Ejecutar este script en Git Bash

echo "=== Iniciando proceso de renombrado de carpeta ProtectedRoute ==="

# Verificar que estamos en el directorio correcto
if [ ! -d "src/app/components/ProtectedRoute" ]; then
    echo "ERROR: No se encuentra la carpeta ProtectedRoute"
    exit 1
fi

echo "Paso 1: Renombrar ProtectedRoute a nombre temporal..."
git mv src/app/components/ProtectedRoute src/app/components/TEMP_PROTECTED_ROUTE_FOLDER

echo "Paso 2: Hacer commit del cambio temporal..."
git commit -m "temp: rename ProtectedRoute to temporary name"

echo "Paso 3: Renombrar de temporal a ProtectedRoute final..."
git mv src/app/components/TEMP_PROTECTED_ROUTE_FOLDER src/app/components/ProtectedRoute

echo "Paso 4: Hacer commit del cambio final..."
git commit -m "fix: ensure ProtectedRoute folder name is correct for case-sensitive systems"

echo ""
echo "=== ✓ Proceso completado exitosamente ==="
echo ""
echo "Ahora ejecuta: git push"
echo ""
