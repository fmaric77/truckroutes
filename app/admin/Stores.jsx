import { useState } from 'react';
import { FaStore } from 'react-icons/fa'; // Assuming you have react-icons installed

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
  const [storeInput, setStoreInput] = useState({ ime_trgovine: '', adresa: '' });
  const [errors, setErrors] = useState({});

  const validateStoreInput = () => {
    const newErrors = {};
    if (!storeInput.ime_trgovine) {
      newErrors.ime_trgovine = 'Ime trgovine je obavezno.';
    }
    if (!storeInput.adresa) {
      newErrors.adresa = 'Adresa je obavezna.';
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
      setErrors({});
      await logAction(`Trgovina dodana: ${ime_trgovine}, ${adresa}`, adminId, {
        ime_trgovine,
        adresa,
      });
    }
  };

  const handleRemoveStore = async (id) => {
    const storeToRemove = stores.find(store => store.id === id);
    if (!storeToRemove) return;

    const confirmed = window.confirm('Jeste li sigurni?');
    if (!confirmed) return;

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
    <div className="mt-8 text-center">
      <h2 className="text-xl font-bold">Trgovine</h2>
      <FaStore 
        onClick={() => setShowStoreInput(!showStoreInput)} 
        className="text-6xl cursor-pointer mx-auto my-4" 
      />
      {showStoreInput && (
        <div className="mt-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Ime trgovine"
            value={storeInput.ime_trgovine}
            onChange={(e) => setStoreInput({ ...storeInput, ime_trgovine: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.ime_trgovine && (
            <div className="text-red-500 text-sm mt-1">{errors.ime_trgovine}</div>
          )}
          <input
            type="text"
            placeholder="Adresa"
            value={storeInput.adresa}
            onChange={(e) => setStoreInput({ ...storeInput, adresa: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.adresa && (
            <div className="text-red-500 text-sm mt-1">{errors.adresa}</div>
          )}
          <button onClick={handleAddStore} className="text-green-500 ml-2">
            Dodaj
          </button>
        </div>
      )}
      {showStoreInput && (
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