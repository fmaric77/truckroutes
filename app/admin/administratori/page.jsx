"use client";

import { useEffect, useState } from 'react';
import AdminShell from '../AdminShell';
import Admin from '../Admin';
import { fetchList } from '../fetchList';

export default function AdministratoriPage() {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetchList('/api/admins').then(setAdmins);
  }, []);

  return (
    <AdminShell title="Administratori">
      {(admin) => <Admin admins={admins} setAdmins={setAdmins} adminId={admin.id} />}
    </AdminShell>
  );
}
