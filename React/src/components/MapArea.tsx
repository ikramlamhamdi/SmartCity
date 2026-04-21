import React from 'react';
import { MapPin, Crosshair, Radio } from 'lucide-react';
const MARKERS = [
{
  id: 1,
  top: '25%',
  left: '35%',
  type: 'critical',
  label: 'Sector 7'
},
{
  id: 2,
  top: '45%',
  left: '60%',
  type: 'warning',
  label: 'Hwy 4'
},
{
  id: 3,
  top: '70%',
  left: '40%',
  type: 'critical',
  label: 'Power Grid B'
},
{
  id: 4,
  top: '30%',
  left: '75%',
  type: 'low',
  label: 'Port Auth'
},
{
  id: 5,
  top: '60%',
  left: '20%',
  type: 'warning',
  label: 'Water Trtmt'
},
{
  id: 6,
  top: '80%',
  left: '65%',
  type: 'low',
  label: 'Transit Hub'
}];

export function MapArea() {
  return (
    <div className="flex-1 relative bg-slate-950 overflow-hidden border-r border-slate-800">
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 bg-grid-slate-800 [background-size:40px_40px] opacity-30"></div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/50 to-slate-950 pointer-events-none"></div>

      {/* Map Content Placeholder (Abstract shapes to simulate city blocks) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[600px] border border-slate-500 rounded-full blur-3xl"></div>
        <div className="absolute w-[400px] h-[400px] border border-slate-400 rounded-full blur-2xl translate-x-32 -translate-y-16"></div>
      </div>

      {/* Crosshairs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
        <Crosshair className="w-96 h-96 text-slate-400" strokeWidth={0.5} />
      </div>

      {/* Markers */}
      {MARKERS.map((marker) =>
      <div
        key={marker.id}
        className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
        style={{
          top: marker.top,
          left: marker.left
        }}>
        
          <div className="relative flex h-6 w-6 items-center justify-center">
            <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${marker.type === 'critical' ? 'bg-red-500' : marker.type === 'warning' ? 'bg-amber-500' : 'bg-yellow-500'}`}>
          </span>
            <span
            className={`relative inline-flex rounded-full h-3 w-3 ${marker.type === 'critical' ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : marker.type === 'warning' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]'}`}>
          </span>
          </div>
          <div className="mt-2 px-2 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {marker.label}
          </div>
        </div>
      )}

      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-lg shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Radio className="w-4 h-4" /> Signal Legend
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
            <span className="text-xs text-slate-300 font-mono">
              Category A (Critical)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
            <span className="text-xs text-slate-300 font-mono">
              Category B (Warning)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
            <span className="text-xs text-slate-300 font-mono">
              Category C (Elevated)
            </span>
          </div>
        </div>
      </div>

      {/* Coordinates Overlay */}
      <div className="absolute top-6 left-6 font-mono text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800/50">
        LAT: 34.0522 N | LNG: 118.2437 W
      </div>
    </div>);

}