export function MapArea() {
  return (
    <div className="flex-1 bg-slate-900 border-r border-slate-700/50 flex flex-col items-center justify-center p-6">
      <div className="w-full h-full rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 flex items-center justify-center">
        
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-xl font-bold text-emerald-400 mb-2">Zone de Surveillance</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            Cartes en temps réel + détections YOLO + alertes géolocalisées
          </p>
          
          {/* Placeholder pour future implémentation Leaflet */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-slate-800 border border-slate-700 rounded p-4">
              <div className="text-2xl">🚗</div>
              <p className="text-xs text-slate-400 mt-2">Traffic Monitoring</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded p-4">
              <div className="text-2xl">🏫</div>
              <p className="text-xs text-slate-400 mt-2">School CO2</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded p-4">
              <div className="text-2xl">🏠</div>
              <p className="text-xs text-slate-400 mt-2">Home Security</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}