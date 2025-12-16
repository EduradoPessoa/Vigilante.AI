'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inspectionService } from '@/services/inspectionService';
import { ArrowLeft, Car, FileCode } from 'lucide-react';
import Link from 'next/link';

export default function NewInspection() {
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Tenta obter geolocalização do navegador
      let location = undefined;
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (e) {
          console.warn('Geolocation failed or denied', e);
        }
      }

      await inspectionService.startInspection(plate, vin, location);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar vistoria');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="rounded-full p-2 hover:bg-slate-100">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nova Vistoria</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="plate" className="block text-sm font-medium text-slate-700">
                Placa do Veículo
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Car className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="plate"
                  required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="block w-full rounded-md border-slate-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                  placeholder="ABC1234"
                  maxLength={7}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Formatos aceitos: Mercosul ou Antigo</p>
            </div>

            <div>
              <label htmlFor="vin" className="block text-sm font-medium text-slate-700">
                Chassi (VIN)
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FileCode className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="vin"
                  required
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  className="block w-full rounded-md border-slate-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                  placeholder="9BW..."
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Iniciar Análise'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
