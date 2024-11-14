// app/admin/Admin.jsx

import { useState } from 'react';

const Admin = ({ admins = [], setAdmins, adminId }) => {
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [showAdmins, setShowAdmins] = useState(false);
  const [adminInput, setAdminInput] = useState({ ime: '', lozinka: '' });

  const validateAdminInput = () => {
    if (!adminInput.ime) {
      alert('Ime je obavezno.');
      return false;
    }
    if (!adminInput.lozinka) {
      alert('Lozinka je obavezna.');
      return false;
    }
    return true;
  };

  const logAction = async (action, adminId, details) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, adminId, details }),
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!validateAdminInput()) return;

    const { ime, lozinka } = adminInput;
    const res = await fetch('/api/admins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ime, lozinka }),
    });
    if (res.ok) {
      const newAdmin = await res.json();
      setAdmins([...admins, newAdmin]);
      setShowAdminInput(false);
      setAdminInput({ ime: '', lozinka: '' });
      await logAction('Administrator dodan', adminId, { ime });
    }
  };

  const handleChangePassword = async (id) => {
    const adminToChange = admins.find(admin => admin.id === id);
    if (!adminToChange) return;

    const newPassword = prompt('Unesite novu lozinku:');
    if (!newPassword) return;

    const res = await fetch('/api/admins', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, lozinka: newPassword }),
    });
    if (res.ok) {
      setAdmins(admins.map(admin => admin.id === id ? { ...admin, lozinka: newPassword } : admin));
      await logAction('Izmjena lozinke', adminId, { ime: adminToChange.ime });
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (admins.length <= 1) {
      alert('Ne možete izbrisati posljednjeg admina.');
      return;
    }

    if (id === adminId) {
      alert('Ne možete izbrisati sami sebe.');
      return;
    }

    const adminToDelete = admins.find(admin => admin.id === id);
    const res = await fetch('/api/admins', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setAdmins(admins.filter(admin => admin.id !== id));
      await logAction('Administrator uklonjen', adminId, { ime: adminToDelete.ime });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Administratori</h2>
      <button onClick={() => setShowAdminInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Dodaj novog admina
      </button>
      <button onClick={() => setShowAdmins(!showAdmins)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showAdmins ? 'Sakrij' : 'Prikaži'} admine
      </button>
      {showAdminInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Ime"
            value={adminInput.ime}
            onChange={(e) => setAdminInput({ ...adminInput, ime: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <input
            type="password"
            placeholder="Lozinka"
            value={adminInput.lozinka}
            onChange={(e) => setAdminInput({ ...adminInput, lozinka: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <button onClick={handleAddAdmin} className="bg-green-500 text-white p-2 rounded">
            Pošalji
          </button>
        </div>
      )}
      {showAdmins && (
        <ul className="mt-4">
          {admins.map(admin => (
            <li key={admin.id} className="flex justify-between items-center border-b py-2">
              {admin.ime}
              <div>
                <button onClick={() => handleChangePassword(admin.id)} className="text-blue-500 ml-2">Promijeni lozinku</button>
                <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-500 ml-2">Izbriši</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Admin;