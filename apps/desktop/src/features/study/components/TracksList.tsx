import { useEffect, useState, useCallback } from 'react';
import { Plus, Layers, Clock, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';
import { toast } from 'sonner';

interface Track {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  progressPercentage: number;
  totalTimeMinutes: number;
  confidenceScore: number;
  targetDate: string;
}

export function TracksList() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await api.get('/api/study/tracks');
      setTracks(data.tracks || []);
    } catch (error: any) {
      toast.error('Failed to load study data: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-rose-500" />
      <p className="text-slate-500 font-bold animate-pulse">Synchronizing with command center...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Active Tracks
            <span className="text-xs font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">DESKTOP</span>
          </h2>
          <p className="text-slate-500 font-medium">Your cognitive acceleration journey.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95">
          <Plus size={20} />
          New Track
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tracks.map((track) => (
          <div key={track.id} className="bg-white rounded-3xl border border-slate-100 p-6 hover:border-rose-200 hover:shadow-2xl shadow-sm transition-all hover:-translate-y-2 group relative overflow-hidden flex flex-col min-h-[220px]">
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
              </div>
            </div>
          </div>
        ))}
        {tracks.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <Layers size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-lg">No active tracks found.</p>
            <p className="text-sm">Start a new track to begin your mastery journey.</p>
          </div>
        )}
      </div>
    </div>
  );
}
