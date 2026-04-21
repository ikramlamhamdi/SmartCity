import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Clock, Siren } from 'lucide-react';
const ALERTS = [
{
  id: 'A-101',
  cat: 'A',
  title: 'Gas Leak Detected',
  loc: 'Sector 7, Industrial Zone',
  time: '14:32:01',
  desc: 'Multiple sensors triggered.'
},
{
  id: 'A-102',
  cat: 'A',
  title: 'Power Grid Failure',
  loc: 'Substation B, Downtown',
  time: '14:28:45',
  desc: 'Main transformer offline.'
},
{
  id: 'B-201',
  cat: 'B',
  title: 'Traffic Gridlock',
  loc: 'Highway 4, Northbound',
  time: '14:15:22',
  desc: 'Multi-vehicle collision reported.'
},
{
  id: 'B-202',
  cat: 'B',
  title: 'Water Pressure Drop',
  loc: 'Water Treatment Plant 2',
  time: '13:55:10',
  desc: 'Main pump malfunction.'
},
{
  id: 'C-301',
  cat: 'C',
  title: 'Unauthorized Access',
  loc: 'Port Authority, Gate 4',
  time: '13:40:05',
  desc: 'Perimeter breach detected.'
},
{
  id: 'C-302',
  cat: 'C',
  title: 'Crowd Gathering',
  loc: 'Transit Hub, Level 1',
  time: '13:12:30',
  desc: 'Exceeding standard capacity.'
},
{
  id: 'C-303',
  cat: 'C',
  title: 'Elevated Temp',
  loc: 'Server Room Alpha',
  time: '12:45:00',
  desc: 'HVAC unit 3 underperforming.'
},
{
  id: 'C-304',
  cat: 'C',
  title: 'Comms Interference',
  loc: 'Radio Tower North',
  time: '12:10:15',
  desc: 'Signal degradation detected.'
}];

const containerVariants = {
  hidden: {
    opacity: 0
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    x: 20
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};
export function AlertsSidebar() {
  return (
    <div className="w-96 bg-slate-900 flex flex-col h-full shrink-0 z-10 shadow-[-10px_0_20px_rgba(0,0,0,0.2)]">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Siren className="w-5 h-5 text-red-500 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Active Alerts
          </h2>
        </div>
        <div className="bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-500/20">
          {ALERTS.length} Total
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="show">
          
          {ALERTS.map((alert) => {
            const isCatA = alert.cat === 'A';
            const isCatB = alert.cat === 'B';
            return (
              <motion.div
                key={alert.id}
                variants={itemVariants}
                className={`relative bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-hidden group hover:border-slate-600 transition-colors cursor-pointer ${isCatA ? 'border-l-4 border-l-red-500' : isCatB ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-yellow-500'}`}>
                
                {/* Subtle background glow for Cat A */}
                {isCatA &&
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                }

                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${isCatA ? 'bg-red-500/20 text-red-400 border border-red-500/30' : isCatB ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                      
                      CAT {alert.cat}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {alert.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                    <Clock className="w-3 h-3" />
                    {alert.time}
                  </div>
                </div>

                <h3
                  className={`text-sm font-semibold mb-1 ${isCatA ? 'text-red-100' : 'text-slate-200'}`}>
                  
                  {alert.title}
                </h3>

                <div className="flex items-start gap-1.5 text-slate-400 mb-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="text-xs leading-tight">{alert.loc}</span>
                </div>

                <p className="text-xs text-slate-500 border-t border-slate-800/50 pt-2 mt-2">
                  {alert.desc}
                </p>
              </motion.div>);

          })}
        </motion.div>
      </div>
    </div>);

}