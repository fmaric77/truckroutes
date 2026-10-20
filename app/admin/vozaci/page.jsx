"use client";

import { useEffect, useState } from 'react';
import AdminShell from '../AdminShell';
import Drivers from '../Drivers';
import { fetchList } from '../fetchList';

export default function VozaciPage() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchList('/api/vozaci').then(setDrivers);
  }, []);

  return (
    <AdminShell title="Vozači">
      {(admin) => <Drivers drivers={drivers} setDrivers={setDrivers} adminId={admin.id} />}
    </AdminShell>
  );
}
