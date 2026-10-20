import { useState } from 'react';
import FormModal from './FormModal'; 

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
  const [truckInput, setTruckInput] = useState({ registracija: '', datum_registracije: '' });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);

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
    try {
      const res = await fetch('/api/kamioni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registracija, datum_registracije }),
      });
  
      if (res.ok) {
        // dohvati ažurirane podatke
        const trucksRes = await fetch('/api/kamioni');
        if (trucksRes.ok) {
          const updatedTrucks = await trucksRes.json();
          setTrucks(updatedTrucks);
          setTruckInput({ registracija: '', datum_registracije: '' });
          await logAction(`Kamion dodan: ${registracija}`, adminId, { registracija, datum_registracije });
          setErrors({});
          setOpen(false);
        }
      } else {
        const errorData = await res.json();
        if (errorData.code === 'ER_DUP_ENTRY') {
          setErrors({ submit: 'Taj kamion već postoji.' });
        } else {
          setErrors({ submit: 'Došlo je do greške prilikom dodavanja kamiona.' });
        }
      }
    } catch (error) {
      console.error('Error adding truck:', error);
      setErrors({ submit: 'Došlo je do greške prilikom dodavanja kamiona.' });
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
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setOpen(true)} className="ui-btn ui-btn-primary">Dodaj kamion</button>
      </div>
      <FormModal open={open} title="Novi kamion" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="ui-label" htmlFor="kamion-registracija">Registracija</label>
            <input
              id="kamion-registracija"
              type="text"
              value={truckInput.registracija}
              onChange={(e) => setTruckInput({ ...truckInput, registracija: e.target.value })}
              className="ui-input"
            />
            {errors.registracija && <p className="mt-1 text-sm text-rose-300">{errors.registracija}</p>}
          </div>
          <div>
            <label className="ui-label" htmlFor="kamion-datum">Datum registracije</label>
            <input
              id="kamion-datum"
              type="date"
              value={truckInput.datum_registracije}
              onChange={(e) => setTruckInput({ ...truckInput, datum_registracije: e.target.value })}
              className="ui-input"
            />
            {errors.datum_registracije && <p className="mt-1 text-sm text-rose-300">{errors.datum_registracije}</p>}
          </div>
          {errors.submit && <p className="text-sm text-rose-300">{errors.submit}</p>}
          <button type="button" onClick={handleAddTruck} className="ui-btn ui-btn-primary w-full">Spremi</button>
        </div>
      </FormModal>
      <ul className="space-y-2">
        {trucks.length === 0 && <li className="text-sm text-slate-400">Nema kamiona.</li>}
        {trucks.map(truck => (
          <li key={truck.id} className="ui-row text-sm">
            <span>
              {truck.registracija} · {formatDate(truck.datum_registracije)} · {truck.status}
              <span className="mt-0.5 block text-xs text-slate-400">
                {truck.skladiste ? `Skladište: ${truck.skladiste}` : 'Nije na skladištu'}
                {truck.rampa ? ` · Rampa ${truck.rampa}` : ''}
                {' · '}
                {truck.vozac ? `Vozač: ${truck.vozac}${truck.vozac_datum ? ` · ${truck.vozac_datum}` : ''}` : 'Nema dodijeljenog vozača'}
              </span>
              {truck.trajanje && <span className="mt-1 block text-xs text-slate-300">{truck.trajanje}</span>}
              {truck.tijek && <span className="mt-0.5 block text-xs text-slate-500">{truck.tijek}</span>}
            </span>
            <button type="button" onClick={() => handleRemoveTruck(truck.id)} className="ui-btn ui-btn-danger shrink-0 px-3 py-1 text-xs">Ukloni</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Trucks;