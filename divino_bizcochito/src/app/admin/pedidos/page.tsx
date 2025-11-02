import React from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute/ProtectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';
import PedidosTable from '@/app/components/PedidosTable/PedidosTable';

function PedidosPage() {
  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <PedidosTable />
    </ProtectedRoute>
  )
}

export default PedidosPage