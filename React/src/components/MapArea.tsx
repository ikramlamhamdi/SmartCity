import { LockControl } from './LockControl';
import { TrafficMonitor } from './TrafficMonitor';
import { LockStatus, TrafficLight } from '../types/alert';

interface MapAreaProps {
  lockStatus: LockStatus;
  trafficLights: TrafficLight[];
  onLockChange: (locked: boolean) => void;
}

export function MapArea({ lockStatus, trafficLights, onLockChange }: MapAreaProps) {
  return (
    <div className="flex-1 bg-slate-900 border-r border-slate-700/50 flex flex-col p-4 gap-4 overflow-y-auto">

      {/* Title row */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🗺️</span>
        <div>
          <h2 className="text-base font-bold text-emerald-400">Zone de Surveillance</h2>
          <p className="text-xs text-slate-500">Contrôle en temps réel · Smart Home · School · Traffic</p>
        </div>
      </div>

      {/* Domain overview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '🚗', label: 'Trafic',  sub: 'Caméra YOLO · Accidents · Feux' },
          { icon: '🏫', label: 'École',   sub: 'CO₂ · Accès · Urgence' },
          { icon: '🏠', label: 'Maison',  sub: 'Gaz · Mouvement · Éclairage' },
        ].map(({ icon, label, sub }) => (
          <div
            key={label}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center"
          >
            <div className="text-3xl mb-1">{icon}</div>
            <p className="text-sm font-semibold text-slate-200">{label}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Lock control */}
      <LockControl lockStatus={lockStatus} onLockChange={onLockChange} />

      {/* Traffic lights */}
      <TrafficMonitor lights={trafficLights} />

      {/* Hardware reference */}
      <div className="bg-slate-800 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase">Modules matériels</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          {[
            ['ESP32', 'Microcontrôleur principal'],
            ['MQ-2 / MQ-135 / MQ-131', 'Gaz & incendie'],
            ['HC-SR501 PIR', 'Détection de mouvement'],
            ['LDR 3/5/10 mm', 'Luminosité + relais 5V'],
            ['DHT22', 'Température & humidité'],
            ['RFID-RC522', 'Contrôle d\'accès carte'],
            ['HC-SR04', 'Capteur ultrasonique'],
            ['JDY-31 / HC-05 / HC-06', 'Modules Bluetooth'],
            ['LCD I²C 1602', 'Affichage local'],
            ['SG90 Servo', 'Mécanisme de porte'],
          ].map(([hw, desc]) => (
            <div key={hw} className="flex gap-1">
              <span className="text-emerald-500 shrink-0">▸</span>
              <span>
                <span className="text-slate-300 font-medium">{hw}</span>
                {' – '}
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}