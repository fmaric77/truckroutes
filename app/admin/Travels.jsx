import { useState, useEffect } from 'react';

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

const Travels = ({ putovanja, setPutovanja, drivers, trucks, spremneRute, stores, adminId }) => {
  const [showPutovanja, setShowPutovanja] = useState(false);
  const [showPutovanjeInput, setShowPutovanjeInput] = useState(false);
  const [putovanjeInput, setPutovanjeInput] = useState({ datum: '', vozac_id: '', kamion_id: '', ruta_id: '' });
  const [errors, setErrors] = useState({});

  const validatePutovanjeInput = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!putovanjeInput.datum) {
      newErrors.datum = 'Datum je obavezan.';
    } else if (putovanjeInput.datum < today) {
      newErrors.datum = 'Datum ne može biti u prošlosti.';
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
      const newPutovanje = await res.json();
      setPutovanja([...putovanja, newPutovanje]);
      setPutovanjeInput({ datum: '', vozac_id: '', kamion_id: '', ruta_id: '' });
      setShowPutovanjeInput(false);
      await logAction(`Putovanje dodano: ${newPutovanje.id}`, adminId, {
        id: newPutovanje.id,
        datum,
        vozac: getDriverName(vozac_id),
        kamion: getTruckRegistration(kamion_id),
        ruta: getRouteName(ruta_id),
      });
    }
  };

  const handleUpdatePutovanje = async (id, datum, vozac_id, kamion_id, ruta_id) => {
    const res = await fetch('/api/putovanja', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, datum, vozac_id, kamion_id, ruta_id }),
    });
    if (res.ok) {
      const updatedPutovanje = await res.json();
      setPutovanja(putovanja.map(p => (p.id === id ? updatedPutovanje : p)));
      await logAction(`Putovanje ažurirano: ${datum}`, adminId, {
        id,
        datum,
        vozac: getDriverName(vozac_id),
        kamion: getTruckRegistration(kamion_id),
        ruta: getRouteName(ruta_id),
      });
    }
  };

  const handleRemovePutovanje = async (id) => {
    const putovanjeToRemove = putovanja.find(p => p.id === id);
    if (!putovanjeToRemove) return;

    const res = await fetch('/api/putovanja', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
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
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Putovanja</h2>
      <button onClick={() => setShowPutovanjeInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Dodaj novo putovanje
      </button>
      <button onClick={() => setShowPutovanja(!showPutovanja)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showPutovanja ? 'Sakrij' : 'Prikaži'} putovanja
      </button>
      {showPutovanjeInput && (
        <div className="mt-4">
          <input
            type="date"
            value={putovanjeInput.datum}
            onChange={(e) => setPutovanjeInput({ ...putovanjeInput, datum: e.target.value })}
            className="border p-2 mr-2 bg-black text-white"
          />
          {errors.datum && <p className="text-red-500">{errors.datum}</p>}
          <select
            value={putovanjeInput.vozac_id}
            onChange={(e) => setPutovanjeInput({ ...putovanjeInput, vozac_id: e.target.value })}
            className="border p-2 mr-2 bg-black text-white"
          >
            <option value="">Odaberi vozača</option>
            {drivers.filter(driver => driver.status !== 'neaktivan').map(driver => (
              <option key={driver.id} value={driver.id}>
                {driver.ime_vozaca} {driver.prezime_vozaca}
              </option>
            ))}
          </select>
          {errors.vozac_id && <p className="text-red-500">{errors.vozac_id}</p>}
          <select
            value={putovanjeInput.kamion_id}
            onChange={(e) => setPutovanjeInput({ ...putovanjeInput, kamion_id: e.target.value })}
            className="border p-2 mr-2 bg-black text-white"
          >
            <option value="">Odaberi kamion</option>
            {trucks
              .filter(truck => truck.status === 'Dostupan')
              .map(truck => (
                <option key={truck.id} value={truck.id}>
                  {truck.registracija}
                </option>
              ))}
          </select>
          {errors.kamion_id && <p className="text-red-500">{errors.kamion_id}</p>}
          <select
            value={putovanjeInput.ruta_id}
            onChange={(e) => setPutovanjeInput({ ...putovanjeInput, ruta_id: e.target.value })}
            className="border p-2 mr-2 bg-black text-white"
          >
            <option value="">Odaberi rutu</option>
            {spremneRute.map(ruta => (
              <option key={ruta.id} value={ruta.id}>
                {ruta.ruta}
              </option>
            ))}
          </select>
          {errors.ruta_id && <p className="text-red-500">{errors.ruta_id}</p>}
          <button onClick={handleAddPutovanje} className="bg-green-500 text-white p-2 rounded ml-2">
            Pošalji
          </button>
        </div>
      )}
      {showPutovanja && (
        <ul className="mt-4">
          {putovanja.map(p => (
            <li key={p.id} className="flex justify-between items-center border-b py-2">
              {p.datum} - {p.vozac_ime} {p.vozac_prezime} - {p.registracija} - {p.ruta}
              <button onClick={() => handleRemovePutovanje(p.id)} className="text-red-500 ml-2">Ukloni</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Travels;