import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Search, Filter, Clock, User, FileText, Database } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'Admin' | 'Staff' | 'User'>('all');

  const filteredLogs = logs.filter(log => {
    const matchesRole = filterRole === 'all' || log.actorRole === filterRole;
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetCollection && log.targetCollection.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b1739] p-6 rounded-2xl border border-cyan-500/15 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-[#00f0ff]" size={24} /> System Audit Trail & Event Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time immutable tracking of administrative actions, financial payments, client record updates, and system configuration changes</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-1.5 bg-[#0b1739] p-1.5 rounded-xl border border-slate-800">
          {(['all', 'Admin', 'Staff', 'User'] as const).map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                filterRole === role 
                  ? 'bg-[#00f0ff] text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search action, actor name, target, details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b1739] border border-slate-800 focus:border-[#00f0ff] text-white text-xs rounded-xl py-2.5 pl-10 pr-4 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0b1739] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#070d1e] text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Collection</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No audit log records found. Administrative actions will be automatically logged here.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#00f0ff]" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-slate-400" />
                        <span className="font-bold text-slate-200">{log.actorName}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          log.actorRole === 'Admin' 
                            ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {log.actorRole}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold text-[#00f0ff]">{log.action}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-slate-400">
                      {log.targetCollection ? (
                        <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          <Database size={11} className="text-cyan-400" /> {log.targetCollection}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
