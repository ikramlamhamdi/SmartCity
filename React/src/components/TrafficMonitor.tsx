import { TrafficLight } from '../types/alert';

interface TrafficMonitorProps {
  lights: TrafficLight[];
}

const STATE_STYLES: Record<string, { bg: string; label: string; emoji: string }> = {
  red:    { bg: 'bg-red-600',    label: 'ROUGE',  emoji: '🔴' },
  yellow: { bg: 'bg-yellow-500', label: 'JAUNE',  emoji: '🟡' },
  green:  { bg: 'bg-emerald-500',label: 'VERT',   emoji: '🟢' },
};

function TrafficLightWidget({ light }: { light: TrafficLight }) {
  const { bg, label, emoji } = STATE_STYLES[light.state] || STATE_STYLES['red'];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-300 truncate">{light.location}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${bg} text-white`}>
          {label}
        </span>
      </div>

      {/* Mini feu de circulation */}
      <div className="flex items-center gap-2">
        <div className="bg-slate-900 rounded p-2 flex flex-col gap-1 items-center">
          <div className={`w-4 h-4 rounded-full ${light.state === 'red'    ? 'bg-red-500'     : 'bg-slate-700'}`} />
          <div className={`w-4 h-4 rounded-full ${light.state === 'yellow' ? 'bg-yellow-400'  : 'bg-slate-700'}`} />
          <div className={`w-4 h-4 rounded-full ${light.state === 'green'  ? 'bg-emerald-400' : 'bg-slate-700'}`} />
        </div>
        <div>
          <p className="text-xl">{emoji}</p>
          <p className="text-xs text-slate-500">
            {new Date(light.last_updated).toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TrafficMonitor({ lights }: TrafficMonitorProps) {
  const counts = lights.reduce<Record<string, number>>(
    (acc, l) => ({ ...acc, [l.state]: (acc[l.state] || 0) + 1 }),
    {},
  );

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-yellow-400">🚦 Feux de circulation</h3>
        <div className="flex gap-2 text-xs">
          {Object.entries(counts).map(([state, count]) => {
            const { emoji } = STATE_STYLES[state] || {};
            return (
              <span key={state} className="text-slate-400">
                {emoji} {count}
              </span>
            );
          })}
        </div>
      </div>

      {lights.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">
          🚦 En attente des données de trafic…
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {lights.map((light) => (
            <TrafficLightWidget key={light.id} light={light} />
          ))}
        </div>
      )}
    </div>
  );
}
