import { useState } from 'react';

const Drivers = ({ drivers = [], setDrivers }) => {
  const [showDriverInput, setShowDriverInput] = useState(false);
  const [showDrivers, setShowDrivers] = useState(false);
  const [driverInput, setDriverInput] = useState({ ime_vozaca: '', prezime_vozaca: '', oib_vozaca: '', lozinka_vozaca: '' });
  const [errors, setErrors] = useState({});

  const validateDriverInput = () => {
    const newErrors = {};
    if (!driverInput.ime_vozaca) {
      newErrors.ime_vozaca = 'Ime je obavezno.';
      alert(newErrors.ime_vozaca);
    }
    if (!driverInput.prezime_vozaca) {
      newErrors.prezime_vozaca = 'Prezime je obavezno.';
      alert(newErrors.prezime_vozaca);
    }
    if (!driverInput.oib_vozaca) {
      newErrors.oib_vozaca = 'OIB je obavezan.';
      alert(newErrors.oib_vozaca);
    }
    if (!driverInput.lozinka_vozaca) {
      newErrors.lozinka_vozaca = 'Lozinka je obavezna.';
      alert(newErrors.lozinka_vozaca);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDriver = async () => {
    if (!validateDriverInput()) return;

    const { ime_vozaca, prezime_vozaca, oib_vozaca, lozinka_vozaca } = driverInput;
    const res = await fetch('/api/vozaci', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ime_vozaca, prezime_vozaca, oib_vozaca, lozinka_vozaca }),
    });
    if (res.ok) {
      const newDriver = await res.json();
      setDrivers([...drivers, newDriver]);
      setShowDriverInput(false);
      setDriverInput({ ime_vozaca: '', prezime_vozaca: '', oib_vozaca: '', lozinka_vozaca: '' });
    }
  };

  const handleRemoveDriver = async (id) => {
    const res = await fetch('/api/vozaci', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setDrivers(drivers.filter(driver => driver.id !== id));
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
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Vozači</h2>
      <button onClick={() => setShowDriverInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Dodaj novog vozača
      </button>
      <button onClick={() => setShowDrivers(!showDrivers)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showDrivers ? 'Sakrij' : 'Prikaži'} vozače
      </button>
      {showDriverInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Ime"
            value={driverInput.ime_vozaca}
            onChange={(e) => setDriverInput({ ...driverInput, ime_vozaca: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <input
            type="text"
            placeholder="Prezime"
            value={driverInput.prezime_vozaca}
            onChange={(e) => setDriverInput({ ...driverInput, prezime_vozaca: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <input
            type="text"
            placeholder="OIB"
            value={driverInput.oib_vozaca}
            onChange={(e) => setDriverInput({ ...driverInput, oib_vozaca: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <input
            type="password"
            placeholder="Lozinka"
            value={driverInput.lozinka_vozaca}
            onChange={(e) => setDriverInput({ ...driverInput, lozinka_vozaca: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          <button onClick={handleAddDriver} className="bg-green-500 text-white p-2 rounded">
            Pošalji
          </button>
        </div>
      )}
      {showDrivers && (
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
              <button onClick={() => handleRemoveDriver(driver.id)} className="text-red-500 ml-2">Ukloni</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Drivers;