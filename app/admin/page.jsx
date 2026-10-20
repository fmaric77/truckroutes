"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBook, FaRoute, FaStore, FaTasks, FaTruck, FaUser, FaUserShield, FaWarehouse } from 'react-icons/fa';
import AdminShell from './AdminShell';
import { fetchList } from './fetchList';

const AdminPanel = () => {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchList('/api/kamioni'),
      fetchList('/api/vozaci'),
      fetchList('/api/trgovine'),
      fetchList('/api/rute'),
      fetchList('/api/skladista'),
      fetchList('/api/admins'),
      fetchList('/api/putovanja'),
    ]).then(([trucks, drivers, stores, routes, skladista, admins, putovanja]) => {
      setCounts({
        trucks: trucks.length,
        drivers: drivers.length,
        stores: stores.length,
        routes: routes.length,
        skladista: skladista.length,
        admins: admins.length,
        putovanja: putovanja.length,
      });
    });
  }, []);

  const n = (value, label) => (counts ? `${value} ${label}` : '…');

  const cards = [
    { href: '/admin/kamioni', title: 'Kamioni', text: n(counts?.trucks, 'u evidenciji'), Icon: FaTruck },
    { href: '/admin/vozaci', title: 'Vozači', text: n(counts?.drivers, 'u evidenciji'), Icon: FaUser },
    { href: '/admin/trgovine', title: 'Trgovine', text: n(counts?.stores, 'lokacija'), Icon: FaStore },
    { href: '/admin/rute', title: 'Rute', text: n(counts?.routes, 'definirano'), Icon: FaRoute },
    { href: '/admin/skladista', title: 'Skladišta', text: n(counts?.skladista, 'lokacija'), Icon: FaWarehouse },
    { href: '/admin/administratori', title: 'Administratori', text: n(counts?.admins, 'računa'), Icon: FaUserShield },
    { href: '/admin/putovanja', title: 'Putovanja', text: n(counts?.putovanja, 'aktivnih'), Icon: FaTasks },
    { href: '/admin/povijestputovanja', title: 'Povijest putovanja', text: 'Arhiva', Icon: FaBook },
  ];

  return (
    <AdminShell title="Administratorska ploča" back={false}>
      {() => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link legacyBehavior key={card.href} href={card.href}>
              <a className="ui-card flex items-center justify-between gap-3 p-5 transition hover:bg-white/5">
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <card.Icon />
                  </span>
                  <span>
                    <span className="block text-lg font-semibold">{card.title}</span>
                    <span className="mt-1 block text-sm text-slate-400">{card.text}</span>
                  </span>
                </span>
                <span className="text-xs uppercase tracking-wide text-slate-400">Otvori</span>
              </a>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
};

export default AdminPanel;
