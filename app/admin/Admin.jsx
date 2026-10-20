import { useState } from 'react';
import FormModal from './FormModal'; 
const Admin = ({ admins = [], setAdmins, adminId }) => {
  const [open, setOpen] = useState(false);
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
    if (admins.some(admin => admin.ime === adminInput.ime)) {
      alert('Administrator s tim imenom već postoji.');
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
      setAdminInput({ ime: '', lozinka: '' });
      setOpen(false);
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

    if (!window.confirm('Jeste li sigurni?')) return;

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
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setOpen(true)} className="ui-btn ui-btn-primary">Dodaj administratora</button>
      </div>
      <FormModal open={open} title="Novi administrator" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="ui-label" htmlFor="admin-ime">Ime</label>
            <input
              id="admin-ime"
              type="text"
              value={adminInput.ime}
              onChange={(e) => setAdminInput({ ...adminInput, ime: e.target.value })}
              className="ui-input"
            />
          </div>
          <div>
            <label className="ui-label" htmlFor="admin-lozinka">Lozinka</label>
            <input
              id="admin-lozinka"
              type="password"
              value={adminInput.lozinka}
              onChange={(e) => setAdminInput({ ...adminInput, lozinka: e.target.value })}
              className="ui-input"
            />
          </div>
          <button type="button" onClick={handleAddAdmin} className="ui-btn ui-btn-primary w-full">Spremi</button>
        </div>
      </FormModal>
      <ul className="space-y-2">
          {admins.map(admin => (
            <li key={admin.id} className="ui-row flex-col sm:flex-row sm:items-center">
              <span className="font-medium">{admin.ime}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleChangePassword(admin.id)} className="ui-btn px-3 py-1 text-xs">Promijeni lozinku</button>
                <button type="button" onClick={() => handleDeleteAdmin(admin.id)} className="ui-btn ui-btn-danger px-3 py-1 text-xs">Izbriši</button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Admin;