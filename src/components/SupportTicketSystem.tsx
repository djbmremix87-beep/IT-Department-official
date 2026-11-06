import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket, Plus, Search, Filter, AlertCircle, CheckCircle2, 
  Clock, XCircle, Send, MessageSquare, Shield, User, Lock, Tag
} from 'lucide-react';
import { SupportTicket, TicketPriority, TicketStatus, TicketMessage } from '../types';

interface SupportTicketSystemProps {
  tickets: SupportTicket[];
  onCreateTicket: (ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>) => Promise<void>;
  onAddMessage: (ticketId: string, message: string, isInternalNote?: boolean) => Promise<void>;
  onUpdateStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  onAssignStaff?: (ticketId: string, staffId: string, staffName: string) => Promise<void>;
  isAdmin?: boolean;
  isStaff?: boolean;
  currentUserEmail?: string | null;
  currentUserName?: string;
  addNotification: (msg: string, type?: any) => void;
}

export const SupportTicketSystem: React.FC<SupportTicketSystemProps> = ({
  tickets,
  onCreateTicket,
  onAddMessage,
  onUpdateStatus,
  onAssignStaff,
  isAdmin = false,
  isStaff = false,
  currentUserEmail,
  currentUserName = 'User',
  addNotification
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | TicketStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'Network' | 'CCTV' | 'Billing' | 'Hardware' | 'General'>('CCTV');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState(currentUserName);
  const [clientPhone, setClientPhone] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = activeFilter === 'all' || t.status === activeFilter;
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      addNotification('Please enter subject and description.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreateTicket({
        clientName: clientName || 'Customer',
        clientPhone,
        clientEmail: currentUserEmail || undefined,
        subject,
        category,
        description,
        priority,
        status: TicketStatus.OPEN
      });
      setShowCreateModal(false);
      setSubject('');
      setDescription('');
      addNotification('Support ticket submitted successfully!');
    } catch (err: any) {
      addNotification('Failed to create ticket: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddMessage(selectedTicket.id, replyText, isInternalNote);
      setReplyText('');
      setIsInternalNote(false);
      // update local state
      const updatedMessages: TicketMessage[] = [
        ...selectedTicket.messages,
        {
          id: `msg_${Date.now()}`,
          senderId: currentUserEmail || 'user',
          senderName: currentUserName,
          senderRole: isAdmin ? 'admin' : (isStaff ? 'staff' : 'client'),
          message: replyText,
          timestamp: new Date().toISOString(),
          isInternalNote
        }
      ];
      setSelectedTicket({ ...selectedTicket, messages: updatedMessages });
      addNotification('Reply added!');
    } catch (err: any) {
      addNotification('Failed to add reply: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/40"><Clock size={12} /> Open</span>;
      case TicketStatus.IN_PROGRESS:
        return <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40"><AlertCircle size={12} /> In Progress</span>;
      case TicketStatus.RESOLVED:
        return <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40"><CheckCircle2 size={12} /> Resolved</span>;
      case TicketStatus.CLOSED:
        return <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/50"><XCircle size={12} /> Closed</span>;
    }
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case TicketPriority.URGENT:
        return <span className="text-[10px] font-black uppercase text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-800/50">Urgent</span>;
      case TicketPriority.HIGH:
        return <span className="text-[10px] font-black uppercase text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded border border-orange-800/50">High</span>;
      case TicketPriority.MEDIUM:
        return <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">Medium</span>;
      case TicketPriority.LOW:
        return <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">Low</span>;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b1739] p-6 rounded-2xl border border-cyan-500/15 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Ticket className="text-[#00f0ff]" size={24} /> Support Ticket Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">Submit technical assistance requests, ISP connectivity issues, or CCTV service tickets</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-[#00f0ff] hover:bg-[#00d8ff] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-[#00f0ff]/20 transition-all"
        >
          <Plus size={16} /> New Support Ticket
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-1 bg-[#0b1739] p-1.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          {(['all', TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED] as const).map(st => (
            <button
              key={st}
              onClick={() => setActiveFilter(st)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === st 
                  ? 'bg-[#00f0ff] text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Tickets' : st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by ticket #, subject, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b1739] border border-slate-800 focus:border-[#00f0ff] text-white text-xs rounded-xl py-2.5 pl-10 pr-4 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Ticket Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-[#0b1739]/50 rounded-2xl border border-slate-800">
            <Ticket className="mx-auto text-slate-600 mb-3" size={40} />
            <p className="text-sm font-bold text-slate-300">No support tickets found</p>
            <p className="text-xs text-slate-500 mt-1">Need help with your CCTV or Internet service? Click "New Support Ticket" above.</p>
          </div>
        ) : (
          filteredTickets.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedTicket(t)}
              className="bg-[#0b1739] hover:bg-[#101e46] p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/30 cursor-pointer transition-all flex flex-col justify-between space-y-4 group shadow-md"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-[11px] font-mono text-cyan-400 font-bold tracking-wider">{t.ticketNumber}</span>
                  <div className="flex items-center gap-1.5">
                    {getPriorityBadge(t.priority)}
                    {getStatusBadge(t.status)}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors line-clamp-1">{t.subject}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{t.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <User size={13} className="text-slate-400" /> {t.clientName}
                </span>
                <span className="flex items-center gap-1 text-[10px]">
                  <Tag size={12} className="text-[#00f0ff]" /> {t.category}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Ticket Details & Discussion Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0b1739] text-white w-full max-w-2xl rounded-3xl border border-cyan-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 bg-[#070d1e] border-b border-slate-800 flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[#00f0ff]">{selectedTicket.ticketNumber}</span>
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <h3 className="text-lg font-black text-white">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Requested by <span className="text-slate-200 font-semibold">{selectedTicket.clientName}</span> · {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Status Action Buttons (Admin/Staff) */}
              {(isAdmin || isStaff) && (
                <div className="px-6 py-3 bg-[#0a122c] border-b border-slate-800/80 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Update Status:</span>
                  {(Object.values(TicketStatus) as TicketStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(selectedTicket.id, st)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                        selectedTicket.status === st
                          ? 'bg-[#00f0ff] text-slate-950 border-[#00f0ff]'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500/50'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}

              {/* Messages & Timeline */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                {/* Initial Ticket Description */}
                <div className="bg-[#050b18] p-4 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
                  <p className="font-bold text-slate-200 mb-2 uppercase text-[10px] tracking-wider text-[#00f0ff]">Ticket Description:</p>
                  {selectedTicket.description}
                </div>

                {/* Discussion Thread */}
                {selectedTicket.messages && selectedTicket.messages.map(m => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      m.isInternalNote
                        ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                        : m.senderRole === 'admin' || m.senderRole === 'staff'
                        ? 'bg-[#101e46] border-cyan-500/30 text-white ml-6'
                        : 'bg-[#070d1e] border-slate-800 text-slate-300 mr-6'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        {m.isInternalNote && <Lock size={12} className="text-amber-400" />}
                        {m.senderName} ({m.senderRole.toUpperCase()})
                      </span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input Box */}
              <div className="p-4 bg-[#070d1e] border-t border-slate-800 space-y-3">
                {(isAdmin || isStaff) && (
                  <label className="flex items-center gap-2 text-xs font-bold text-amber-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={e => setIsInternalNote(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <Lock size={13} /> Internal Note (Staff/Admin only - hidden from client)
                  </label>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={isInternalNote ? "Write an internal staff note..." : "Write a response to ticket..."}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                    className="flex-1 bg-[#0b1739] border border-slate-800 focus:border-[#00f0ff] text-white text-xs rounded-xl px-4 py-3 outline-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={isSubmitting || !replyText.trim()}
                    className="px-5 bg-[#00f0ff] hover:bg-[#00d8ff] disabled:opacity-50 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0"
                  >
                    <Send size={15} /> Reply
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Support Ticket Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0b1739] text-white w-full max-w-lg rounded-3xl border border-cyan-500/20 shadow-2xl p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Ticket className="text-[#00f0ff]" size={20} /> Create Support Ticket
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Your Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full bg-[#050b18] border border-slate-800 focus:border-[#00f0ff] text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Issue Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full bg-[#050b18] border border-slate-800 text-white rounded-xl p-3 outline-none"
                    >
                      <option value="CCTV">CCTV Security</option>
                      <option value="Network">ISP & Networking</option>
                      <option value="Billing">Billing & Payment</option>
                      <option value="Hardware">Hardware Equipment</option>
                      <option value="General">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full bg-[#050b18] border border-slate-800 text-white rounded-xl p-3 outline-none"
                    >
                      <option value={TicketPriority.LOW}>Low</option>
                      <option value={TicketPriority.MEDIUM}>Medium</option>
                      <option value={TicketPriority.HIGH}>High</option>
                      <option value={TicketPriority.URGENT}>Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Subject / Brief Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Camera 3 offline after power outage"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-[#050b18] border border-slate-800 focus:border-[#00f0ff] text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide exact details of the technical problem or inquiry..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-[#050b18] border border-slate-800 focus:border-[#00f0ff] text-white rounded-xl p-3 outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#00f0ff] hover:bg-[#00d8ff] text-slate-950 font-black rounded-xl uppercase tracking-wider"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
