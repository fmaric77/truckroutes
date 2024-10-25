// app/admin/logs/page.jsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

const Logs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data);
    };

    fetchLogs();
  }, []);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-white">Admin Action Logs</h1>
        <Link legacyBehavior href="/admin">
          <a className="text-blue-400 hover:underline">Nazad</a>
        </Link>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-gray-800 text-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-700">Admin ID</th>
                <th className="py-2 px-4 border-b border-gray-700">Action</th>
                <th className="py-2 px-4 border-b border-gray-700">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="py-2 px-4 border-b border-gray-700">{log.admin_id}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{log.action}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;