import { useState } from 'react';
import { FaTruck } from 'react-icons/fa'; // Assuming you have react-icons installed

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const Trucks = ({ trucks, setTrucks, adminId }) => {
  const [showTruckInput, setShowTruckInput] = useState(false);
  const [truckInput, setTruckInput] = useState({ registracija: '', datum_registracije: '' });
  const [errors, setErrors] = useState({});

  const validateTruckInput = () => {
    const newErrors = {};
    const currentDate = new Date().toISOString().split('T')[0];

    if (!truckInput.registracija) {
      newErrors.registracija = 'Registracija je obavezna.';
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
      setTruckInput({ registracija: '', datum_registracije: '' });
      await logAction(`Kamion dodan: ${registracija}`, adminId, { registracija, datum_registracije });
    }
  };

  const handleRemoveTruck = async (id) => {
    const truckToRemove = trucks.find(truck => truck.id === id);
    if (!truckToRemove) return;
  
    const isConfirmed = window.confirm('Jeste li sigurni da želite izbrisati ovaj kamion?');
    
    if (!isConfirmed) return;
  
    try {
      const res = await fetch('/api/kamioni', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
  
      if (res.status === 500) {
        setErrors({ ...errors, submit: 'Ne možete izbrisati kamion koji je na ruti.' });
        return;
      }
  
      if (res.ok) {
        setTrucks(trucks.filter(truck => truck.id !== id));
        await logAction(`Kamion uklonjen: ${truckToRemove.registracija}`, adminId, { registracija: truckToRemove.registracija });
      }
    } catch (error) {
      console.error('Error removing truck:', error);
      setErrors({ ...errors, submit: 'Došlo je do greške prilikom uklanjanja kamiona.' });
    }
  };  

  return (
    <div className="mt-8 text-center">
      <h2 className="text-xl font-bold">Kamioni</h2>
      <FaTruck 
        onClick={() => setShowTruckInput(!showTruckInput)} 
        className="text-6xl cursor-pointer mx-auto my-4" 
      />
      {showTruckInput && (
        <div className="mt-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Registracija"
            value={truckInput.registracija}
            onChange={(e) => setTruckInput({ ...truckInput, registracija: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.registracija && <p className="text-red-500">{errors.registracija}</p>}
          <input
            type="date"
            placeholder="Datum registracije"
            value={truckInput.datum_registracije}
            onChange={(e) => setTruckInput({ ...truckInput, datum_registracije: e.target.value })}
            className="border p-2 mb-2 w-full max-w-md"
            style={{ backgroundColor: 'black', color: 'white' }}
          />
          {errors.datum_registracije && <p className="text-red-500">{errors.datum_registracije}</p>}
          <button onClick={handleAddTruck} className="text-green-500 ml-2">
            Dodaj
          </button>
        </div>
      )}
      {errors.submit && <p className="text-red-500 mt-4">{errors.submit}</p>}
      {showTruckInput && (
        <ul className="mt-4">
          {trucks.map(truck => (
            <li key={truck.id} className="flex justify-between items-center border-b py-2">
              {truck.registracija} - {formatDate(truck.datum_registracije)} - {truck.status}
              <button onClick={() => handleRemoveTruck(truck.id)} className="text-red-500 ml-2">Ukloni</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Trucks;