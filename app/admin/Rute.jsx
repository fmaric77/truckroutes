import { useState } from 'react';
import { FaRoute } from 'react-icons/fa'; 

const logAction = async (action, adminId, routeInfo) => {
  console.log('Logging action:', action, 'Admin ID:', adminId, 'Route Info:', routeInfo);
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, adminId, ...routeInfo }),
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

const Route = ({ routes, setRoutes, stores, adminId }) => {
  const [showRouteInput, setShowRouteInput] = useState(false);
  const [routeInput, setRouteInput] = useState({ opis: '', selectedStores: [''] });
  const [errors, setErrors] = useState({});

  const validateRouteInput = () => {
    const newErrors = {};
    if (routeInput.selectedStores.some(store => !store)) {
      newErrors.selectedStores = 'Sva polja trgovina moraju biti odabrana.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStoreNames = (storeIds) => {
    return storeIds.map(storeId => {
      const store = stores.find(s => s.id === storeId);
      return store ? store.ime_trgovine : storeId;
    });
  };

  const handleAddRoute = async () => {
    if (!validateRouteInput()) return;

    const { opis, selectedStores } = routeInput;
    const storeNames = getStoreNames(selectedStores);
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
      await logAction(`Ruta dodana: ${opis || 'Nema opisa'} (Trgovine: ${storeNames.join(', ')})`, adminId, { opis, selectedStores: storeNames });
    }
  };

  const handleRemoveRoute = async (id) => {
    const routeToRemove = routes.find(route => route.id === id);
    if (!routeToRemove) return;
  
    const isConfirmed = window.confirm('Jeste li sigurni da želite izbrisati ovu rutu?');
    
    if (!isConfirmed) return;
  
    try {
      const res = await fetch('/api/rute', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
  
      if (res.status === 500) {
        setErrors({ ...errors, submit: 'Ne možete izbrisati rutu koja dodijeljena budućem putovanju.' });
        return;
      }
  
      if (res.ok) {
        setRoutes(routes.filter(route => route.id !== id));
        const storeNames = getStoreNames(routeToRemove.selectedStores || []);
        await logAction(`Ruta uklonjena: ${routeToRemove.opis || 'Nema opisa'}`, adminId, { opis: routeToRemove.opis, selectedStores: storeNames });
      }
    } catch (error) {
      console.error('Error removing route:', error);
      setErrors({ ...errors, submit: 'Došlo je do greške prilikom uklanjanja rute.' });
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

  return (
    <div className="mt-8 text-center">
      <h2 className="text-xl font-bold">Rute</h2>
      <FaRoute 
        onClick={() => setShowRouteInput(!showRouteInput)} 
        className="text-6xl cursor-pointer mx-auto my-4" 
      />
      {showRouteInput && (
        <div className="mt-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Opis (opcionalno)"
            value={routeInput.opis}
            onChange={(e) => setRouteInput({ ...routeInput, opis: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {routeInput.selectedStores.map((store, index) => (
            <div key={index} className="flex items-center mb-2 w-full max-w-md">
              <select
                value={store}
                onChange={(e) => handleStoreChange(index, e.target.value)}
                className="border p-2 mr-2 w-full bg-black text-white"
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
          <button onClick={handleAddStoreField} className="text-blue-500 ml-2">
            Dodaj trgovinu
          </button>
          <button onClick={handleAddRoute} className="text-green-500 ml-2">
            Dodaj rutu
          </button>
        </div>
      )}
      {errors.submit && <p className="text-red-500 mt-4">{errors.submit}</p>}
      {showRouteInput && (
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