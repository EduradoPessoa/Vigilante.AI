'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { viaCepService, ViaCepResponse } from '@/services/viaCepService';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, MapPin, Save, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [cep, setCep] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [address, setAddress] = useState<Partial<ViaCepResponse>>({});

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  async function loadProfile() {
    // Mock Mode Support
    if (session?.user.email === 'demo@vigilante.ai' || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')) {
      const savedProfile = localStorage.getItem('vigilante_mock_profile');
      if (savedProfile) {
        const data = JSON.parse(savedProfile);
        setFullName(data.full_name || '');
        setCep(data.address_cep || '');
        setAddressNumber(data.address_number || '');
        setAddressComplement(data.address_complement || '');
        setAddress({
          logradouro: data.address_street,
          bairro: data.address_neighborhood,
          localidade: data.address_city,
          uf: data.address_state,
        });
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single();

      if (data) {
        setFullName(data.full_name || '');
        setCep(data.address_cep || '');
        setAddressNumber(data.address_number || '');
        setAddressComplement(data.address_complement || '');
        setAddress({
          logradouro: data.address_street,
          bairro: data.address_neighborhood,
          localidade: data.address_city,
          uf: data.address_state,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    setCep(value);
  };

  async function handleCepBlur() {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length >= 8) {
      setLoading(true);
      const data = await viaCepService.getAddressByCep(cleanCep);
      setLoading(false);

      if (data) {
        setAddress(data);
        setAddressNumber('');
        setAddressComplement('');
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'CEP não encontrado.' });
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) return;

    setLoading(true);
    setMessage(null);

    const updates = {
      id: session.user.id,
      full_name: fullName,
      address_cep: cep,
      address_street: address.logradouro,
      address_number: addressNumber,
      address_complement: addressComplement,
      address_neighborhood: address.bairro,
      address_city: address.localidade,
      address_state: address.uf,
      updated_at: new Date(),
    };

    // Mock Mode Support
    if (session?.user.email === 'demo@vigilante.ai' || process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')) {
      localStorage.setItem('vigilante_mock_profile', JSON.stringify(updates));
      await new Promise(resolve => setTimeout(resolve, 500));
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso! (Modo Demo)' });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar perfil: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="rounded-full p-2 hover:bg-slate-100">
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{session?.user.email}</h2>
              <p className="text-sm text-slate-500">Agente de Campo</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                Nome Completo
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 p-3 shadow-sm border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Seu nome"
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-slate-900">
                <MapPin className="h-5 w-5 text-slate-500" />
                Endereço
              </h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="cep" className="block text-sm font-medium text-slate-700">
                    CEP
                  </label>
                  <input
                    type="text"
                    id="cep"
                    value={cep}
                    onChange={handleCepChange}
                    onBlur={handleCepBlur}
                    maxLength={9}
                    className="mt-1 block w-full rounded-md border-slate-300 p-3 shadow-sm border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="00000-000"
                  />
                  <p className="mt-1 text-xs text-slate-500">Digite o CEP para buscar o endereço.</p>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-slate-700">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={address.uf || ''}
                    readOnly
                    className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 p-3 shadow-sm border text-slate-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-slate-700">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    id="street"
                    value={address.logradouro || ''}
                    onChange={(e) => setAddress({ ...address, logradouro: e.target.value })}
                    className="mt-1 block w-full rounded-md border-slate-300 p-3 shadow-sm border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-slate-700">
                    Número
                  </label>
                  <input
                    type="text"
                    id="number"
                    value={addressNumber}
                    onChange={(e) => setAddressNumber(e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 p-3 shadow-sm border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Ex: 123"
                  />
                </div>

                <div>
                  <label htmlFor="complement" className="block text-sm font-medium text-slate-700">
                    Complemento
                  </label>
                  <input
                    type="text"
                    id="complement"
                    value={addressComplement}
                    onChange={(e) => setAddressComplement(e.target.value)}
                    className="mt-1 block w-full rounded-md border-slate-300 p-3 shadow-sm border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Ex: Apto 101"
                  />
                </div>

                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium text-slate-700">
                    Bairro
                  </label>
                  <input
                    type="text"
                    id="neighborhood"
                    value={address.bairro || ''}
                    onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                    className="mt-1 block w-full rounded-md border-slate-300 p-3 shadow-sm border focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700">
                    Cidade
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={address.localidade || ''}
                    readOnly
                    className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 p-3 shadow-sm border text-slate-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={`rounded-md p-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
