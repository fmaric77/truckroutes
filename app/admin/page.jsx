// app/admin/page.jsx

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Trucks from './Trucks';
import Drivers from './Drivers';
import Stores from './Stores';
import Travels from './Travels';
import Route from './Rute';
import Skladista from './Skladista';
import Link from 'next/link';
import Admin from './Admin'; // Correct import for Admin component

const AdminPanel = () => {
  const [admin, setAdmin] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [putovanja, setPutovanja] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [stores, setStores] = useState([]);
  const [spremneRute, setSpremneRute] = useState([]);
  const [skladista, setSkladista] = useState([]);
  const [admins, setAdmins] = useState([]); // Add state for admins
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

        const skladistaRes = await fetch('/api/skladista');
        if (skladistaRes.ok) {
          const skladistaData = await skladistaRes.json();
          setSkladista(skladistaData);
        }

        const adminsRes = await fetch('/api/admins');
        if (adminsRes.ok) {
          const adminsData = await adminsRes.json();
          setAdmins(adminsData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem('admin');
    await logAction('Administrator se odjavio', admin.id);
    router.push('/');
  };

  const logAction = async (action, adminId) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, adminId }),
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-white">Administratorska ploča</h1>
        <button 
          onClick={handleLogout} 
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 ease-in-out"
        >
          Odjava
        </button>
        <nav className="mb-6 flex justify-end">
          <ul className="flex flex-col space-y-2">
            <li>
              <Link legacyBehavior href="/admin/logs">
                <a className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 ease-in-out">
                  📜 Povijest radnji
                </a>
              </Link>
            </li>
            {/* Add other navigation links here */}
          </ul>
        </nav>
        
        {admin && (
          <div className="mt-8">
            <p className="text-xl font-semibold text-white">Dobrodošli, {admin.ime}!</p>
            <p className="text-white mb-6">Vaš ID: {admin.id}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <Trucks trucks={trucks} setTrucks={setTrucks} adminId={admin.id}/>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <Drivers drivers={drivers} setDrivers={setDrivers} adminId={admin.id}/>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <Stores stores={stores} setStores={setStores} adminId={admin.id}/>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <Route routes={routes} setRoutes={setRoutes} stores={stores} adminId={admin.id}/>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <Skladista skladista={skladista} setSkladista={setSkladista} adminId={admin.id} />
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md">
                <Admin admins={admins} setAdmins={setAdmins} adminId={admin.id} />
              </div>
              <div className="bg-gray-700 p-4 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
                <Travels 
                  putovanja={putovanja} 
                  setPutovanja={setPutovanja} 
                  drivers={drivers} 
                  trucks={trucks} 
                  spremneRute={spremneRute} 
                  stores={stores} 
                  adminId={admin.id}
                />
              </div>

     
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;