import { useState } from 'react';

const Route = ({ routes, setRoutes, stores }) => {
  const [showRouteInput, setShowRouteInput] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [routeInput, setRouteInput] = useState({ opis: '', selectedStores: [''] });
  const [errors, setErrors] = useState({});

  const validateRouteInput = () => {
    const newErrors = {};
    if (routeInput.selectedStores.some(store => !store)) {
      newErrors.selectedStores = 'Sva polja trgovina moraju biti odabrana.';
      alert(newErrors.selectedStores);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRoute = async () => {
    if (!validateRouteInput()) return;

    const { opis, selectedStores } = routeInput;
    const res = await fetch('/api/rute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedStores, opis }),
    });
    if (res.ok) {
      const newRoute = await res.json();
      setRoutes([...routes, newRoute]);
      setShowRouteInput(false);
      setRouteInput({ opis: '', selectedStores: [''] });
    }
  };

  const handleAddStoreField = () => {
    setRouteInput({
      ...routeInput,
      selectedStores: [...routeInput.selectedStores, ''],
    });
  };

  const handleRemoveStoreField = (index) => {
    const newSelectedStores = routeInput.selectedStores.filter((_, i) => i !== index);
    setRouteInput({
      ...routeInput,
      selectedStores: newSelectedStores,
    });
  };

  const handleStoreChange = (index, value) => {
    const newSelectedStores = routeInput.selectedStores.map((store, i) => (i === index ? value : store));
    setRouteInput({
      ...routeInput,
      selectedStores: newSelectedStores,
    });
  };

  const handleRemoveRoute = async (id) => {
    const res = await fetch('/api/rute', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setRoutes(routes.filter(route => route.id !== id));
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Rute</h2>
      <button onClick={() => setShowRouteInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Dodaj novu rutu
      </button>
      <button onClick={() => setShowRoutes(!showRoutes)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showRoutes ? 'Sakrij' : 'Prikaži'} rute
      </button>
      {showRouteInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Opis (opcionalno)"
            value={routeInput.opis}
            onChange={(e) => setRouteInput({ ...routeInput, opis: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {routeInput.selectedStores.map((store, index) => (
            <div key={index} className="flex items-center mb-2">
              <select
                value={store}
                onChange={(e) => handleStoreChange(index, e.target.value)}
                className="border p-2 mr-2 bg-black text-white"
              >
                <option value="">Odaberi trgovinu</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.ime_trgovine}
                  </option>
                ))}
              </select>
              <span onClick={() => handleRemoveStoreField(index)} className="text-red-500 cursor-pointer">
                Ukloni
              </span>
            </div>
          ))}
          {errors.selectedStores && <p className="text-red-500">{errors.selectedStores}</p>}
          <button onClick={handleAddStoreField} className="bg-green-500 text-white p-2 rounded">
            Dodaj trgovinu
          </button>
          <button onClick={handleAddRoute} className="bg-green-500 text-white p-2 rounded ml-2">
            Pošalji
          </button>
        </div>
      )}
      {showRoutes && (
        <ul className="mt-4">
          {routes.map(route => (
            <li key={route.id} className="flex justify-between items-center border-b py-2">
              {route.ruta.split(', ').map(storeName => {
                const store = stores.find(s => s.ime_trgovine === storeName);
                return store ? `${store.ime_trgovine}, ${store.adresa}` : storeName;
              }).join(' | ')} - {route.opis || 'Nema opisa'}
              <span onClick={() => handleRemoveRoute(route.id)} className="text-red-500 cursor-pointer ml-2">
                Ukloni
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Route;