
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJsonStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const store = useJsonStore();
  const { toast } = useToast();

  useEffect(() => {
    // If already logged in, redirect based on role
    const user = store.getCurrentUser();
    if (user) {
      if (user.role === 'Guard') {
        router.push('/guard-portal');
      } else if (user.role === 'Client Admin') {
        router.push('/client-portal');
      } else {
        router.push('/dashboard');
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const result = store.login(email, password);
      
      if (result.success && result.user) {
        toast({
          title: "Welcome back!",
          description: `Logged in as ${result.user?.name}`,
        });
        
        // Role-based redirection
        if (result.user.role === 'Guard') {
          router.push('/guard-portal');
        } else if (result.user.role === 'Client Admin') {
          router.push('/client-portal');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: result.error || "Invalid credentials.",
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -ml-64 -mb-64" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8 gap-4">
          <div className="bg-primary p-4 rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">SecureGuard</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Enterprise Command Centre</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-slate-800">Account Sign In</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Enter your credentials to access the operational portal.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="admin@secureguard.com" 
                    className="pl-10 h-11 border-slate-200 focus-visible:ring-primary rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Password</label>
                  <button type="button" className="text-[10px] font-bold text-primary hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 border-slate-200 focus-visible:ring-primary rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 font-black text-sm transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isLoading ? 'AUTHENTICATING...' : 'SECURE SIGN IN'}
              </Button>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest px-4">
                Authorized Personnel Only • IP Tracking Active
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Quick Credentials Info for Demo */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
          <p className="text-[10px] font-bold text-primary uppercase mb-2">Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-slate-400 font-medium">
            <div>Admin: <span className="text-white">admin@secureguard.com</span></div>
            <div>Guard: <span className="text-white">m.thorne@security.com</span></div>
            <div>Client: <span className="text-white">client@secureguard.com</span></div>
            <div>Pass (All): <span className="text-white">password123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
