
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJsonStore } from '@/lib/store';

export default function RootPage() {
  const router = useRouter();
  const store = useJsonStore();

  useEffect(() => {
    const user = store.getCurrentUser();
    if (!user) {
      router.push('/login');
    } else {
      // Role-based redirection logic
      if (user.role === 'Guard') {
        router.push('/guard-portal');
      } else if (user.role === 'Client Admin') {
        router.push('/client-portal');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router, store]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
