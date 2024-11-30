import { useState } from 'react';
import { FaUser } from 'react-icons/fa'; // Assuming you have react-icons installed

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
  const [showDriverInput, setShowDriverInput] = useState(false);
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
        setShowDriverInput(false);
        setDriverInput({ ime_vozaca: '', prezime_vozaca: '', oib_vozaca: '', lozinka_vozaca: '' });
        setErrors({});
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
    <div className="mt-8 text-center">
      <h2 className="text-xl font-bold">Vozači</h2>
      <FaUser 
        onClick={() => setShowDriverInput(!showDriverInput)} 
        className="text-6xl cursor-pointer mx-auto my-4" 
      />
      {showDriverInput && (
        <div className="mt-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Ime"
            value={driverInput.ime_vozaca}
            onChange={(e) => setDriverInput({ ...driverInput, ime_vozaca: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.ime_vozaca && <ErrorMessage message={errors.ime_vozaca} />}
          <input
            type="text"
            placeholder="Prezime"
            value={driverInput.prezime_vozaca}
            onChange={(e) => setDriverInput({ ...driverInput, prezime_vozaca: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.prezime_vozaca && <ErrorMessage message={errors.prezime_vozaca} />}
          <input
            type="text"
            placeholder="OIB"
            value={driverInput.oib_vozaca}
            onChange={(e) => setDriverInput({ ...driverInput, oib_vozaca: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.oib_vozaca && <ErrorMessage message={errors.oib_vozaca} />}
          <input
            type="password"
            placeholder="Lozinka"
            value={driverInput.lozinka_vozaca}
            onChange={(e) => setDriverInput({ ...driverInput, lozinka_vozaca: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.lozinka_vozaca && <ErrorMessage message={errors.lozinka_vozaca} />}
          {errors.submit && <ErrorMessage message={errors.submit} />}
          <button onClick={handleAddDriver} className="text-green-500 ml-2">
            Dodaj
          </button>
        </div>
      )}
      {showDriverInput && (
        <ul className="mt-4">
          {drivers.map(driver => (
            <li key={driver.id} className="flex justify-between items-center border-b py-2">
              {driver.ime_vozaca} {driver.prezime_vozaca} - Status: 
              <span 
                onClick={() => handleToggleStatus(driver.id, driver.status)} 
                className="cursor-pointer text-blue-500"
              >
                {driver.status}
              </span>
              <button onClick={() => handleRemoveDriver(driver.id)} className="text-red-500 ml-2">
                Ukloni
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Drivers;