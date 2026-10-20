import { useState } from 'react';
import FormModal from './FormModal'; 

const ErrorMessage = ({ message }) => (
  <div className="text-red-500 text-sm mt-1">{message}</div>
);

const logAction = async (action, adminId, driverInfo) => {
  console.log('Logging action:', action, 'Admin ID:', adminId, 'Driver Info:', driverInfo);
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, adminId, ...driverInfo }),
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

const Drivers = ({ drivers = [], setDrivers, adminId }) => {
  const [open, setOpen] = useState(false);
  const [driverInput, setDriverInput] = useState({ 
    ime_vozaca: '', 
    prezime_vozaca: '', 
    oib_vozaca: '', 
    lozinka_vozaca: '' 
  });
  const [errors, setErrors] = useState({});

  const validateDriverInput = () => {
    const newErrors = {};
    
    if (!driverInput.ime_vozaca) {
      newErrors.ime_vozaca = 'Ime je obavezno.';
    }
    if (!driverInput.prezime_vozaca) {
      newErrors.prezime_vozaca = 'Prezime je obavezno.';
    }
    if (!driverInput.oib_vozaca) {
      newErrors.oib_vozaca = 'OIB je obavezan.';
    } else {
      const oibRegex = /^\d{11}$/;
      if (!oibRegex.test(driverInput.oib_vozaca)) {
        newErrors.oib_vozaca = 'OIB mora sadržavati točno 11 brojeva.';
      }
    }
    if (!driverInput.lozinka_vozaca) {
      newErrors.lozinka_vozaca = 'Lozinka je obavezna.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDriver = async () => {
    if (!validateDriverInput()) return;

    const { ime_vozaca, prezime_vozaca, oib_vozaca, lozinka_vozaca } = driverInput;
    
    try {
      const res = await fetch('/api/vozaci', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ime_vozaca, prezime_vozaca, oib_vozaca, lozinka_vozaca }),
      });

      if (res.status === 500) {
        setErrors({ ...errors, oib_vozaca: 'OIB već postoji u bazi.' });
        return;
      }

      if (res.ok) {
        const newDriver = await res.json();
        setDrivers([...drivers, newDriver]);
        setDriverInput({ ime_vozaca: '', prezime_vozaca: '', oib_vozaca: '', lozinka_vozaca: '' });
        setErrors({});
        setOpen(false);
        await logAction(`Vozac dodan: ${ime_vozaca} ${prezime_vozaca} (OIB: ${oib_vozaca})`, adminId, { ime_vozaca, prezime_vozaca, oib_vozaca });
      }
    } catch (error) {
      console.error('Error adding driver:', error);
      setErrors({ ...errors, submit: 'Došlo je do greške prilikom dodavanja vozača.' });
    }
  };

  const handleRemoveDriver = async (id) => {
    const driverToRemove = drivers.find(driver => driver.id === id);
    const isConfirmed = window.confirm('Jeste li sigurni da želite izbrisati ovog vozača?');
    
    if (!isConfirmed) return;
  
    try {
      const res = await fetch('/api/vozaci', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
  
      if (res.status === 500) {
        setErrors({ ...errors, submit: 'Ne možete izbrisati vozača koji je na ruti.' });
        return;
      }
  
      if (res.ok) {
        setDrivers(drivers.filter(driver => driver.id !== id));
        await logAction(`Vozac uklonjen: ${driverToRemove.ime_vozaca} ${driverToRemove.prezime_vozaca} (OIB: ${driverToRemove.oib_vozaca})`, adminId, { 
          ime_vozaca: driverToRemove.ime_vozaca, 
          prezime_vozaca: driverToRemove.prezime_vozaca, 
          oib_vozaca: driverToRemove.oib_vozaca 
        });
      }
    } catch (error) {
      console.error('Error removing driver:', error);
      setErrors({ ...errors, submit: 'Došlo je do greške prilikom uklanjanja vozača.' });
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'aktivan' ? 'neaktivan' : 'aktivan';
    const res = await fetch('/api/vozaci', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      const updatedDriver = await res.json();
      setDrivers(drivers.map(driver => driver.id === id ? updatedDriver : driver));
      await logAction(`Status promijenjen za: ${updatedDriver.ime_vozaca} ${updatedDriver.prezime_vozaca} (OIB: ${updatedDriver.oib_vozaca}) na ${newStatus}`, adminId, {
        ime_vozaca: updatedDriver.ime_vozaca,
        prezime_vozaca: updatedDriver.prezime_vozaca,
        oib_vozaca: updatedDriver.oib_vozaca,
        status: newStatus
      });
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setOpen(true)} className="ui-btn ui-btn-primary">Dodaj vozača</button>
      </div>
      <FormModal open={open} title="Novi vozač" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="ui-label" htmlFor="vozac-ime">Ime</label>
            <input
              id="vozac-ime"
              type="text"
              value={driverInput.ime_vozaca}
              onChange={(e) => setDriverInput({ ...driverInput, ime_vozaca: e.target.value })}
              className="ui-input"
            />
            {errors.ime_vozaca && <ErrorMessage message={errors.ime_vozaca} />}
          </div>
          <div>
            <label className="ui-label" htmlFor="vozac-prezime">Prezime</label>
            <input
              id="vozac-prezime"
              type="text"
              value={driverInput.prezime_vozaca}
              onChange={(e) => setDriverInput({ ...driverInput, prezime_vozaca: e.target.value })}
              className="ui-input"
            />
            {errors.prezime_vozaca && <ErrorMessage message={errors.prezime_vozaca} />}
          </div>
          <div>
            <label className="ui-label" htmlFor="vozac-oib">OIB</label>
            <input
              id="vozac-oib"
              type="text"
              value={driverInput.oib_vozaca}
              onChange={(e) => setDriverInput({ ...driverInput, oib_vozaca: e.target.value })}
              className="ui-input"
            />
            {errors.oib_vozaca && <ErrorMessage message={errors.oib_vozaca} />}
          </div>
          <div>
            <label className="ui-label" htmlFor="vozac-lozinka">Lozinka</label>
            <input
              id="vozac-lozinka"
              type="password"
              value={driverInput.lozinka_vozaca}
              onChange={(e) => setDriverInput({ ...driverInput, lozinka_vozaca: e.target.value })}
              className="ui-input"
            />
            {errors.lozinka_vozaca && <ErrorMessage message={errors.lozinka_vozaca} />}
          </div>
          {errors.submit && <ErrorMessage message={errors.submit} />}
          <button type="button" onClick={handleAddDriver} className="ui-btn ui-btn-primary w-full">Spremi</button>
        </div>
      </FormModal>
      <ul className="space-y-2">
          {drivers.length === 0 && <li className="text-sm text-slate-400">Nema vozača.</li>}
          {drivers.map(driver => (
            <li key={driver.id} className="ui-row flex-col sm:flex-row sm:items-center">
              <span className="text-sm">
                {driver.ime_vozaca} {driver.prezime_vozaca}
                <span className="mt-0.5 block text-xs text-slate-400">OIB {driver.oib_vozaca}</span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  {driver.kamion ? `Kamion: ${driver.kamion}${driver.kamion_datum ? ` · ${driver.kamion_datum}` : ''}` : 'Nema dodijeljenog kamiona'}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(driver.id, driver.status)}
                  className="ui-btn px-3 py-1 text-xs"
                >
                  {driver.status}
                </button>
                <button type="button" onClick={() => handleRemoveDriver(driver.id)} className="ui-btn ui-btn-danger px-3 py-1 text-xs">
                  Ukloni
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Drivers;