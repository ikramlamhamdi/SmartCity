import { useState } from 'react';
import { LockStatus } from '../types/alert';
import { API_BASE_URL } from '../config';

interface LockControlProps {
  lockStatus: LockStatus;
  onLockChange: (locked: boolean) => void;
}

const METHOD_ICONS: Record<string, string> = {
  keyboard: '⌨️',
  rfid:     '🪪',
  remote:   '📱',
};

export function LockControl({ lockStatus, onLockChange }: LockControlProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    const endpoint = lockStatus.locked
      ? `${API_BASE_URL}/api/lock/unlock`
      : `${API_BASE_URL}/api/lock/lock`;

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'remote' }),
      });
      if (!resp.ok) throw new Error(`Erreur serveur: ${resp.status}`);
      onLockChange(!lockStatus.locked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const methodIcon = lockStatus.method ? (METHOD_ICONS[lockStatus.method] || '🔧') : '';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-200">🚪 Contrôle d'accès</h3>
        {lockStatus.method && (
          <span className="text-xs text-slate-400">
            {methodIcon} {lockStatus.method}
          </span>
        )}
      </div>

      {/* État visuel */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`text-5xl transition-transform duration-300 ${
            lockStatus.locked ? '' : 'rotate-12'
          }`}
        >
          {lockStatus.locked ? '🔒' : '🔓'}
        </div>
        <div>
          <p
            className={`text-lg font-bold ${
              lockStatus.locked ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {lockStatus.locked ? 'VERROUILLÉ' : 'OUVERT'}
          </p>
          {lockStatus.last_updated && (
            <p className="text-xs text-slate-500">
              {new Date(lockStatus.last_updated).toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
      </div>

      {/* Bouton toggle */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-full py-2 px-4 rounded font-bold text-sm transition-colors ${
          loading
            ? 'bg-slate-600 cursor-not-allowed text-slate-400'
            : lockStatus.locked
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'bg-red-600 hover:bg-red-500 text-white'
        }`}
      >
        {loading
          ? '⏳ En cours…'
          : lockStatus.locked
          ? '🔓 Déverrouiller'
          : '🔒 Verrouiller'}
      </button>

      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">⚠️ {error}</p>
      )}

      {/* Méthodes d'accès */}
      <div className="mt-4 border-t border-slate-700 pt-3">
        <p className="text-xs text-slate-500 mb-2">Méthodes d'accès :</p>
        <div className="flex gap-2">
          {Object.entries(METHOD_ICONS).map(([method, icon]) => (
            <div
              key={method}
              className="flex-1 bg-slate-900 rounded p-2 text-center"
            >
              <div className="text-lg">{icon}</div>
              <p className="text-xs text-slate-500 mt-1 capitalize">{method}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
