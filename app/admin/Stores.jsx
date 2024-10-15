import { useState } from 'react';

const Stores = ({ stores, setStores }) => {
  const [showStoreInput, setShowStoreInput] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [storeInput, setStoreInput] = useState({ ime_trgovine: '', adresa: '' });

  const handleAddStore = async () => {
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
    }
  };

  const handleRemoveStore = async (id) => {
    const res = await fetch('/api/trgovine', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setStores(stores.filter(store => store.id !== id));
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Stores</h2>
      <button onClick={() => setShowStoreInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Add New Store
      </button>
      <button onClick={() => setShowStores(!showStores)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showStores ? 'Hide' : 'Show'} Stores
      </button>
      {showStoreInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Store Name"
            value={storeInput.ime_trgovine}
            onChange={(e) => setStoreInput({ ...storeInput, ime_trgovine: e.target.value })}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Address"
            value={storeInput.adresa}
            onChange={(e) => setStoreInput({ ...storeInput, adresa: e.target.value })}
            className="border p-2 mr-2"
          />
          <button onClick={handleAddStore} className="bg-green-500 text-white p-2 rounded">
            Submit
          </button>
        </div>
      )}
      {showStores && (
        <ul className="mt-4">
          {stores.map(store => (
            <li key={store.id} className="flex justify-between items-center border-b py-2">
              {store.ime_trgovine} - {store.adresa}
              <button onClick={() => handleRemoveStore(store.id)} className="text-red-500 ml-2">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Stores;