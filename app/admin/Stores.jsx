import { useState } from 'react';
import FormModal from './FormModal'; 

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
  const [open, setOpen] = useState(false);
  const [storeInput, setStoreInput] = useState({ ime_trgovine: '', adresa: '' });
  const [query, setQuery] = useState('');
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
      setStoreInput({ ime_trgovine: '', adresa: '' });
      setErrors({});
      setOpen(false);
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

  const q = query.trim().toLowerCase();
  const visibleStores = stores.filter((store) => {
    if (!q) return true;
    return `${store.ime_trgovine} ${store.adresa}`.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Traži trgovinu ili adresu"
          aria-label="Traži trgovinu"
          className="ui-input max-w-md"
        />
        <button type="button" onClick={() => setOpen(true)} className="ui-btn ui-btn-primary">Dodaj trgovinu</button>
      </div>
      <FormModal open={open} title="Nova trgovina" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="ui-label" htmlFor="trgovina-ime">Ime trgovine</label>
            <input
              id="trgovina-ime"
              type="text"
              value={storeInput.ime_trgovine}
              onChange={(e) => setStoreInput({ ...storeInput, ime_trgovine: e.target.value })}
              className="ui-input"
            />
            {errors.ime_trgovine && <div className="mt-1 text-sm text-rose-300">{errors.ime_trgovine}</div>}
          </div>
          <div>
            <label className="ui-label" htmlFor="trgovina-adresa">Adresa</label>
            <input
              id="trgovina-adresa"
              type="text"
              value={storeInput.adresa}
              onChange={(e) => setStoreInput({ ...storeInput, adresa: e.target.value })}
              className="ui-input"
            />
            {errors.adresa && <div className="mt-1 text-sm text-rose-300">{errors.adresa}</div>}
          </div>
          <button type="button" onClick={handleAddStore} className="ui-btn ui-btn-primary w-full">Spremi</button>
        </div>
      </FormModal>
      <div>
        <ul className="space-y-2">
          {visibleStores.length === 0 && <li className="text-sm text-slate-400">Nema trgovina.</li>}
          {visibleStores.map(store => (
            <li key={store.id} className="ui-row text-sm">
              <span>{store.ime_trgovine}<span className="mt-0.5 block text-xs text-slate-400">{store.adresa}</span></span>
              <button type="button" onClick={() => handleRemoveStore(store.id)} className="ui-btn ui-btn-danger shrink-0 px-3 py-1 text-xs">Ukloni</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Stores;