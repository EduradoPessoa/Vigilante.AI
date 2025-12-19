'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // O cliente supabase-js detecta automaticamente o hash/query parameters
    // e atualiza a sessão localstorage.
    // Usamos onAuthStateChange para saber quando isso acontece.
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Login com sucesso, redirecionar para home
        router.push('/');
      }
      if (event === 'SIGNED_OUT') {
         // Algo deu errado ou usuário saiu
         router.push('/login');
      }
    });

    // Fallback: Verificar se já existe sessão (caso o redirecionamento seja muito rápido)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Autenticando...</h2>
        <p className="text-slate-500">Aguarde enquanto confirmamos seus dados.</p>
      </div>
    </div>
  );
}
