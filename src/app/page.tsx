'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJsonStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const store = useJsonStore();

  useEffect(() => {
    const user = store.getCurrentUser();
    if (!user) {
      router.push('/login');
    } else {
      router.push('/dashboard');
    }
  }, [router, store]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authenticating Intelligence...</p>
      </div>
    </div>
  );
}
