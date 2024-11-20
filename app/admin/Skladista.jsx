import { useState } from 'react';
import { FaWarehouse } from 'react-icons/fa'; // Assuming you have react-icons installed

const logAction = async (action, adminId, skladisteInfo) => {
  console.log('Logging action:', action, 'Admin ID:', adminId, 'Skladiste Info:', skladisteInfo);
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, adminId, ...skladisteInfo }),
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

const Skladista = ({ skladista = [], setSkladista, adminId }) => {
  const [showSkladisteInput, setShowSkladisteInput] = useState(false);
  const [skladisteInput, setSkladisteInput] = useState({ naziv_skladista: '', lozinka_skladista: '' });
  const [errors, setErrors] = useState({});

  const validateSkladisteInput = () => {
    const newErrors = {};
    if (!skladisteInput.naziv_skladista) {
      newErrors.naziv_skladista = 'Naziv je obavezan.';
    }
    if (!skladisteInput.lozinka_skladista) {
      newErrors.lozinka_skladista = 'Lozinka je obavezna.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSkladiste = async () => {
    if (!validateSkladisteInput()) return;

    const { naziv_skladista, lozinka_skladista } = skladisteInput;
    const res = await fetch('/api/skladista', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ naziv_skladista, lozinka_skladista }),
    });
    if (res.ok) {
      const newSkladiste = await res.json();
      setSkladista([...skladista, newSkladiste]);
      setShowSkladisteInput(false);
      setSkladisteInput({ naziv_skladista: '', lozinka_skladista: '' });
      setErrors({});
      await logAction(`Skladiste dodano: ${naziv_skladista}`, adminId, { naziv_skladista });
    }
  };

  const handleRemoveSkladiste = async (id) => {
    const skladisteToRemove = skladista.find(skladiste => skladiste.id === id);
    if (!skladisteToRemove) return;

    const res = await fetch('/api/skladista', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setSkladista(skladista.filter(skladiste => skladiste.id !== id));
      await logAction(`Skladiste uklonjeno: ${skladisteToRemove.naziv_skladista}`, adminId, { naziv_skladista: skladisteToRemove.naziv_skladista });
    }
  };

  return (
    <div className="mt-8 text-center">
      <h2 className="text-xl font-bold">Skladišta</h2>
      <FaWarehouse 
        onClick={() => setShowSkladisteInput(!showSkladisteInput)} 
        className="text-6xl cursor-pointer mx-auto my-4" 
      />
      {showSkladisteInput && (
        <div className="mt-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Naziv"
            value={skladisteInput.naziv_skladista}
            onChange={(e) => setSkladisteInput({ ...skladisteInput, naziv_skladista: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.naziv_skladista && <span className="text-red-500 text-sm mt-1">{errors.naziv_skladista}</span>}
          <input
            type="password"
            placeholder="Lozinka"
            value={skladisteInput.lozinka_skladista}
            onChange={(e) => setSkladisteInput({ ...skladisteInput, lozinka_skladista: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.lozinka_skladista && <span className="text-red-500 text-sm mt-1">{errors.lozinka_skladista}</span>}
          <button onClick={handleAddSkladiste} className="text-green-500 ml-2">
            Dodaj
          </button>
        </div>
      )}
      {showSkladisteInput && (
        <ul className="mt-4">
          {skladista.map(skladiste => (
            <li key={skladiste.id} className="flex justify-between items-center border-b py-2">
              {skladiste.naziv_skladista}
              <button onClick={() => handleRemoveSkladiste(skladiste.id)} className="text-red-500 ml-2">Ukloni</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Skladista;