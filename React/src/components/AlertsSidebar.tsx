import { Alert, StatusResponse } from '../types/alert';

interface AlertsSidebarProps {
  alerts: Alert[];
  currentStatus: StatusResponse;
}

export function AlertsSidebar({ alerts, currentStatus }: AlertsSidebarProps) {
  const sortedAlerts = [...alerts].reverse().slice(0, 20); // Dernières 20
  
  const severityColor = (severity: number) => {
    if (severity <= 1) return 'bg-green-900 border-green-500';
    if (severity <= 2) return 'bg-yellow-900 border-yellow-500';
    if (severity <= 3) return 'bg-orange-900 border-orange-500';
    if (severity <= 4) return 'bg-red-900 border-red-500';
    return 'bg-red-950 border-red-700';
  };

  const domainEmoji = (domain: string) => {
    const emojis: Record<string, string> = {
      traffic: '🚗',
      school: '🏫',
      home: '🏠'
    };
    return emojis[domain] || '⚠️';
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-700/50 flex flex-col">
      
      {/* Titre */}
      <div className="border-b border-slate-700/50 px-4 py-3">
        <h2 className="text-lg font-bold text-emerald-400">📊 Alertes (Temps Réel)</h2>
        <p className="text-xs text-slate-400 mt-1">Total: {alerts.length}</p>
      </div>

      {/* Alerte critique actuelle */}
      {currentStatus.status === 'ALERTE' && (
        <div className="bg-red-900/50 border-b-2 border-red-500 px-4 py-3 animate-pulse">
          <div className="flex items-start gap-2">
            <span className="text-xl">🚨</span>
            <div className="flex-1">
              <p className="font-bold text-red-300 text-sm">{currentStatus.domain?.toUpperCase()}</p>
              <p className="text-xs text-red-200 mt-1">{currentStatus.message}</p>
              <p className="text-xs text-red-300 mt-1">Niveau: {currentStatus.severity}/5</p>
            </div>
          </div>
        </div>
      )}

      {/* Liste des alertes */}
      <div className="flex-1 overflow-y-auto">
        {sortedAlerts.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            ✅ Aucune alerte - Système normal
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {sortedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded p-3 text-sm cursor-pointer transition ${severityColor(alert.severity)} hover:opacity-80`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{domainEmoji(alert.domain)}</span>
                  <div className="flex-1">
                    <p className="font-bold text-white">{alert.category}</p>
                    <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="bg-black/30 px-2 py-1 rounded">📍 {alert.location}</span>
                      <span className="bg-black/30 px-2 py-1 rounded">🔴 Lv.{alert.severity}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(alert.timestamp).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}