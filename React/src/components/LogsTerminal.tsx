import { useEffect, useRef, useState } from 'react';
import { Alert } from '../types/alert';

interface LogsTerminalProps {
  alerts: Alert[];
}

export function LogsTerminal({ alerts }: LogsTerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1];
      const logMessage = `[${new Date(latestAlert.timestamp).toLocaleTimeString('fr-FR')}] ${latestAlert.domain.toUpperCase()} > ${latestAlert.category} | ${latestAlert.message}`;
      
      setLogs(prev => [...prev.slice(-99), logMessage]);
    }
  }, [alerts]);

  useEffect(() => {
    // Auto-scroll vers le bas
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-24 bg-slate-950 border-t border-slate-700/50 flex flex-col">
      <div className="px-4 py-2 border-b border-slate-700/50">
        <p className="text-xs font-bold text-emerald-400">📡 TERMINAL LOGS</p>
      </div>
      
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs bg-black/30"
      >
        {logs.length === 0 ? (
          <p className="text-slate-500">En attente d'alertes...</p>
        ) : (
          logs.map((log, idx) => (
            <p key={idx} className="text-slate-300 whitespace-nowrap truncate">
              {log}
            </p>
          ))
        )}
      </div>
    </div>
  );
}