"use client";
import React from 'react'
import { useEffect, useState } from "react";
import RellenoTable from "@/app/components/RellenosTable/RellenosTable";
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';
import BackButton from '@/app/components/BackButton/BackButton';

function RellenosPage() {

   const [rellenos, setRellenos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRellenos = async () => {
      const res = await fetch("/api/relleno");
      const data = await res.json();
      setRellenos(data);
      setLoading(false);
    };

    fetchRellenos();
  }, []);

  if (loading) return <p className="text-center mt-6">Cargando rellenos...</p>;

  return (
    <ProtectedRoute role="admin">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-center text-[#c90c0c]">Rellenos</h1>
        {loading ? (
          <p className="text-center text-gray-600">Cargando rellenos...</p>
        ) : (
          <RellenoTable rellenos={rellenos} />
        )}
      </div>
    </ProtectedRoute>
  )
}

export default RellenosPage