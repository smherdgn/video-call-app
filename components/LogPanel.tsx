
import React from 'react';
import { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const getLogColor = (type: LogEntry['type']): string => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'success': return 'text-emerald-600';
      case 'socket': return 'text-blue-600';
      case 'webrtc': return 'text-purple-600';
      case 'info':
      default: return 'text-slate-700';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/70 shadow-inner">
      <h3 className="text-sm font-semibold px-3 py-2.5 border-b border-slate-300/60 bg-slate-500/5 text-slate-700">
        Bağlantı Günlüğü
      </h3>
      <div className="flex-grow p-3 space-y-1.5 overflow-y-auto text-xs custom-scrollbar">
        {logs.length === 0 && <p className="text-slate-500 italic p-2">Henüz günlük kaydı yok.</p>}
        {logs.map((log) => (
          <div key={log.id} className={`flex items-start ${getLogColor(log.type)}`}>
            <span className="font-mono text-slate-400 mr-1.5 whitespace-nowrap select-none">
              [{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
            </span>
            <span className="flex-1 break-words leading-snug">{log.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(203, 213, 225, 0.3); /* slate-300 with opacity */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.6); /* slate-400 with opacity */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7); /* slate-500 with opacity */
        }
      `}</style>
    </div>
  );
};

export default LogPanel;