import React from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/ProtectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';

function RellenosPage() {
  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <div>Rellenos page</div>
    </ProtectedRoute>
  )
}

export default RellenosPage