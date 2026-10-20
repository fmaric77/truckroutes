import { useState } from 'react';
import Link from 'next/link';
import FormModal from './FormModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

const logAction = async (action, adminId, putovanjeInfo) => {
  console.log('Logging action:', action, 'Admin ID:', adminId, 'Putovanje Info:', putovanjeInfo);
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, adminId, ...putovanjeInfo }),
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

const Travels = ({ putovanja, setPutovanja, drivers, trucks, spremneRute, adminId }) => {
  const [open, setOpen] = useState(false);
  const [putovanjeInput, setPutovanjeInput] = useState({ datum: '', vozac_id: '', kamion_id: '', ruta_id: '' });
  const [errors, setErrors] = useState({});

  const validatePutovanjeInput = () => {
    const newErrors = {};

    if (!putovanjeInput.datum) {
      newErrors.datum = 'Datum je obavezan.';
    }
    if (!putovanjeInput.vozac_id) {
      newErrors.vozac_id = 'Vozač je obavezan.';
    }
    if (!putovanjeInput.kamion_id) {
      newErrors.kamion_id = 'Kamion je obavezan.';
    }
    if (!putovanjeInput.ruta_id) {
      newErrors.ruta_id = 'Ruta je obavezna.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getDriverName = (vozac_id) => {
    const driver = drivers.find(driver => driver.id === vozac_id);
    return driver ? `${driver.ime_vozaca} ${driver.prezime_vozaca}` : 'Nepoznato';
  };

  const getTruckRegistration = (kamion_id) => {
    const truck = trucks.find(truck => truck.id === kamion_id);
    return truck ? truck.registracija : 'Nepoznato';
  };

  const getRouteName = (ruta_id) => {
    const ruta = spremneRute.find(ruta => ruta.id === ruta_id);
    return ruta ? ruta.ruta : 'Nepoznato';
  };

  const handleAddPutovanje = async () => {
    if (!validatePutovanjeInput()) return;
  
    const { datum, vozac_id, kamion_id, ruta_id } = putovanjeInput;
    const res = await fetch('/api/putovanja', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ datum, vozac_id, kamion_id, ruta_id }),
    });
  
    if (res.ok) {
      // Dohvati ažurirane podatke
      const putovanjaRes = await fetch('/api/putovanja');
      if (putovanjaRes.ok) {
        const updatedPutovanja = await putovanjaRes.json();
        setPutovanja(updatedPutovanja);
        setPutovanjeInput({ datum: '', vozac_id: '', kamion_id: '', ruta_id: '' });
        setOpen(false); 
  
        //Zabilježi akciju
        const newPutovanje = updatedPutovanja[updatedPutovanja.length - 1];
        await logAction(`Putovanje dodano: ${newPutovanje.id}`, adminId, {
          id: newPutovanje.id,
          datum: newPutovanje.datum,
          vozac: getDriverName(newPutovanje.vozac_id),
          kamion: getTruckRegistration(newPutovanje.kamion_id),
          ruta: getRouteName(newPutovanje.ruta_id),
        });
      }
    }
  };
  
  const handleRemovePutovanje = async (id) => {
    const putovanjeToRemove = putovanja.find(p => p.id === id);
    if (!putovanjeToRemove) return;

    const isConfirmed = window.confirm('Jeste li sigurni da želite izbrisati ovo putovanje?');

    if (!isConfirmed) return;

    try {
      const res = await fetch('/api/putovanja', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (res.status === 500) {
        setErrors({ ...errors, submit: 'Ne možete izbrisati putovanje koje je na ruti.' });
        return;
      }

      if (res.ok) {
        setPutovanja(putovanja.filter(p => p.id !== id));
        await logAction(`Putovanje uklonjeno: ${id}`, adminId, {
          id,
          datum: putovanjeToRemove.datum,
          vozac: getDriverName(putovanjeToRemove.vozac_id),
          kamion: getTruckRegistration(putovanjeToRemove.kamion_id),
          ruta: getRouteName(putovanjeToRemove.ruta_id),
        });
      }
    } catch (error) {
      console.error('Error removing travel:', error);
      setErrors({ ...errors, submit: 'Došlo je do greške prilikom uklanjanja putovanja.' });
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => setOpen(true)} className="ui-btn ui-btn-primary">Novo putovanje</button>
        <Link legacyBehavior href="/admin/povijestputovanja">
          <a className="ui-btn">
            <FontAwesomeIcon icon={faBook} />
            Povijest
          </a>
        </Link>
      </div>
      <FormModal open={open} title="Novo putovanje" onClose={() => setOpen(false)} wide>
      <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="ui-label" htmlFor="putovanje-datum">Datum</label>
            <input
              id="putovanje-datum"
              type="date"
              value={putovanjeInput.datum}
              onChange={(e) => setPutovanjeInput({ ...putovanjeInput, datum: e.target.value })}
              className="ui-input"
            />
            {errors.datum && <p className="mt-1 text-sm text-rose-300">{errors.datum}</p>}
          </div>
          <div>
            <label className="ui-label" htmlFor="putovanje-vozac">Vozač</label>
            <select
              id="putovanje-vozac"
              value={putovanjeInput.vozac_id}
              onChange={(e) => setPutovanjeInput({ ...putovanjeInput, vozac_id: e.target.value })}
              className="ui-input"
            >
              <option value="">Odaberi vozača</option>
              {drivers.filter(driver => driver.status !== 'neaktivan').map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.ime_vozaca} {driver.prezime_vozaca}
                </option>
              ))}
            </select>
            {errors.vozac_id && <p className="mt-1 text-sm text-rose-300">{errors.vozac_id}</p>}
          </div>
          <div>
            <label className="ui-label" htmlFor="putovanje-kamion">Kamion</label>
            <select
              id="putovanje-kamion"
              value={putovanjeInput.kamion_id}
              onChange={(e) => setPutovanjeInput({ ...putovanjeInput, kamion_id: e.target.value })}
              className="ui-input"
            >
              <option value="">Odaberi kamion</option>
              {trucks
                .filter(truck => truck.status === 'Dostupan')
                .map(truck => (
                  <option key={truck.id} value={truck.id}>
                    {truck.registracija}{truck.skladiste ? ` · ${truck.skladiste}` : ' · nije na skladištu'}
                  </option>
                ))}
            </select>
            {errors.kamion_id && <p className="mt-1 text-sm text-rose-300">{errors.kamion_id}</p>}
          </div>
          <div>
            <label className="ui-label" htmlFor="putovanje-ruta">Ruta</label>
            <select
              id="putovanje-ruta"
              value={putovanjeInput.ruta_id}
              onChange={(e) => setPutovanjeInput({ ...putovanjeInput, ruta_id: e.target.value })}
              className="ui-input"
            >
              <option value="">Odaberi rutu</option>
              {spremneRute.map(ruta => (
                <option key={ruta.id} value={ruta.id}>
                  {ruta.ruta}
                </option>
              ))}
            </select>
            {errors.ruta_id && <p className="mt-1 text-sm text-rose-300">{errors.ruta_id}</p>}
          </div>
          <button type="button" onClick={handleAddPutovanje} className="ui-btn ui-btn-primary md:col-span-2">
            Spremi
          </button>
        {errors.submit && <p className="text-sm text-rose-300 md:col-span-2">{errors.submit}</p>}
      </div>
      </FormModal>
      <ul className="space-y-2">
          {putovanja.length === 0 && <li className="text-sm text-slate-400">Nema putovanja.</li>}
          {putovanja.map(p => (
            <li key={p.id} className="ui-row text-sm">
              <span>
                {p.datum} · {p.vozac_ime} {p.vozac_prezime}
                <span className="mt-0.5 block text-xs text-slate-400">{p.registracija} · {p.ruta}</span>
              </span>
              <button type="button" onClick={() => handleRemovePutovanje(p.id)} className="ui-btn ui-btn-danger shrink-0 px-3 py-1 text-xs">Ukloni</button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Travels;