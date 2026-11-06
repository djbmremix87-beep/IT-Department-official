import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderKanban, Plus, Search, Tag, Eye, Trash2, Edit, XCircle, Check, 
  MapPin, Calendar, Layers, ShieldCheck, Sparkles
} from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioManagerProps {
  items: PortfolioItem[];
  onSaveItem: (item: Partial<PortfolioItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  isAdmin?: boolean;
  addNotification: (msg: string, type?: any) => void;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  isAdmin = false,
  addNotification
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingItem, setViewingItem] = useState<PortfolioItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PortfolioItem['category']>('CCTV Installation');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [image, setImage] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['all', 'CCTV Installation', 'Networking / ISP', 'Access Control', 'IT Infrastructure', 'Maintenance'];

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.clientName && item.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    // If not admin, only show published items
    return matchesCat && matchesSearch && (isAdmin || item.isPublished);
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('CCTV Installation');
    setDescription('');
    setClientName('');
    setLocation('');
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setImage('https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80');
    setTechnologies('HD CCTV, Fiber Optic, NVR 32CH');
    setIsPublished(true);
    setShowModal(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description);
    setClientName(item.clientName || '');
    setLocation(item.location || '');
    setCompletionDate(item.completionDate || '');
    setImage(item.image);
    setTechnologies(item.technologies ? item.technologies.join(', ') : '');
    setIsPublished(item.isPublished);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addNotification('Title and description are required.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const techArray = technologies.split(',').map(s => s.trim()).filter(Boolean);
      await onSaveItem({
        id: editingItem ? editingItem.id : undefined,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category,
        description,
        clientName: clientName || undefined,
        location: location || undefined,
        completionDate: completionDate || undefined,
        image: image || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
        technologies: techArray,
        isPublished
      });
      setShowModal(false);
      addNotification(editingItem ? 'Portfolio item updated!' : 'New project added to portfolio!');
    } catch (err: any) {
      addNotification('Failed to save project: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Hero / Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0b1739] p-6 rounded-2xl border border-cyan-500/15 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FolderKanban className="text-[#00f0ff]" size={24} /> IT & CCTV Project Showcase
          </h2>
          <p className="text-xs text-slate-400 mt-1">Explore our verified high-security CCTV camera deployments, fiber optic backbones, and enterprise networks</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#00f0ff] hover:bg-[#00d8ff] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-[#00f0ff]/20 transition-all"
          >
            <Plus size={16} /> Add New Project
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex items-center gap-1.5 bg-[#0b1739] p-1.5 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-[#00f0ff] text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Projects' : cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search project title, client, or technology..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b1739] border border-slate-800 focus:border-[#00f0ff] text-white text-xs rounded-xl py-2.5 pl-10 pr-4 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-[#0b1739]/50 rounded-2xl border border-slate-800">
            <FolderKanban className="mx-auto text-slate-600 mb-3" size={40} />
            <p className="text-sm font-bold text-slate-300">No project portfolio entries found</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0b1739] rounded-2xl border border-slate-800 hover:border-cyan-500/30 overflow-hidden shadow-lg flex flex-col justify-between group transition-all"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-[#00f0ff] border border-cyan-500/30 uppercase tracking-wider">
                  {item.category}
                </div>
                {!item.isPublished && (
                  <div className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                    Draft / Unpublished
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#00f0ff] transition-colors line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
                  {item.clientName && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-[#00f0ff]" />
                      <span>Client: <strong className="text-slate-200">{item.clientName}</strong></span>
                    </div>
                  )}

                  {item.technologies && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.technologies.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-900 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setViewingItem(item)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye size={14} /> View Details
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-cyan-400 hover:bg-cyan-950/40 rounded-lg transition-colors"
                        title="Edit Project"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete project '${item.title}' from portfolio?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {viewingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setViewingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0b1739] text-white w-full max-w-2xl rounded-3xl border border-cyan-500/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-slate-950">
                <img src={viewingItem.image} alt={viewingItem.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => setViewingItem(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-950/80 text-white rounded-full hover:bg-slate-900"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                <span className="text-xs font-mono font-bold text-[#00f0ff] uppercase tracking-wider">{viewingItem.category}</span>
                <h3 className="text-xl font-black text-white">{viewingItem.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{viewingItem.description}</p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
                  {viewingItem.clientName && (
                    <div>
                      <span className="text-slate-500 uppercase text-[10px]">Client / Organization</span>
                      <p className="font-bold text-white mt-0.5">{viewingItem.clientName}</p>
                    </div>
                  )}

                  {viewingItem.location && (
                    <div>
                      <span className="text-slate-500 uppercase text-[10px]">Location</span>
                      <p className="font-bold text-white mt-0.5">{viewingItem.location}</p>
                    </div>
                  )}

                  {viewingItem.completionDate && (
                    <div>
                      <span className="text-slate-500 uppercase text-[10px]">Completion Date</span>
                      <p className="font-bold text-white mt-0.5">{viewingItem.completionDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Add/Edit Project Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0b1739] text-white w-full max-w-lg rounded-3xl border border-cyan-500/20 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FolderKanban className="text-[#00f0ff]" size={20} /> {editingItem ? 'Edit Project' : 'Add Project Showcase'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Project Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#050b18] border border-slate-800 focus:border-[#00f0ff] text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full bg-[#050b18] border border-slate-800 text-white rounded-xl p-3 outline-none"
                    >
                      <option value="CCTV Installation">CCTV Installation</option>
                      <option value="Networking / ISP">Networking / ISP</option>
                      <option value="Access Control">Access Control</option>
                      <option value="IT Infrastructure">IT Infrastructure</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Client Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="w-full bg-[#050b18] border border-slate-800 focus:border-[#00f0ff] text-white rounded-xl p-3 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Banner Image URL</label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    className="w-full bg-[#050b18] border border-slate-800 focus:border-[#00f0ff] text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Project Description</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-[#050b18] border border-slate-800 focus:border-[#00f0ff] text-white rounded-xl p-3 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Technologies Used (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 4K Cameras, Fiber Optic, MikroTik Router"
                    value={technologies}
                    onChange={e => setTechnologies(e.target.value)}
                    className="w-full bg-[#050b18] border border-slate-800 focus:border-[#00f0ff] text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={e => setIsPublished(e.target.checked)}
                    className="rounded border-slate-700 text-[#00f0ff] focus:ring-[#00f0ff]"
                  />
                  <label htmlFor="isPublished" className="text-xs font-bold text-slate-300">Publish immediately to public showcase</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#00f0ff] hover:bg-[#00d8ff] text-slate-950 font-black rounded-xl uppercase tracking-wider"
                  >
                    Save Project
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
