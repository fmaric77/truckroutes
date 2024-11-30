import { useState } from 'react';
import { FaUserShield } from 'react-icons/fa'; // Assuming you have react-icons installed

const Admin = ({ admins = [], setAdmins, adminId }) => {
  const [showAdminInput, setShowAdminInput] = useState(false);
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
    <div className="mt-8 text-center">
      <h2 className="text-xl font-bold">Administratori</h2>
      <FaUserShield 
        onClick={() => setShowAdminInput(!showAdminInput)} 
        className="text-6xl cursor-pointer mx-auto my-4" 
      />
      {showAdminInput && (
        <div className="mt-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Ime"
            value={adminInput.ime}
            onChange={(e) => setAdminInput({ ...adminInput, ime: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <input
            type="password"
            placeholder="Lozinka"
            value={adminInput.lozinka}
            onChange={(e) => setAdminInput({ ...adminInput, lozinka: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <button onClick={handleAddAdmin} className="text-green-500 ml-2">
            Dodaj
          </button>
        </div>
      )}
      {showAdminInput && (
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