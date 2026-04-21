import React, { useEffect, useState } from 'react';
import { Shield, Bell, Settings, Activity } from 'lucide-react';
export function Header() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 bg-slate-900 rounded-lg border border-slate-700 shadow-[0_0_15px_rgba(30,41,59,0.5)]">
          <Shield className="w-6 h-6 text-slate-300" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-wide uppercase">
            AGIOS Control Center
          </h1>
          <p className="text-xs text-slate-500 font-mono tracking-wider">
            Tactical Overview System v2.4
          </p>
        </div>
      </div>

      {/* Center: Status */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-900/50 border border-slate-800 rounded-full">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        <span className="text-sm font-semibold text-emerald-500 tracking-widest uppercase">
          System Online
        </span>
        <Activity className="w-4 h-4 text-emerald-500 ml-2" />
      </div>

      {/* Right: Clock & Actions */}
      <div className="flex items-center gap-6">
        <div className="text-right font-mono">
          <div className="text-slate-200 font-medium tracking-wider">
            {time.toLocaleTimeString('en-US', {
              hour12: false
            })}
          </div>
          <div className="text-xs text-slate-500">
            {time.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit'
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
          <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-950"></span>
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>);

}