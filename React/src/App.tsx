import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MapArea } from './components/MapArea';
import { AlertsSidebar } from './components/AlertsSidebar';
import { LogsTerminal } from './components/LogsTerminal';

export default function App() {
  const [alerteActive, setAlerteActive] = useState<{status: string, categorie?: string, location?: string}>({ status: "RAS" });

  useEffect(() => {
    const verifierAlertes = setInterval(() => {
      fetch('http://127.0.0.1:8000/api/status')
        .then(response => response.json())
        .then(data => {
          setAlerteActive(data);
        })
        .catch(() => console.log("En attente du serveur..."));
    }, 2000);

    return () => clearInterval(verifierAlertes);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      
      {alerteActive.status === "ALERTE" && (
        <div className="bg-red-600 py-2 px-4 text-center font-bold animate-pulse z-50 shadow-lg border-b border-white/20">
          🚨 ALERTE CRITIQUE : {alerteActive.categorie} détectée à {alerteActive.location} 🚨
        </div>
      )}

      <Header />

      <main className="flex-1 flex overflow-hidden relative z-10">
        <MapArea />
        <AlertsSidebar />
      </main>

      <LogsTerminal />
    </div>
  );
}