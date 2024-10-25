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

      // Log the login action
      await logAction('Admin logged in', data.admin.id);

      // Preusmjeri na administratorsku ploču
      router.push('/admin'); // Prilagodite putanju do vaše administratorske ploče
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
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Prijava administratora</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Korisničko ime</label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Lozinka</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Prijava
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;