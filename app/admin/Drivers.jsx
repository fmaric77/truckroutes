import { useState } from 'react';

const Drivers = ({ drivers = [], setDrivers }) => {
  const [showDriverInput, setShowDriverInput] = useState(false);
  const [showDrivers, setShowDrivers] = useState(false);
  const [driverInput, setDriverInput] = useState({ ime: '', prezime: '', oib: '', lozinka: '' });

  const handleAddDriver = async () => {
    const { ime, prezime, oib, lozinka } = driverInput;
    const res = await fetch('/api/vozaci', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ime, prezime, oib, lozinka }),
    });
    if (res.ok) {
      const newDriver = await res.json();
      setDrivers([...drivers, newDriver]);
      setShowDriverInput(false);
      setDriverInput({ ime: '', prezime: '', oib: '', lozinka: '' });
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

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Drivers</h2>
      <button onClick={() => setShowDriverInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Add New Driver
      </button>
      <button onClick={() => setShowDrivers(!showDrivers)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showDrivers ? 'Hide' : 'Show'} Drivers
      </button>
      {showDriverInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="First Name"
            value={driverInput.ime}
            onChange={(e) => setDriverInput({ ...driverInput, ime: e.target.value })}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={driverInput.prezime}
            onChange={(e) => setDriverInput({ ...driverInput, prezime: e.target.value })}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="OIB"
            value={driverInput.oib}
            onChange={(e) => setDriverInput({ ...driverInput, oib: e.target.value })}
            className="border p-2 mr-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={driverInput.lozinka}
            onChange={(e) => setDriverInput({ ...driverInput, lozinka: e.target.value })}
            className="border p-2 mr-2"
          />
          <button onClick={handleAddDriver} className="bg-green-500 text-white p-2 rounded">
            Submit
          </button>
        </div>
      )}
      {showDrivers && (
        <ul className="mt-4">
          {drivers.map(driver => (
            <li key={driver.id} className="flex justify-between items-center border-b py-2">
              {driver.ime} {driver.prezime} - Status: {driver.status}
              <button onClick={() => handleRemoveDriver(driver.id)} className="text-red-500 ml-2">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Drivers;