"use client";

import { useEffect, useState } from 'react';
import AdminShell from '../AdminShell';
import Travels from '../Travels';
import { fetchList } from '../fetchList';

export default function PutovanjaPage() {
  const [putovanja, setPutovanja] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchList('/api/putovanja').then(setPutovanja);
    fetchList('/api/vozaci').then(setDrivers);
    fetchList('/api/kamioni').then(setTrucks);
    fetchList('/api/rute').then(setRoutes);
  }, []);

  return (
    <AdminShell title="Putovanja">
      {(admin) => (
        <Travels
          putovanja={putovanja}
          setPutovanja={setPutovanja}
          drivers={drivers}
          trucks={trucks}
          spremneRute={routes}
          adminId={admin.id}
        />
      )}
    </AdminShell>
  );
}
