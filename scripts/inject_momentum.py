import re

def update_file(path, is_desktop):
    with open(path, 'r') as f:
        content = f.read()

    # Add momentum to activeTrack destructuring
    content = content.replace('const { track, stats } = activeTrack;', 'const { track, stats, momentum } = activeTrack;')
    
    # Inject Banner in BOARD tab
    banner_ui_web = """
              {activeTab === 'BOARD' && (
                <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {momentum?.isDrifting && momentum?.nudge && (
                    <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 mb-8 flex items-center justify-between shadow-sm">
                      <div>
                        <h3 className="text-rose-600 font-bold text-lg mb-1">{momentum.nudge.message}</h3>
                        <p className="text-slate-600 font-medium">{momentum.nudge.action}</p>
                      </div>
                      <button 
                        onClick={() => router.push(`/dashboard/study/youtube/${trackId}/${momentum.nudge.unitId}`)}
                        className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                      >
                        Resume for 5 mins
                      </button>
                    </div>
                  )}
    """
    banner_ui_desktop = """
              {activeTab === 'BOARD' && (
                <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {momentum?.isDrifting && momentum?.nudge && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 mb-8 flex items-center justify-between shadow-sm">
                      <div>
                        <h3 className="text-rose-400 font-bold text-lg mb-1">{momentum.nudge.message}</h3>
                        <p className="text-slate-300 font-medium">{momentum.nudge.action}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/study/${trackId}`)}
                        className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-900/50"
                      >
                        Resume for 5 mins
                      </button>
                    </div>
                  )}
    """
    
    banner = banner_ui_desktop if is_desktop else banner_ui_web
    content = content.replace("""              {activeTab === 'BOARD' && (
                <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>""", banner)

    # Inject Graph in ANALYTICS tab
    graph_ui = """
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Momentum Graph */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-full">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl"><Activity size={18} /></div>
                          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">Study Momentum</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-rose-500">{momentum?.score || 0}%</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">{momentum?.status || 'STEADY'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        {momentum?.activity?.map((day: any, idx: number) => {
                          const minutes = Math.floor(day.seconds / 60);
                          let colorClass = "bg-slate-100";
                          if (minutes > 30) colorClass = "bg-rose-500";
                          else if (minutes > 10) colorClass = "bg-rose-400";
                          else if (minutes > 0) colorClass = "bg-rose-200";
                          
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                              <div className={`w-full aspect-square rounded-md ${colorClass}`} title={`${day.date}: ${minutes} mins`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
    """
    
    graph_ui_desktop = """
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Momentum Graph */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-sm col-span-full">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl"><Activity size={18} /></div>
                          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Study Momentum</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-rose-400">{momentum?.score || 0}%</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">{momentum?.status || 'STEADY'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        {momentum?.activity?.map((day: any, idx: number) => {
                          const minutes = Math.floor(day.seconds / 60);
                          let colorClass = "bg-white/5";
                          if (minutes > 30) colorClass = "bg-rose-500";
                          else if (minutes > 10) colorClass = "bg-rose-400";
                          else if (minutes > 0) colorClass = "bg-rose-500/40";
                          
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                              <div className={`w-full aspect-square rounded-md ${colorClass}`} title={`${day.date}: ${minutes} mins`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
    """
    
    graph = graph_ui_desktop if is_desktop else graph_ui
    content = content.replace("""                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">""", graph)

    with open(path, 'w') as f:
        f.write(content)

update_file('apps/web/features/study/youtube/views/YoutubeDetailView.tsx', False)
update_file('apps/desktop/src/features/study/views/YoutubeDetailView.tsx', True)
