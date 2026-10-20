"use client";

import { useEffect, useState } from 'react';
import AdminShell from '../AdminShell';

const PovijestPutovanja = () => {
  const [putovanja, setPutovanja] = useState([]);
  const [filters, setFilters] = useState({
    OIB: '',
    ime_vozaca: '',
    prezime_vozaca: '',
    registracija: '',
    ruta: '',
    datum: '',
  });

  useEffect(() => {
    const fetchPutovanja = async () => {
      // Napravi query string iz filtera
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/povijestputovanja?${queryParams.toString()}`);
      const data = await response.json();
      setPutovanja(Array.isArray(data) ? data : []);
    };

    fetchPutovanja();
  }, [filters]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <AdminShell title="Povijest putovanja">
      {() => (
        <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <input
            type="text"
            name="OIB"
            value={filters.OIB}
            onChange={handleFilterChange}
            placeholder="OIB"
            aria-label="OIB"
            className="ui-input"
          />
          <input
            type="text"
            name="ime_vozaca"
            value={filters.ime_vozaca}
            onChange={handleFilterChange}
            placeholder="Ime vozača"
            aria-label="Ime vozača"
            className="ui-input"
          />
          <input
            type="text"
            name="prezime_vozaca"
            value={filters.prezime_vozaca}
            onChange={handleFilterChange}
            placeholder="Prezime vozača"
            aria-label="Prezime vozača"
            className="ui-input"
          />
          <input
            type="text"
            name="registracija"
            value={filters.registracija}
            onChange={handleFilterChange}
            placeholder="Registracija"
            aria-label="Registracija"
            className="ui-input"
          />
          <input
            type="text"
            name="ruta"
            value={filters.ruta}
            onChange={handleFilterChange}
            placeholder="Ruta"
            aria-label="Ruta"
            className="ui-input"
          />
          <input
            type="date"
            name="datum"
            value={filters.datum}
            onChange={handleFilterChange}
            aria-label="Datum"
            className="ui-input"
          />
        </div>

        <div className="ui-card mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">OIB</th>
                <th className="px-4 py-3 font-medium">Ime</th>
                <th className="px-4 py-3 font-medium">Prezime</th>
                <th className="px-4 py-3 font-medium">Registracija</th>
                <th className="px-4 py-3 font-medium">Ruta</th>
                <th className="px-4 py-3 font-medium">Datum</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(putovanja) && putovanja.map((putovanje, index) => (
                <tr key={index} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">{putovanje.OIB}</td>
                  <td className="px-4 py-3">{putovanje.ime_vozaca}</td>
                  <td className="px-4 py-3">{putovanje.prezime_vozaca}</td>
                  <td className="px-4 py-3 font-mono">{putovanje.registracija}</td>
                  <td className="px-4 py-3">{putovanje.ruta}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatDate(putovanje.datum)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </AdminShell>
  );
};

export default PovijestPutovanja;