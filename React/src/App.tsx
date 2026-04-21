import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MapArea } from './components/MapArea';
import { AlertsSidebar } from './components/AlertsSidebar';
import { LogsTerminal } from './components/LogsTerminal';
import { SensorPanel } from './components/SensorPanel';
import { Alert, StatusResponse, Sensor, LockStatus, TrafficLight } from './types/alert';

const API = 'http://127.0.0.1:8000';

export default function App() {
  const [status, setStatus] = useState<StatusResponse>({ status: 'RAS' });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [lockStatus, setLockStatus] = useState<LockStatus>({
    locked: true,
    method: null,
    last_action: null,
    last_updated: new Date().toISOString(),
  });
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([]);
  const [serverHealth, setServerHealth] = useState<boolean>(false);

  // ── Health check ────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`${API}/api/health`);
        setServerHealth(r.ok);
      } catch {
        setServerHealth(false);
      }
    };
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, []);

  // ── Status poll (1 s) ───────────────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/status`);
        setStatus(await r.json());
      } catch { /* serveur hors-ligne */ }
    }, 1_000);
    return () => clearInterval(id);
  }, []);

  // ── Alerts poll (2 s) ───────────────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/alerts`);
        const data = await r.json();
        setAlerts(data.alerts ?? []);
      } catch { /* ignore */ }
    }, 2_000);
    return () => clearInterval(id);
  }, []);

  // ── Sensors poll (3 s) ──────────────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/sensors`);
        const data = await r.json();
        setSensors(data.sensors ?? []);
      } catch { /* ignore */ }
    }, 3_000);
    return () => clearInterval(id);
  }, []);

  // ── Lock status poll (5 s) ──────────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/lock/status`);
        setLockStatus(await r.json());
      } catch { /* ignore */ }
    }, 5_000);
    return () => clearInterval(id);
  }, []);

  // ── Traffic lights poll (5 s) ───────────────────────
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/traffic/lights`);
        const data = await r.json();
        setTrafficLights(data.lights ?? []);
      } catch { /* ignore */ }
    }, 5_000);
    return () => clearInterval(id);
  }, []);

  // ── Derived UI state ────────────────────────────────
  const isAlertActive = status.status === 'ALERTE';
  const severityColor: Record<number, string> = {
    1: 'bg-yellow-500',
    2: 'bg-orange-500',
    3: 'bg-orange-600',
    4: 'bg-red-600',
    5: 'bg-red-700',
  };
  const bannerColor = severityColor[status.severity ?? 1] ?? 'bg-red-600';

  const domainEmoji: Record<string, string> = { traffic: '🚗', school: '🏫', home: '🏠' };
  const emoji = status.domain ? (domainEmoji[status.domain] ?? '⚠️') : '⚠️';

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 text-slate-50 font-sans">

      {/* Critical alert banner */}
      {isAlertActive && (
        <div className={`${bannerColor} py-3 px-4 text-center font-bold animate-pulse z-50 shadow-lg border-b-2 border-white/30`}>
          <div className="text-lg">🚨 ALERTE CRITIQUE 🚨</div>
          <div className="text-sm mt-1">
            {emoji} {status.domain?.toUpperCase()} • {status.category} • Niveau {status.severity}/5
          </div>
          <div className="text-base mt-1">📍 {status.location}</div>
          <div className="text-sm mt-1">{status.message}</div>
        </div>
      )}

      {/* Server health indicator */}
      {!serverHealth && (
        <div className="bg-gray-700 py-1 px-4 text-center text-xs">
          ⚠️ Serveur Flask non connecté – lancez <code>python serveur_api.py</code>
        </div>
      )}

      <Header />

      <main className="flex-1 flex overflow-hidden relative z-10 min-h-0">
        {/* Left: map / controls */}
        <MapArea
          lockStatus={lockStatus}
          trafficLights={trafficLights}
          onLockChange={(locked) =>
            setLockStatus((prev) => ({ ...prev, locked, last_updated: new Date().toISOString() }))
          }
        />

        {/* Centre: sensor panel */}
        <SensorPanel sensors={sensors} />

        {/* Right: alerts sidebar */}
        <AlertsSidebar alerts={alerts} currentStatus={status} />
      </main>

      <LogsTerminal alerts={alerts} />
    </div>
  );
}