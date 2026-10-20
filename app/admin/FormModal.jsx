"use client";

import { useEffect } from 'react';

export default function FormModal({ open, title, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Zatvori" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
        className={`ui-card relative z-10 max-h-[90vh] w-full overflow-y-auto p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 id="form-modal-title" className="text-xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="ui-btn px-3 py-1 text-xs">Zatvori</button>
        </div>
        {children}
      </div>
    </div>
  );
}
