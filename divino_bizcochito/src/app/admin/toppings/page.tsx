import React from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';

function ToppingsPage() {
  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <div>Toppings page</div>
    </ProtectedRoute>
  )
}

export default ToppingsPage