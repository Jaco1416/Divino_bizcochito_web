import React from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';

function CategoriasPage() {
  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <div>CategoríasPage</div>
    </ProtectedRoute>
  )
}

export default CategoriasPage