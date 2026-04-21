import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
const LOGS = [
{
  id: 1,
  level: 'INFO',
  msg: 'System initialized successfully. All modules online.',
  time: '14:30:00.012'
},
{
  id: 2,
  level: 'INFO',
  msg: 'Establishing secure connection to satellite network...',
  time: '14:30:05.441'
},
{
  id: 3,
  level: 'INFO',
  msg: 'Connection established. Handshake verified.',
  time: '14:30:06.102'
},
{
  id: 4,
  level: 'WARN',
  msg: 'Latency spike detected on Node 4 (120ms). Compensating...',
  time: '14:31:12.883'
},
{
  id: 5,
  level: 'INFO',
  msg: 'Traffic gridlock reported on Highway 4. Rerouting automated transit.',
  time: '14:31:45.001'
},
{
  id: 6,
  level: 'CRITICAL',
  msg: 'SENSOR ALERT: Gas leak detected in Sector 7. Initiating lockdown protocol.',
  time: '14:32:01.992'
},
{
  id: 7,
  level: 'INFO',
  msg: 'Dispatching emergency services to Sector 7 coordinates.',
  time: '14:32:05.114'
},
{
  id: 8,
  level: 'WARN',
  msg: 'Power grid instability detected at Substation B.',
  time: '14:32:28.450'
},
{
  id: 9,
  level: 'CRITICAL',
  msg: 'Substation B offline. Rerouting power from Sector 9.',
  time: '14:32:45.000'
},
{
  id: 10,
  level: 'INFO',
  msg: 'Power reroute successful. Sector 7 containment holding.',
  time: '14:33:10.221'
}];

export function LogsTerminal() {
  return (
    <div className="h-56 bg-[#0a0a0a] border-t border-slate-800 flex flex-col shrink-0 relative scanline">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            System Logs // Real-time Feed
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {
              opacity: 0
            },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}>
          
          {LOGS.map((log) =>
          <motion.div
            key={log.id}
            variants={{
              hidden: {
                opacity: 0,
                y: 5
              },
              show: {
                opacity: 1,
                y: 0
              }
            }}
            className="flex gap-3 mb-1 hover:bg-white/5 px-1 -mx-1 rounded transition-colors">
            
              <span className="text-slate-600 shrink-0">[{log.time}]</span>
              <span
              className={`shrink-0 w-20 ${log.level === 'CRITICAL' ? 'text-red-500 font-bold' : log.level === 'WARN' ? 'text-amber-500' : 'text-emerald-500'}`}>
              
                [{log.level}]
              </span>
              <span className="text-slate-300 break-all">{log.msg}</span>
            </motion.div>
          )}

          {/* Blinking Cursor */}
          <div className="flex gap-3 mt-2 px-1">
            <span className="text-slate-600 shrink-0">
              [{new Date().toISOString().split('T')[1].slice(0, -1)}]
            </span>
            <span className="text-emerald-500 shrink-0 w-20">[SYS]</span>
            <span className="text-slate-300 flex items-center">
              Awaiting input
              <span className="inline-block w-2 h-3.5 bg-slate-400 ml-1 animate-pulse"></span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>);

}