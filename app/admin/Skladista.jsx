import { useState } from 'react';
import FormModal from './FormModal'; 

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
  const [open, setOpen] = useState(false);
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
      setSkladisteInput({ naziv_skladista: '', lozinka_skladista: '' });
      setErrors({});
      setOpen(false);
      await logAction(`Skladiste dodano: ${naziv_skladista}`, adminId, { naziv_skladista });
    }
  };

  const handleRemoveSkladiste = async (id) => {
    if (!window.confirm('Jeste li sigurni?')) return;

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
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setOpen(true)} className="ui-btn ui-btn-primary">Dodaj skladište</button>
      </div>
      <FormModal open={open} title="Novo skladište" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="ui-label" htmlFor="skladiste-naziv">Naziv</label>
            <input
              id="skladiste-naziv"
              type="text"
              value={skladisteInput.naziv_skladista}
              onChange={(e) => setSkladisteInput({ ...skladisteInput, naziv_skladista: e.target.value })}
              className="ui-input"
            />
            {errors.naziv_skladista && <span className="mt-1 block text-sm text-rose-300">{errors.naziv_skladista}</span>}
          </div>
          <div>
            <label className="ui-label" htmlFor="skladiste-lozinka">Lozinka</label>
            <input
              id="skladiste-lozinka"
              type="password"
              value={skladisteInput.lozinka_skladista}
              onChange={(e) => setSkladisteInput({ ...skladisteInput, lozinka_skladista: e.target.value })}
              className="ui-input"
            />
            {errors.lozinka_skladista && <span className="mt-1 block text-sm text-rose-300">{errors.lozinka_skladista}</span>}
          </div>
          <button type="button" onClick={handleAddSkladiste} className="ui-btn ui-btn-primary w-full">Spremi</button>
        </div>
      </FormModal>
      <ul className="space-y-2">
          {skladista.length === 0 && <li className="text-sm text-slate-400">Nema skladišta.</li>}
          {skladista.map(skladiste => (
            <li key={skladiste.id} className="ui-row text-sm">
              <span>{skladiste.naziv_skladista}</span>
              <button type="button" onClick={() => handleRemoveSkladiste(skladiste.id)} className="ui-btn ui-btn-danger shrink-0 px-3 py-1 text-xs">Ukloni</button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Skladista;