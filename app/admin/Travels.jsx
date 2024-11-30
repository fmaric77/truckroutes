import { useState} from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faTasks } from '@fortawesome/free-solid-svg-icons';
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
  const [showPutovanja, setShowPutovanja] = useState(false);
  const [showPutovanjeInput, setShowPutovanjeInput] = useState(false);
  const [putovanjeInput, setPutovanjeInput] = useState({ datum: '', vozac_id: '', kamion_id: '', ruta_id: '' });
  const [errors, setErrors] = useState({});

  const validatePutovanjeInput = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

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
    <div className="mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Putovanja</h2>
        <FontAwesomeIcon
          icon={faTasks}
          className="text-blue-500 text-4xl cursor-pointer mx-4"
          onClick={() => {
            setShowPutovanjeInput(!showPutovanjeInput);
            setShowPutovanja(!showPutovanja);
          }}
        />
        <Link legacyBehavior href="/admin/povijestputovanja">
          <a className="bg-green-500 text-white p-2 rounded items-center">
            <FontAwesomeIcon icon={faBook} className="mr-2" />
            Povijest
          </a>
        </Link>
      </div>
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
      {errors.submit && <p className="text-red-500 mt-4">{errors.submit}</p>}
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