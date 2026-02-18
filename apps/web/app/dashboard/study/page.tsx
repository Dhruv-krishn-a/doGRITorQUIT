// apps/web/app/dashboard/study/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Youtube, Layers, Clock, Trash2 } from 'lucide-react';
import { DashboardOverview, DashboardData } from '@/features/study/components/DashboardOverview';
import { ConfirmDeleteModal } from '@/features/study/components/ConfirmDeleteModal';
import { CreateTrackModal } from '@/features/study/components/CreateTrackModal';
import { toast } from 'sonner';
import { Track } from '@prisma/client';

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [importing, setImporting] = useState(false);

  // State for delete confirmation
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tracksRes, dashRes] = await Promise.all([
        fetch('/api/study/tracks'),
        fetch('/api/study/dashboard')
      ]);
      const tracksData = await tracksRes.json();
      const dashData = await dashRes.json();
      
      setTracks(tracksData.tracks || []);
      setDashboard(dashData);
    } catch {
      toast.error('Failed to load study data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl) return;
    
    setImporting(true);
    try {
      const res = await fetch('/api/study/tracks/import-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success('Playlist imported successfully');
      setPlaylistUrl('');
      setShowImport(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to import playlist';
      toast.error(message);
    } finally {
      setImporting(false);
    }
  };

  const openDeleteModal = (track: Track, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTrackToDelete(track);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!trackToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/study/tracks/${trackToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");

      toast.success(`Track "${trackToDelete.title}" deleted.`);
      setTracks(currentTracks => currentTracks.filter(t => t.id !== trackToDelete.id));
      setDeleteModalOpen(false);
      setTrackToDelete(null);
    } catch {
      toast.error("Failed to delete track.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your Upgrade OS...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Upgrade OS
            <span className="text-xs font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">v2.0</span>
          </h1>
          <p className="text-slate-500 font-medium">Command center for cognitive acceleration and skill mastery.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowImport(!showImport)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-rose-600 border-2 border-rose-100 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm active:scale-95"
          >
            <Youtube size={20} />
            Import
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <Plus size={20} />
            New Track
          </button>
        </div>
      </header>

      {showImport && (
        <div className="bg-white p-8 rounded-3xl border-2 border-rose-100 shadow-2xl shadow-rose-100/20 animate-in zoom-in-95 duration-300">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
              <Youtube size={24} fill="currentColor" />
            </div>
            Import Learning Track
          </h3>
          <form onSubmit={handleImport} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Paste YouTube playlist or video URL..." 
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              disabled={importing}
            />
            <button 
              type="submit"
              disabled={importing}
              className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-rose-200 disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
            >
              {importing ? 'Syncing...' : 'Start Track'}
            </button>
          </form>
        </div>
      )}

      {dashboard && <DashboardOverview data={dashboard} />}

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <Layers size={22} className="text-rose-500" />
            Active Tracks
          </h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{tracks.length} Tracks</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tracks.map((track: Track) => (
            <Link key={track.id} href={`/dashboard/study/${track.id}`}>
              <div className="bg-white rounded-3xl border border-slate-100 p-6 hover:border-rose-200 hover:shadow-2xl shadow-sm transition-all hover:-translate-y-2 group relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-4 right-4 z-20">
                    <button 
                        onClick={(e) => openDeleteModal(track, e)}
                        className="p-2 rounded-full bg-white/50 text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="relative z-10 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                      {track.type}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                      <Clock size={14} />
                      <span>{track.totalTimeMinutes}m</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-rose-600 transition-colors leading-tight">
                    {track.title}
                  </h3>
                  
                  <div className="mt-auto space-y-4 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                        <span>Mastery</span>
                        <span className="text-slate-900">{Math.round(track.progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-white">
                        <div 
                          className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-1000 shadow-sm" 
                          style={{ width: `${track.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Confidence</span>
                        <span className="text-sm font-black text-rose-600">{track.confidenceScore.toFixed(1)}/5.0</span>
                      </div>
                      {track.targetDate && (
                        <div className="flex flex-col ml-auto text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Deadline</span>
                          <span className="text-sm font-bold text-slate-700">{new Date(track.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-rose-50/30 border-2 border-dashed border-rose-100 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-rose-300 hover:border-rose-400 hover:text-rose-500 transition-all hover:bg-rose-50 min-h-[220px] group"
          >
            <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">Add New Track</span>
          </button>
        </div>
      </section>

      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        trackTitle={trackToDelete?.title || ""}
        loading={deleting}
      />

      <CreateTrackModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchData}
      />
    </div>
  );
}
