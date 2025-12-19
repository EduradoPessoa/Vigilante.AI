'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { inspectionService, Inspection } from '@/services/inspectionService';
import Link from 'next/link';
import { Plus, Search, MapPin, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';

export default function Dashboard() {
  const { session, loading: authLoading } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      loadInspections();
    }
  }, [session]);

  async function loadInspections() {
    try {
      const data = await inspectionService.getInspections();
      setInspections(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  if (!session) return <div className="flex h-screen items-center justify-center"><Link href="/login" className="text-indigo-600 hover:underline">Faça login para continuar</Link></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Vigilante.AI</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </Link>
            <Link
              href="/new-inspection"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-all hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Nova Vistoria
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <Search className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">Total Vistorias</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-semibold text-gray-900">{inspections.length}</p>
            </dd>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
            <dt>
              <div className="absolute rounded-md bg-red-500 p-3">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">Alto Risco</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-semibold text-gray-900">
                {inspections.filter(i => (i.risk_score || 0) > 70).length}
              </p>
            </dd>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
            <dt>
              <div className="absolute rounded-md bg-green-500 p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">Aprovadas</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-semibold text-gray-900">
                {inspections.filter(i => (i.risk_score || 0) < 30 && i.status === 'completed').length}
              </p>
            </dd>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md">
            <dt>
              <div className="absolute rounded-md bg-amber-500 p-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">Pendentes</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-2xl font-semibold text-gray-900">
                {inspections.filter(i => i.status === 'pending').length}
              </p>
            </dd>
          </div>
        </div>

        {/* Recent Inspections List */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="border-b border-gray-200 px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Vistorias Recentes</h3>
            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              Últimas {Math.min(inspections.length, 10)}
            </span>
          </div>
          <ul role="list" className="divide-y divide-gray-100">
            {inspections.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">
                Nenhuma vistoria encontrada. Comece clicando em "Nova Vistoria".
              </li>
            ) : (
              inspections.map((inspection) => (
                <li key={inspection.id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 transition-colors sm:px-6">
                  <div className="flex min-w-0 gap-x-4">
                    <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-200`}>
                      {inspection.status === 'completed' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                       inspection.status === 'failed' ? <AlertTriangle className="h-6 w-6 text-red-600" /> :
                       <Clock className="h-6 w-6 text-amber-600" />}
                    </div>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        <Link href={`/inspection/${inspection.id}`}>
                          <span className="absolute inset-x-0 -top-px bottom-0" />
                          Placa: {inspection.plate}
                        </Link>
                      </p>
                      <p className="mt-1 flex text-xs leading-5 text-gray-500">
                        <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                        {inspection.location ? `${inspection.location.latitude.toFixed(4)}, ${inspection.location.longitude.toFixed(4)}` : 'Sem localização'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <p className="text-sm leading-6 text-gray-900">{new Date(inspection.created_at).toLocaleDateString()}</p>
                      {inspection.risk_score !== undefined && (
                        <p className={`mt-1 text-xs leading-5 ${
                          inspection.risk_score > 70 ? 'text-red-600 font-bold' : 
                          inspection.risk_score > 30 ? 'text-amber-600 font-medium' : 'text-green-600 font-medium'
                        }`}>
                          Risco: {inspection.risk_score}%
                        </p>
                      )}
                    </div>
                    <svg className="h-5 w-5 flex-none text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
