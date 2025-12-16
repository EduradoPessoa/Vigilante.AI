'use client';

import { useEffect, useState, use } from 'react';
import { inspectionService, Inspection } from '@/services/inspectionService';
import Link from 'next/link';
import { ArrowLeft, MapPin, AlertTriangle, CheckCircle, FileText, User, DollarSign, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InspectionDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadInspection();
  }, [unwrappedParams.id]);

  async function loadInspection() {
    try {
      const data = await inspectionService.getInspectionById(unwrappedParams.id);
      if (!data) {
        // Handle 404
        return;
      }
      setInspection(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  if (!inspection) return <div className="flex h-screen items-center justify-center">Vistoria não encontrada</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="rounded-full p-2 hover:bg-slate-100">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Vistoria {inspection.plate}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Coluna da Esquerda: Resumo e Mapa */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-slate-900">Resumo de Risco</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className={`mb-4 flex items-center gap-2 rounded-md p-4 
                  ${(inspection.risk_score || 0) > 70 ? 'bg-red-50 text-red-800' : 
                    (inspection.risk_score || 0) > 30 ? 'bg-yellow-50 text-yellow-800' : 
                    'bg-green-50 text-green-800'}`}>
                  {(inspection.risk_score || 0) > 70 ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                  <span className="font-semibold">Score de Risco: {inspection.risk_score}/100</span>
                </div>
                <p className="text-slate-700">{inspection.summary}</p>
                
                {inspection.ai_analysis && (
                  <div className="mt-4 rounded-md bg-indigo-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-indigo-900">
                      <FileText className="h-4 w-4" />
                      Parecer da IA
                    </h4>
                    <p className="text-sm text-indigo-800">{inspection.ai_analysis}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-slate-900">Localização</h3>
              </div>
              <div className="aspect-video w-full bg-slate-200">
                {inspection.location && (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${inspection.location.latitude},${inspection.location.longitude}&z=15&output=embed`}
                  ></iframe>
                )}
              </div>
              <div className="px-4 py-3 sm:px-6">
                 <p className="flex items-center text-sm text-slate-500">
                    <MapPin className="mr-2 h-4 w-4" />
                    {inspection.location?.latitude}, {inspection.location?.longitude}
                 </p>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Detalhes Técnicos */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-slate-900">Dados do Proprietário</h3>
              </div>
              <div className="border-t border-slate-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-slate-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="flex items-center text-sm font-medium text-slate-500">
                      <User className="mr-2 h-4 w-4" /> Nome
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{inspection.owner_data?.name}</dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-slate-500">Documento</dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{inspection.owner_data?.document}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-slate-900">Situação Legal</h3>
              </div>
              <div className="border-t border-slate-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-slate-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="flex items-center text-sm font-medium text-slate-500">
                      <DollarSign className="mr-2 h-4 w-4" /> Multas
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                      R$ {inspection.fines?.amount.toFixed(2)} ({inspection.fines?.count} infrações)
                      <p className="text-xs text-slate-500">{inspection.fines?.description}</p>
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="flex items-center text-sm font-medium text-slate-500">
                      <ShieldAlert className="mr-2 h-4 w-4" /> Restrições
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                      <ul className="list-disc pl-5">
                        <li className={inspection.restrictions?.theft ? 'text-red-600 font-bold' : 'text-green-600'}>
                          Roubo/Furto: {inspection.restrictions?.theft ? 'CONSTADO' : 'Nada consta'}
                        </li>
                        <li className={inspection.restrictions?.judicial ? 'text-red-600' : 'text-slate-600'}>
                          Judicial: {inspection.restrictions?.judicial ? 'Sim' : 'Não'}
                        </li>
                        <li className={inspection.restrictions?.financing ? 'text-yellow-600' : 'text-slate-600'}>
                          Alienado: {inspection.restrictions?.financing ? 'Sim' : 'Não'}
                        </li>
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
