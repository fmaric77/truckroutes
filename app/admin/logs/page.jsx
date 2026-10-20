// app/admin/logs/page.jsx
"use client";

import { useEffect, useState } from 'react';
import AdminShell from '../AdminShell';

const Logs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    };

    fetchLogs();
  }, []);

  return (
    <AdminShell title="Povijest radnji" logsLink={false}>
      {() => (
        <div className="ui-card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Administrator</th>
                <th className="px-4 py-3 font-medium">Radnja</th>
                <th className="px-4 py-3 font-medium">Vrijeme</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(logs) && logs.map((log, index) => (
                <tr key={index} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">{log.admin_id}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-slate-300">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
};

export default Logs;