import { useState } from 'react';

const logAction = async (action, adminId, storeInfo) => {
  console.log('Logging action:', action, 'Admin ID:', adminId, 'Store Info:', storeInfo);
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, adminId, ...storeInfo }),
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

const Stores = ({ stores, setStores, adminId }) => {
  const [showStoreInput, setShowStoreInput] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [storeInput, setStoreInput] = useState({ ime_trgovine: '', adresa: '' });
  const [errors, setErrors] = useState({});

  const validateStoreInput = () => {
    const newErrors = {};
    if (!storeInput.ime_trgovine) {
      newErrors.ime_trgovine = 'Ime trgovine je obavezno.';
      alert(newErrors.ime_trgovine);
    }
    if (!storeInput.adresa) {
      newErrors.adresa = 'Adresa je obavezna.';
      alert(newErrors.adresa);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStore = async () => {
    if (!validateStoreInput()) return;

    const { ime_trgovine, adresa } = storeInput;
    const res = await fetch('/api/trgovine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ime_trgovine, adresa }),
    });
    if (res.ok) {
      const newStore = await res.json();
      setStores([...stores, newStore]);
      setShowStoreInput(false);
      setStoreInput({ ime_trgovine: '', adresa: '' });
      await logAction(`Trgovina dodana: ${ime_trgovine}, ${adresa}`, adminId, {
        ime_trgovine,
        adresa,
      });
    }
  };

  const handleRemoveStore = async (id) => {
    const storeToRemove = stores.find(store => store.id === id);
    if (!storeToRemove) return;

    const res = await fetch('/api/trgovine', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setStores(stores.filter(store => store.id !== id));
      await logAction(`Trgovina uklonjena: ${storeToRemove.ime_trgovine}, ${storeToRemove.adresa}`, adminId, {
        ime_trgovine: storeToRemove.ime_trgovine,
        adresa: storeToRemove.adresa,
      });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Trgovine</h2>
      <button onClick={() => setShowStoreInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Dodaj novu trgovinu
      </button>
      <button onClick={() => setShowStores(!showStores)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showStores ? 'Sakrij' : 'Prikaži'} trgovine
      </button>
      {showStoreInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Ime trgovine"
            value={storeInput.ime_trgovine}
            onChange={(e) => setStoreInput({ ...storeInput, ime_trgovine: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <input
            type="text"
            placeholder="Adresa"
            value={storeInput.adresa}
            onChange={(e) => setStoreInput({ ...storeInput, adresa: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <button onClick={handleAddStore} className="bg-green-500 text-white p-2 rounded">
            Pošalji
          </button>
        </div>
      )}
      {showStores && (
        <ul className="mt-4">
          {stores.map(store => (
            <li key={store.id} className="flex justify-between items-center border-b py-2">
              {store.ime_trgovine} - {store.adresa}
              <button onClick={() => handleRemoveStore(store.id)} className="text-red-500 ml-2">Ukloni</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Stores;