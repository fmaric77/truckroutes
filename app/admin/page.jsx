"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Trucks from './Trucks';
import Drivers from './Drivers';
import Stores from './Stores';

const AdminPanel = () => {
  const [admin, setAdmin] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [putovanja, setPutovanja] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [stores, setStores] = useState([]);
  const [showRouteInput, setShowRouteInput] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showPutovanja, setShowPutovanja] = useState(false);
  const [routeInput, setRouteInput] = useState({ opis: '', selectedStores: [''] });
  const router = useRouter();

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (!storedAdmin) {
      router.push('/'); // Redirect to login if no admin is stored
    } else {
      setAdmin(JSON.parse(storedAdmin));
    }

    const fetchData = async () => {
      try {
        const routesRes = await fetch('/api/rute');
        if (routesRes.ok) {
          const routesData = await routesRes.json();
          setRoutes(routesData);
        }

        const putovanjaRes = await fetch('/api/putovanja');
        if (putovanjaRes.ok) {
          const putovanjaData = await putovanjaRes.json();
          setPutovanja(putovanjaData);
        }

        const driversRes = await fetch('/api/vozaci');
        if (driversRes.ok) {
          const driversData = await driversRes.json();
          setDrivers(driversData);
        }

        const trucksRes = await fetch('/api/kamioni');
        if (trucksRes.ok) {
          const trucksData = await trucksRes.json();
          setTrucks(trucksData);
        }

        const storesRes = await fetch('/api/trgovine');
        if (storesRes.ok) {
          const storesData = await storesRes.json();
          setStores(storesData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/');
  };
  const handleAddRoute = async () => {
    const { opis, selectedStores } = routeInput;
    const res = await fetch('/api/rute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedStores, opis }),
    });
    if (res.ok) {
      const newRoute = await res.json();
      setRoutes([...routes, newRoute]);
      setShowRouteInput(false);
      setRouteInput({ opis: '', selectedStores: [''] });
    }
  };

  const handleAddStoreField = () => {
    setRouteInput({
      ...routeInput,
      selectedStores: [...routeInput.selectedStores, ''],
    });
  };

  const handleRemoveStoreField = (index) => {
    const newSelectedStores = routeInput.selectedStores.filter((_, i) => i !== index);
    setRouteInput({
      ...routeInput,
      selectedStores: newSelectedStores,
    });
  };

  const handleStoreChange = (index, value) => {
    const newSelectedStores = routeInput.selectedStores.map((store, i) => (i === index ? value : store));
    setRouteInput({
      ...routeInput,
      selectedStores: newSelectedStores,
    });
  };

  const handleRemoveRoute = async (id) => {
    const res = await fetch('/api/rute', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setRoutes(routes.filter(route => route.id !== id));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Administrator Panel</h1>
      <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md">
        Logout
      </button>
      
      {admin && (
        <div>
          <p>Welcome, {admin.ime}!</p>
          <p>Your ID: {admin.id}</p>

          {/* Trucks management */}
          <Trucks trucks={trucks} setTrucks={setTrucks} />

          {/* Drivers management */}
          <Drivers drivers={drivers} setDrivers={setDrivers} />

          {/* Stores management */}
          <Stores stores={stores} setStores={setStores} />

          {/* Routes management */}
          <div className="mt-8">
            <h2 className="text-xl font-bold">Routes</h2>
            <button onClick={() => setShowRouteInput(true)} className="bg-blue-500 text-white p-2 mt-2 rounded">
              Add New Route
            </button>
            <button onClick={() => setShowRoutes(!showRoutes)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
              {showRoutes ? 'Hide' : 'Show'} Routes
            </button>
            {showRouteInput && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={routeInput.opis}
                  onChange={(e) => setRouteInput({ ...routeInput, opis: e.target.value })}
                  className="border p-2 mr-2"
                />
                {routeInput.selectedStores.map((store, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <select
                      value={store}
                      onChange={(e) => handleStoreChange(index, e.target.value)}
                      className="border p-2 mr-2 bg-black text-white"
                    >
                      <option value="">Select Store</option>
                      {stores.map(store => (
                        <option key={store.id} value={store.id}>
                          {store.ime_trgovine}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => handleRemoveStoreField(index)} className="bg-red-500 text-white p-2 rounded">
                      Remove
                    </button>
                  </div>
                ))}
                <button onClick={handleAddStoreField} className="bg-green-500 text-white p-2 rounded">
                  Add Store
                </button>
                <button onClick={handleAddRoute} className="bg-green-500 text-white p-2 rounded ml-2">
                  Submit
                </button>
              </div>
            )}
            {showRoutes && (
              <ul className="mt-4">
                {routes.map(route => (
                  <li key={route.id} className="flex justify-between items-center border-b py-2">
                    {route.ruta.split(', ').map(storeId => {
                      const store = stores.find(s => s.id === storeId);
                      return store ? `${store.ime_trgovine} - ${store.adresa}` : storeId;
                    }).join(', ')} - {route.opis || 'No description'}
                    <button onClick={() => handleRemoveRoute(route.id)} className="text-red-500 ml-2">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Putovanja management */}
          <div className="mt-8">
            <h2 className="text-xl font-bold">Putovanja</h2>
            <button onClick={() => handleAddPutovanje('2024-01-01', 1, 1, 'Route A')} className="bg-blue-500 text-white p-2 mt-2 rounded">
              Add New Putovanje
            </button>
            <button onClick={() => setShowPutovanja(!showPutovanja)} className="bg-blue-500 text-white p-2 mt-2 rounded ml-2">
              {showPutovanja ? 'Hide' : 'Show'} Putovanja
            </button>
            {showPutovanja && (
              <ul className="mt-4">
                {putovanja.map(p => (
                  <li key={p.id} className="flex justify-between items-center border-b py-2">
                    {p.datum} - {p.vozac_id} - {p.kamion_id} - {p.ruta}
                    <button onClick={() => handleUpdatePutovanje(p.id, '2024-01-02', p.vozac_id, p.kamion_id, p.ruta)} className="text-yellow-500 ml-2">Update</button>
                    <button onClick={() => handleRemovePutovanje(p.id)} className="text-red-500 ml-2">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminPanel;