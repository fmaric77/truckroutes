"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
      // Build query parameters based on filters
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/povijestputovanja?${queryParams.toString()}`);
      const data = await response.json();
      setPutovanja(data);
    };

    fetchPutovanja();
  }, [filters]);

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-center text-white">Povijest Putovanja</h1>
        <Link legacyBehavior href="/admin">
          <a className="text-blue-400 hover:underline">Nazad</a>
        </Link>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          <input
            type="text"
            name="OIB"
            value={filters.OIB}
            onChange={handleFilterChange}
            placeholder="OIB"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            name="ime_vozaca"
            value={filters.ime_vozaca}
            onChange={handleFilterChange}
            placeholder="Ime Vozača"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            name="prezime_vozaca"
            value={filters.prezime_vozaca}
            onChange={handleFilterChange}
            placeholder="Prezime Vozača"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            name="registracija"
            value={filters.registracija}
            onChange={handleFilterChange}
            placeholder="Registracija"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="text"
            name="ruta"
            value={filters.ruta}
            onChange={handleFilterChange}
            placeholder="Ruta"
            className="p-2 bg-gray-700 text-white rounded"
          />
          <input
            type="date"
            name="datum"
            value={filters.datum}
            onChange={handleFilterChange}
            className="p-2 bg-gray-700 text-white rounded"
          />
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-gray-800 text-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-700">OIB</th>
                <th className="py-2 px-4 border-b border-gray-700">Ime Vozača</th>
                <th className="py-2 px-4 border-b border-gray-700">Prezime Vozača</th>
                <th className="py-2 px-4 border-b border-gray-700">Registracija</th>
                <th className="py-2 px-4 border-b border-gray-700">Ruta</th>
                <th className="py-2 px-4 border-b border-gray-700">Datum</th>
              </tr>
            </thead>
            <tbody>
              {putovanja.map((putovanje, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="py-2 px-4 border-b border-gray-700">{putovanje.OIB}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{putovanje.ime_vozaca}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{putovanje.prezime_vozaca}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{putovanje.registracija}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{putovanje.ruta}</td>
                  <td className="py-2 px-4 border-b border-gray-700">
                    {formatDate(putovanje.datum)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PovijestPutovanja;