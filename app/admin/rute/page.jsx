"use client";

import { useEffect, useState } from 'react';
import AdminShell from '../AdminShell';
import Route from '../Rute';
import { fetchList } from '../fetchList';

export default function RutePage() {
  const [routes, setRoutes] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetchList('/api/rute').then(setRoutes);
    fetchList('/api/trgovine').then(setStores);
  }, []);

  return (
    <AdminShell title="Rute">
      {(admin) => (
        <Route routes={routes} setRoutes={setRoutes} stores={stores} adminId={admin.id} />
      )}
    </AdminShell>
  );
}
