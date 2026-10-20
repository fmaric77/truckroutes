// app/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Korisničko ime i lozinka su obavezni');
      return;
    }

    try {
      console.log('Sl zahtjeva za prijavu:', { username, password });

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      console.log('Primljen odgovor:', data);

      if (!res.ok) {
        throw new Error(data.message);
      }

      // Pohrani informacije o administratoru u lokalnu pohranu
      localStorage.setItem('admin', JSON.stringify(data.admin));

      await logAction('Administrator se prijavio', data.admin.id);

      // Preusmjeri na administratorsku ploču
      router.push('/admin'); 
    } catch (error) {
      console.error('Greška pri prijavi:', error);
      setError((error as Error).message);
    }
  };

  const logAction = async (action: string, adminId: number) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, adminId }),
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="ui-card w-full max-w-md p-8">
        <p className="ui-kicker">Dispečer</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Prijava administratora</h1>
        <p className="mt-2 text-sm text-slate-400">Upravljanje rutama, kamionima, vozačima i putovanjima.</p>
        {error && (
          <p className="mt-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="ui-label">Korisničko ime</label>
            <input
              type="text"
              id="username"
              autoComplete="username"
              className="ui-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="ui-label">Lozinka</label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              className="ui-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="ui-btn ui-btn-primary mt-2 w-full">
            Prijava
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;