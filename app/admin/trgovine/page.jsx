"use client";

import { useEffect, useState } from 'react';
import AdminShell from '../AdminShell';
import Stores from '../Stores';
import { fetchList } from '../fetchList';

export default function TrgovinePage() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetchList('/api/trgovine').then(setStores);
  }, []);

  return (
    <AdminShell title="Trgovine">
      {(admin) => <Stores stores={stores} setStores={setStores} adminId={admin.id} />}
    </AdminShell>
  );
}
