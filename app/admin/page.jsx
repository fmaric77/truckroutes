"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Trucks from './Trucks';
import Drivers from './Drivers';
import Stores from './Stores';
import Travels from './Travels';
import Route from './Rute';

const AdminPanel = () => {
  const [admin, setAdmin] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [putovanja, setPutovanja] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [stores, setStores] = useState([]);
  const [spremneRute, setSpremneRute] = useState([]);
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

        const spremneRuteRes = await fetch('/api/rute');
        if (spremneRuteRes.ok) {
          const spremneRuteData = await spremneRuteRes.json();
          setSpremneRute(spremneRuteData);
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Administratorska ploča</h1>
      <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md">
        Odjava
      </button>
      
      {admin && (
        <div>
          <p>Dobrodošli, {admin.ime}!</p>
          <p>Vaš ID: {admin.id}</p>

          {/* Upravljanje kamionima */}
          <Trucks trucks={trucks} setTrucks={setTrucks} />

          {/* Upravljanje vozačima */}
          <Drivers drivers={drivers} setDrivers={setDrivers} />

          {/* Upravljanje trgovinama */}
          <Stores stores={stores} setStores={setStores} />

          {/* Upravljanje rutama */}
          <Route routes={routes} setRoutes={setRoutes} stores={stores} />

          {/* Upravljanje putovanjima */}
          <Travels 
            putovanja={putovanja} 
            setPutovanja={setPutovanja} 
            drivers={drivers} 
            trucks={trucks} 
            spremneRute={spremneRute} 
            stores={stores} 
          />

        </div>
      )}
    </div>
  );
};

export default AdminPanel;