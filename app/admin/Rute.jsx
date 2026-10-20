import { useState } from 'react';
import FormModal from './FormModal'; 

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
  const [open, setOpen] = useState(false);
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
      setRouteInput({ opis: '', selectedStores: [''] });
      setOpen(false);
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
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setOpen(true)} className="ui-btn ui-btn-primary">Dodaj rutu</button>
      </div>
      <FormModal open={open} title="Nova ruta" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="ui-label" htmlFor="ruta-opis">Opis</label>
            <input
              id="ruta-opis"
              type="text"
              placeholder="Opcionalno"
              value={routeInput.opis}
              onChange={(e) => setRouteInput({ ...routeInput, opis: e.target.value })}
              className="ui-input"
            />
          </div>
          {routeInput.selectedStores.map((store, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                aria-label={`Trgovina ${index + 1}`}
                value={store}
                onChange={(e) => handleStoreChange(index, e.target.value)}
                className="ui-input"
              >
                <option value="">Odaberi trgovinu</option>
                {stores.map(storeOption => (
                  <option key={storeOption.id} value={storeOption.id}>
                    {storeOption.ime_trgovine}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => handleRemoveStoreField(index)} className="ui-btn ui-btn-danger shrink-0 px-3 py-2 text-xs">
                Ukloni
              </button>
            </div>
          ))}
          {errors.selectedStores && <p className="text-sm text-rose-300">{errors.selectedStores}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={handleAddStoreField} className="ui-btn flex-1">
              Dodaj trgovinu
            </button>
            <button type="button" onClick={handleAddRoute} className="ui-btn ui-btn-primary flex-1">
              Spremi
            </button>
          </div>
          {errors.submit && <p className="text-sm text-rose-300">{errors.submit}</p>}
        </div>
      </FormModal>
      <ul className="space-y-2">
          {routes.length === 0 && <li className="text-sm text-slate-400">Nema ruta.</li>}
          {routes.map(route => (
            <li key={route.id} className="ui-row text-sm">
              <span>
                {(route.ruta || '').split(', ').map(storeName => {
                  const store = stores.find(s => s.ime_trgovine === storeName);
                  return store ? `${store.ime_trgovine}, ${store.adresa}` : storeName;
                }).join(' | ')}
                <span className="mt-0.5 block text-xs text-slate-400">{route.opis || 'Nema opisa'}</span>
              </span>
              <button type="button" onClick={() => handleRemoveRoute(route.id)} className="ui-btn ui-btn-danger shrink-0 px-3 py-1 text-xs">
                Ukloni
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Route;