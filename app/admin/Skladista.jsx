import { useState } from 'react';

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
  const [showSkladista, setShowSkladista] = useState(false);
  const [skladisteInput, setSkladisteInput] = useState({ naziv_skladista: '', lozinka_skladista: '' });
  const [errors, setErrors] = useState({});

  const validateSkladisteInput = () => {
    const newErrors = {};
    if (!skladisteInput.naziv_skladista) {
      newErrors.naziv_skladista = 'Naziv je obavezan.';
      alert(newErrors.naziv_skladista);
    }
    if (!skladisteInput.lozinka_skladista) {
      newErrors.lozinka_skladista = 'Lozinka je obavezna.';
      alert(newErrors.lozinka_skladista);
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
    <div className="mt-8">
      <h2 className="text-xl font-bold">Skladišta</h2>
      <button onClick={() => setShowSkladisteInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Dodaj novo skladište
      </button>
      <button onClick={() => setShowSkladista(!showSkladista)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showSkladista ? 'Sakrij' : 'Prikaži'} skladišta
      </button>
      {showSkladisteInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Naziv"
            value={skladisteInput.naziv_skladista}
            onChange={(e) => setSkladisteInput({ ...skladisteInput, naziv_skladista: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <input
            type="password"
            placeholder="Lozinka"
            value={skladisteInput.lozinka_skladista}
            onChange={(e) => setSkladisteInput({ ...skladisteInput, lozinka_skladista: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <button onClick={handleAddSkladiste} className="bg-green-500 text-white p-2 rounded">
            Pošalji
          </button>
        </div>
      )}
      {showSkladista && (
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