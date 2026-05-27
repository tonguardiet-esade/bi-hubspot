'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User as UserIcon, Loader2, CheckCircle2, XCircle } from 'lucide-react';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Se requiere una invitación válida para registrarse.');
      setValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/invitation/validate?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setTokenValid(true);
          setEmail(data.email); // Pre-fill email from invitation
        } else {
          setError(data.message || 'Invitación inválida o expirada.');
        }
      } catch (err) {
        setError('Error al validar la invitación.');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, token }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al crear la cuenta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-text-secondary">Validando invitación...</p>
      </div>
    );
  }

  if (!tokenValid && !success) {
    return (
      <div className="glass-card p-8 text-center max-w-md w-full animate-fade-in">
        <XCircle className="w-16 h-16 text-error mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <button onClick={() => router.push('/login')} className="btn btn-secondary w-full">
          Volver al Login
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-card p-8 text-center max-w-md w-full animate-fade-in">
        <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">¡Cuenta Creada!</h2>
        <p className="text-text-secondary mb-6">Tu registro ha sido exitoso. Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="glass-card w-full max-w-md p-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-gradient">Únete a HubSpot BI</h1>
        <p className="text-text-secondary">Configura tu cuenta de acceso seguro</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-dim uppercase tracking-wider">Email Invitado</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input type="email" disabled className="w-full pl-11 opacity-60" value={email} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-dim uppercase tracking-wider">Nueva Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              type="password"
              required
              className="w-full pl-11"
              placeholder="Min. 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-dim uppercase tracking-wider">Confirmar Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <input
              type="password"
              required
              className="w-full pl-11"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm text-center">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full group">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Completar Registro'}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-accent" />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
