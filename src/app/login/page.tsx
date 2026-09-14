'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJsonStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const store = useJsonStore();
  const { toast } = useToast();

  useEffect(() => {
    const user = store.getCurrentUser();
    if (user) {
      redirectUser(user.role);
    }
  }, []);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('sg_device_id');
    if (!deviceId) {
      deviceId = `DEV-${crypto.randomUUID()}`;
      localStorage.setItem('sg_device_id', deviceId);
    }
    return deviceId;
  };

  const redirectUser = (role: string) => {
    if (role === 'GUARD') router.push('/guard-portal');
    else if (role === 'CLIENT_ADMIN' || role === 'CLIENT_VIEWER') router.push('/client-portal');
    else router.push('/dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const deviceId = getDeviceId();

    setTimeout(() => {
      const result = store.login(email, password, deviceId);
      if (result.success && result.user) {
        toast({ title: "Welcome back!", description: `Logged in as ${result.user?.name}` });
        redirectUser(result.user.role);
      } else {
        setAuthError(result.error || "Invalid credentials.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -ml-64 -mb-64" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8 gap-4">
          <div className="bg-primary p-4 rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic tracking-tighter">SecureGuard</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Enterprise Command Centre</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden rounded-3xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Access Control</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Authorized personnel authentication portal.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {authError && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Authentication Alert</AlertTitle>
                  <AlertDescription className="text-xs font-medium leading-relaxed">
                    {authError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Email Terminal</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input type="email" placeholder="user@secureguard.com" className="pl-10 h-12 border-slate-200 focus-visible:ring-primary rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Encrypted Key</label>
                  <button type="button" className="text-[10px] font-bold text-primary hover:underline">RESET</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input type="password" placeholder="••••••••" className="pl-10 h-12 border-slate-200 focus-visible:ring-primary rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 font-black text-sm uppercase italic tracking-tighter transition-all active:scale-[0.98]" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? 'DECRYPTING...' : 'INITIATE SECURE SESSION'}
              </Button>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest px-4">Authorized Personnel Only • Audit Logging Active</p>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
          <p className="text-[10px] font-black text-primary uppercase mb-4 tracking-widest text-center border-b border-white/10 pb-2">Simulator Accounts (Select Role)</p>
          <div className="grid grid-cols-1 gap-2">
             <button onClick={() => { setEmail('admin@secureguard.com'); setPassword('password123'); }} className="text-[10px] text-left hover:text-white text-slate-400 font-medium">SUPER ADMIN: admin@secureguard.com</button>
             <button onClick={() => { setEmail('m.thorne@security.com'); setPassword('password123'); }} className="text-[10px] text-left hover:text-white text-slate-400 font-medium">GUARD: m.thorne@security.com</button>
             <button onClick={() => { setEmail('client@secureguard.com'); setPassword('password123'); }} className="text-[10px] text-left hover:text-white text-slate-400 font-medium">CLIENT: client@secureguard.com</button>
          </div>
        </div>
      </div>
    </div>
  );
}
