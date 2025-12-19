'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inspectionService, Inspection } from '@/services/inspectionService';
import { ArrowLeft, Car, AlertTriangle, CheckCircle, XCircle, Info, DollarSign, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function NewInspection() {
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Inspection | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Tenta obter geolocalização do navegador
      let location = undefined;
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
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

      const data = await inspectionService.startInspection(plate, location);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar vistoria');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Nova Vistoria</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Car className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">Identificação do Veículo</h2>
                <p className="mt-1 text-sm text-gray-500">Insira a placa para iniciar a análise de risco automática.</p>
              </div>

              <div>
                <label htmlFor="plate" className="block text-sm font-medium text-gray-700">
                  Placa do Veículo
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">🇧🇷</span>
                  </div>
                  <input
                    type="text"
                    id="plate"
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    className="block w-full rounded-lg border-0 py-4 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6 tracking-widest uppercase font-mono"
                    placeholder="ABC1234"
                    maxLength={7}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Suporta formato Mercosul e padrão antigo.</p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-4 ring-1 ring-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Erro na vistoria</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando Análise...
                    </span>
                  ) : 'Iniciar Vistoria'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Resultado da Análise</h2>
                    <p className="text-sm text-gray-500 mt-1">Protocolo: {result.id?.slice(0, 8) || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Placa</span>
                    <span className="block text-2xl font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-md border border-gray-300">{plate}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className={`rounded-xl p-6 border ${
                  result.status === 'completed' ? 'bg-green-50 border-green-200' : 
                  result.status === 'failed' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <span className={`text-sm font-medium ${
                    result.status === 'completed' ? 'text-green-700' : 
                    result.status === 'failed' ? 'text-red-700' : 'text-yellow-700'
                  }`}>Status Geral</span>
                  <div className="mt-2 flex items-center gap-3">
                    {result.status === 'completed' ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : result.status === 'failed' ? (
                      <XCircle className="h-8 w-8 text-red-600" />
                    ) : (
                      <Info className="h-8 w-8 text-yellow-600" />
                    )}
                    <span className={`text-2xl font-bold capitalize ${
                      result.status === 'completed' ? 'text-green-900' : 
                      result.status === 'failed' ? 'text-red-900' : 'text-yellow-900'
                    }`}>
                      {result.status === 'completed' ? 'Aprovado' : result.status === 'failed' ? 'Reprovado' : 'Pendente'}
                    </span>
                  </div>
                </div>
                
                <div className="rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
                  <span className="text-sm font-medium text-gray-500">Score de Risco</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${
                      (result.risk_score || 0) > 70 ? 'text-red-600' : 
                      (result.risk_score || 0) > 30 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {result.risk_score ?? 'N/A'}
                    </span>
                    <span className="text-sm text-gray-400">/ 100</span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        (result.risk_score || 0) > 70 ? 'bg-red-500' : 
                        (result.risk_score || 0) > 30 ? 'bg-amber-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${result.risk_score || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {result.ai_analysis && (
                <div className="rounded-xl bg-indigo-50 p-6 border border-indigo-100 ring-1 ring-indigo-500/10">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-900 mb-3">
                    <Info className="h-5 w-5" />
                    Parecer da Inteligência Artificial
                  </h3>
                  <div className="prose prose-indigo max-w-none">
                    <p className="text-indigo-900/80 leading-relaxed whitespace-pre-wrap">{result.ai_analysis}</p>
                  </div>
                </div>
              )}

              {result.fines && (
                <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      Multas e Débitos
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-8">
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Valor Total</span>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">R$ {result.fines.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Quantidade</span>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">{result.fines.count}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição</span>
                      <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{result.fines.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.restrictions && (
                <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-gray-500" />
                      Restrições Legais
                    </h3>
                  </div>
                  <div className="p-6 flex gap-6">
                    <div className={`flex-1 rounded-lg border p-4 flex items-center gap-3 ${
                      result.restrictions.theft ? 'bg-red-50 border-red-200 text-red-900' : 'bg-green-50 border-green-200 text-green-900'
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${result.restrictions.theft ? 'text-red-600' : 'text-green-600'}`} />
                      <div>
                        <p className="text-xs font-medium opacity-80 uppercase">Roubo/Furto</p>
                        <p className="font-bold">{result.restrictions.theft ? 'DETECTADO' : 'NADA CONSTA'}</p>
                      </div>
                    </div>
                    <div className={`flex-1 rounded-lg border p-4 flex items-center gap-3 ${
                      result.restrictions.judicial ? 'bg-red-50 border-red-200 text-red-900' : 'bg-green-50 border-green-200 text-green-900'
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${result.restrictions.judicial ? 'text-red-600' : 'text-green-600'}`} />
                      <div>
                        <p className="text-xs font-medium opacity-80 uppercase">Judicial</p>
                        <p className="font-bold">{result.restrictions.judicial ? 'DETECTADO' : 'NADA CONSTA'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setResult(null)}
                  className="rounded-lg border border-gray-300 bg-white py-2.5 px-5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Nova Consulta
                </button>
                <Link
                  href="/"
                  className="rounded-lg border border-transparent bg-indigo-600 py-2.5 px-5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Voltar ao Início
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}