"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminShell({ title, back = true, logsLink = true, children }) {
  const [admin, setAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('admin');
    if (!stored) {
      router.push('/');
      return;
    }
    setAdmin(JSON.parse(stored));
  }, [router]);

  const handleLogout = async () => {
    const id = admin?.id;
    localStorage.removeItem('admin');
    if (id) {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'Administrator se odjavio', adminId: id }),
        });
      } catch (error) {
        console.error('Error logging action:', error);
      }
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ui-kicker">Dispečer</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
            {admin && <p className="mt-1 text-sm text-slate-400">Prijavljen kao {admin.ime}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {back && (
              <Link legacyBehavior href="/admin">
                <a className="ui-btn">Nazad</a>
              </Link>
            )}
            {logsLink && (
              <Link legacyBehavior href="/admin/logs">
                <a className="ui-btn">Povijest radnji</a>
              </Link>
            )}
            <button type="button" onClick={handleLogout} className="ui-btn ui-btn-danger">
              Odjava
            </button>
          </div>
        </header>
        {admin ? children(admin) : <p className="text-slate-300">Učitavanje...</p>}
      </div>
    </div>
  );
}
