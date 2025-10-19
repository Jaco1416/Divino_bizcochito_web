import React from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/ProtectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';

function ProductosPage() {
  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <div>Productos page</div>
    </ProtectedRoute>
  )
}

export default ProductosPage