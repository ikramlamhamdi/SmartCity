import { Sensor } from '../types/alert';

interface SensorPanelProps {
  sensors: Sensor[];
}

const TYPE_ICON: Record<string, string> = {
  gas:         '💨',
  environment: '🌡️',
  light:       '☀️',
  motion:      '👁️',
  distance:    '📡',
};

const STATUS_COLOR: Record<string, string> = {
  online:  'text-emerald-400',
  offline: 'text-red-400',
};

export function SensorPanel({ sensors }: SensorPanelProps) {
  const grouped = sensors.reduce<Record<string, Sensor[]>>((acc, s) => {
    (acc[s.domain] = acc[s.domain] || []).push(s);
    return acc;
  }, {});

  const DOMAIN_LABEL: Record<string, string> = {
    home:    '🏠 Maison',
    school:  '🏫 École',
    traffic: '🚗 Trafic',
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700/50 flex flex-col overflow-y-auto">
      <div className="border-b border-slate-700/50 px-4 py-3 sticky top-0 bg-slate-900 z-10">
        <h2 className="text-base font-bold text-cyan-400">📊 Capteurs en direct</h2>
        <p className="text-xs text-slate-400 mt-1">{sensors.length} capteur(s) actif(s)</p>
      </div>

      {sensors.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm px-4 text-center">
          <div>
            <div className="text-3xl mb-2">📡</div>
            <p>En attente des données capteurs…</p>
            <p className="text-xs mt-1 text-slate-600">Lancez un simulateur ou connectez un ESP32</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-3 space-y-4">
          {Object.entries(grouped).map(([domain, domainSensors]) => (
            <div key={domain}>
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                {DOMAIN_LABEL[domain] || domain}
              </p>
              <div className="space-y-2">
                {domainSensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className="bg-slate-800 border border-slate-700 rounded p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{TYPE_ICON[sensor.type] || '🔧'}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{sensor.name}</p>
                          <p className="text-xs text-slate-500">{sensor.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          {sensor.value}
                          <span className="text-xs font-normal text-slate-400 ml-1">{sensor.unit}</span>
                        </p>
                        <p className={`text-xs ${STATUS_COLOR[sensor.status]}`}>
                          ● {sensor.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
