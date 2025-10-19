import React from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';

function PedidosPage() {
  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <div>Pedidos page</div>
    </ProtectedRoute>
  )
}

export default PedidosPage