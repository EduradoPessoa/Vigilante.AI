'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { inspectionService, Inspection } from '@/services/inspectionService';
import Link from 'next/link';
import { Plus, Search, MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard de Vistorias</h1>
          <Link
            href="/new-inspection"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Nova Vistoria
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Vistorias</p>
                <p className="text-2xl font-semibold text-slate-900">{inspections.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-3 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Alto Risco</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {inspections.filter(i => (i.risk_score || 0) > 70).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Aprovadas</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {inspections.filter(i => (i.risk_score || 0) < 30 && i.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Vistorias Recentes</h3>
          </div>
          <ul role="list" className="divide-y divide-slate-200">
            {inspections.map((inspection) => (
              <li key={inspection.id} className="hover:bg-slate-50">
                <Link href={`/inspection/${inspection.id}`} className="block px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="truncate text-sm font-medium text-indigo-600">
                      Placa: {inspection.plate}
                    </div>
                    <div className="ml-2 flex flex-shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${inspection.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          inspection.status === 'failed' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {inspection.status === 'completed' ? 'Concluída' : 
                         inspection.status === 'failed' ? 'Reprovada' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-slate-500">
                        <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                        {inspection.location ? `Lat: ${inspection.location.latitude.toFixed(4)}, Long: ${inspection.location.longitude.toFixed(4)}` : 'Sem localização'}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Clock className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                      {new Date(inspection.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
