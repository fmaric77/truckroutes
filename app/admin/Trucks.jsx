import { useState } from 'react';

const logAction = async (action, adminId, truckInfo) => {
  console.log('Logging action:', action, 'Admin ID:', adminId, 'Truck Info:', truckInfo);
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, adminId, ...truckInfo }),
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

const Trucks = ({ trucks, setTrucks, adminId }) => {
  const [showTruckInput, setShowTruckInput] = useState(false);
  const [showTrucks, setShowTrucks] = useState(false);
  const [truckInput, setTruckInput] = useState({ registracija: '', datum_registracije: '' });
  const [errors, setErrors] = useState({});

  const validateTruckInput = () => {
    const newErrors = {};
    const currentDate = new Date().toISOString().split('T')[0];

    if (!truckInput.registracija) {
      newErrors.registracija = 'Registracija je obavezna.';
    } else if (!/^[a-zA-Z0-9]{8}$/.test(truckInput.registracija)) {
      newErrors.registracija = 'Registracija mora imati točno 8 alfanumeričkih znakova.';
    }

    if (!truckInput.datum_registracije) {
      newErrors.datum_registracije = 'Datum registracije je obavezan.';
    } else if (truckInput.datum_registracije < currentDate) {
      newErrors.datum_registracije = 'Datum registracije ne može biti u prošlosti.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTruck = async () => {
    if (!validateTruckInput()) return;

    const { registracija, datum_registracije } = truckInput;
    const res = await fetch('/api/kamioni', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registracija, datum_registracije }),
    });
    if (res.ok) {
      const newTruck = await res.json();
      setTrucks([...trucks, newTruck]);
      setShowTruckInput(false);
      setTruckInput({ registracija: '', datum_registracije: '' });
      await logAction(`Kamion dodan: ${registracija}`, adminId, { registracija, datum_registracije });
    }
  };

  const handleRemoveTruck = async (id) => {
    const truckToRemove = trucks.find(truck => truck.id === id);
    if (!truckToRemove) return;

    const res = await fetch('/api/kamioni', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setTrucks(trucks.filter(truck => truck.id !== id));
      await logAction(`Kamion uklonjen: ${truckToRemove.registracija}`, adminId, { registracija: truckToRemove.registracija });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Kamioni</h2>
      <button onClick={() => setShowTruckInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Dodaj novi kamion
      </button>
      <button onClick={() => setShowTrucks(!showTrucks)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showTrucks ? 'Sakrij' : 'Prikaži'} kamione
      </button>
      {showTruckInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Registracija"
            value={truckInput.registracija}
            onChange={(e) => setTruckInput({ ...truckInput, registracija: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.registracija && <p className="text-red-500">{errors.registracija}</p>}
          <input
            type="date"
            placeholder="Datum registracije"
            value={truckInput.datum_registracije}
            onChange={(e) => setTruckInput({ ...truckInput, datum_registracije: e.target.value })}
            className="border p-2 mr-2"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.datum_registracije && <p className="text-red-500">{errors.datum_registracije}</p>}
          <button onClick={handleAddTruck} className="bg-green-500 text-white p-2 rounded">
            Pošalji
          </button>
        </div>
      )}
      {showTrucks && (
        <ul className="mt-4">
          {trucks.map(truck => (
            <li key={truck.id} className="flex justify-between items-center border-b py-2">
              {truck.registracija} - {truck.datum_registracije}
              <button onClick={() => handleRemoveTruck(truck.id)} className="text-red-500 ml-2">Ukloni</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Trucks;