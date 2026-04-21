import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MapArea } from './components/MapArea';
import { AlertsSidebar } from './components/AlertsSidebar';
import { LogsTerminal } from './components/LogsTerminal';
import { Alert, StatusResponse } from './types/alert';

export default function App() {
  const [status, setStatus] = useState<StatusResponse>({
    status: 'RAS'
  });
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [serverHealth, setServerHealth] = useState<boolean>(false);

  // Vérifier la santé du serveur au démarrage
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/health');
        if (response.ok) {
          setServerHealth(true);
          console.log('✅ Serveur Flask connecté');
        }
      } catch (error) {
        setServerHealth(false);
        console.warn('❌ Serveur Flask non accessible');
      }
    };
    
    checkHealth();
  }, []);

  // Poll le statut actuel
  useEffect(() => {
    const statusInterval = setInterval(async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/status');
        const data: StatusResponse = await response.json();
        setStatus(data);
      } catch (error) {
        console.log('En attente du serveur...');
      }
    }, 1000);

    return () => clearInterval(statusInterval);
  }, []);

  // Poll l'historique des alertes
  useEffect(() => {
    const alertsInterval = setInterval(async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/alerts');
        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (error) {
        console.log('Erreur lors de la récupération des alertes');
      }
    }, 2000);

    return () => clearInterval(alertsInterval);
  }, []);

  // Fond rouge si alerte critique
  const isAlertActive = status.status === 'ALERTE';
  const severityColor = {
    1: 'bg-yellow-500',
    2: 'bg-orange-500',
    3: 'bg-orange-600',
    4: 'bg-red-600',
    5: 'bg-red-700'
  }[status.severity || 1];

  // Emoji par domaine
  const domainEmoji = {
    traffic: '🚗',
    school: '🏫',
    home: '🏠'
  }[status.domain || 'traffic'] || '⚠️';

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 text-slate-50 font-sans">
      
      {/* Bannière critique */}
      {isAlertActive && (
        <div className={`${severityColor} py-3 px-4 text-center font-bold animate-pulse z-50 shadow-lg border-b-2 border-white/30`}>
          <div className="text-lg">
            🚨 ALERTE CRITIQUE 🚨
          </div>
          <div className="text-sm mt-1">
            {domainEmoji} {status.domain?.toUpperCase()} • {status.category} 
            • Niveau {status.severity}/5
          </div>
          <div className="text-base mt-1">
            📍 {status.location}
          </div>
          <div className="text-sm mt-1">
            {status.message}
          </div>
        </div>
      )}

      {/* Indicateur santé serveur */}
      {!serverHealth && (
        <div className="bg-gray-700 py-1 px-4 text-center text-xs">
          ⚠️ Serveur Flask non connecté
        </div>
      )}

      <Header />

      <main className="flex-1 flex overflow-hidden relative z-10">
        <MapArea />
        <AlertsSidebar alerts={alerts} currentStatus={status} />
      </main>

      <LogsTerminal alerts={alerts} />
    </div>
  );
}