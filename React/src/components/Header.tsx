export function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-emerald-500/50 shadow-lg px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🛡️</div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">CityShield</h1>
            <p className="text-xs text-slate-400">Intelligence Artificielle pour la Sécurité Urbaine</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-slate-300">
            🚗 Trafic | 🏫 École | 🏠 Maison
          </p>
          <p className="text-xs text-slate-500">
            Temps réel • IA Local • Edge Computing
          </p>
        </div>
      </div>
    </header>
  );
}