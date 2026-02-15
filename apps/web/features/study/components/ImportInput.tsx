'use client';

import { useState } from 'react';
import { importYouTubeAction } from '@/app/actions/study';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner'; 
export function ImportInput() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!url) return;
    setLoading(true);
    
    const res = await importYouTubeAction(url);
    
    if (res.success) {
      toast.success("Content added to your library");
      setUrl('');
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="relative flex items-center">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL (Video or Playlist)..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 pr-12 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleImport()}
        />
        <button
          onClick={handleImport}
          disabled={loading || !url}
          className="absolute right-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}