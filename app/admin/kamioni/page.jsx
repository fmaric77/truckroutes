"use client";

import { useEffect, useState } from 'react';
import AdminShell from '../AdminShell';
import Trucks from '../Trucks';
import { fetchList } from '../fetchList';

export default function KamioniPage() {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    fetchList('/api/kamioni').then(setTrucks);
  }, []);

  return (
    <AdminShell title="Kamioni">
      {(admin) => <Trucks trucks={trucks} setTrucks={setTrucks} adminId={admin.id} />}
    </AdminShell>
  );
}
