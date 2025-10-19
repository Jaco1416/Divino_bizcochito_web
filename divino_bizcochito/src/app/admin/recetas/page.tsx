import React from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';

function RecetasPage() {
  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <div>Recetas page</div>
    </ProtectedRoute>
  )
}

export default RecetasPage