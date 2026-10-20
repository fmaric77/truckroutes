"use client";

import { useEffect, useState } from 'react';
import AdminShell from '../AdminShell';
import Skladista from '../Skladista';
import { fetchList } from '../fetchList';

export default function SkladistaPage() {
  const [skladista, setSkladista] = useState([]);

  useEffect(() => {
    fetchList('/api/skladista').then(setSkladista);
  }, []);

  return (
    <AdminShell title="Skladišta">
      {(admin) => (
        <Skladista skladista={skladista} setSkladista={setSkladista} adminId={admin.id} />
      )}
    </AdminShell>
  );
}
