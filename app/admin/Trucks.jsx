import { useState } from 'react';

const Trucks = ({ trucks, setTrucks }) => {
  const [showTruckInput, setShowTruckInput] = useState(false);
  const [showTrucks, setShowTrucks] = useState(false);
  const [truckInput, setTruckInput] = useState({ registracija: '', datum_registracije: '' });

  const handleAddTruck = async () => {
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
    }
  };

  const handleRemoveTruck = async (id) => {
    const res = await fetch('/api/kamioni', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setTrucks(trucks.filter(truck => truck.id !== id));
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Trucks</h2>
      <button onClick={() => setShowTruckInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
        Add New Truck
      </button>
      <button onClick={() => setShowTrucks(!showTrucks)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
        {showTrucks ? 'Hide' : 'Show'} Trucks
      </button>
      {showTruckInput && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Registration"
            value={truckInput.registracija}
            onChange={(e) => setTruckInput({ ...truckInput, registracija: e.target.value })}
            className="border p-2 mr-2"
          />
          <input
            type="date"
            placeholder="Registration Date"
            value={truckInput.datum_registracije}
            onChange={(e) => setTruckInput({ ...truckInput, datum_registracije: e.target.value })}
            className="border p-2 mr-2"
          />
          <button onClick={handleAddTruck} className="bg-green-500 text-white p-2 rounded">
            Submit
          </button>
        </div>
      )}
      {showTrucks && (
        <ul className="mt-4">
          {trucks.map(truck => (
            <li key={truck.id} className="flex justify-between items-center border-b py-2">
              {truck.registracija} - {truck.datum_registracije}
              <button onClick={() => handleRemoveTruck(truck.id)} className="text-red-500 ml-2">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Trucks;