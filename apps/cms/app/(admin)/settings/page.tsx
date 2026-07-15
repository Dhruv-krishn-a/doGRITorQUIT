import React from "react";
import { globalSettings } from "@gritorquit/domain";
import { saveGlobalSettings } from "./actions";
import { Settings, ShieldAlert, FolderSync, WifiOff } from "lucide-react";

export const metadata = {
  title: "Global Settings | CMS Admin",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const maintenanceConf = await globalSettings.getSetting("SYSTEM_MAINTENANCE", { enabled: false });
  const syncConf = await globalSettings.getSetting("SYNC_CONFIG", { enabled: true });
  const offlineConf = await globalSettings.getSetting("OFFLINE_CONFIG", { enabled: true, defaultMaxHours: 24 });

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 md:px-0">
      <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase">Global Config</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
            System-wide Overrides & Settings
          </p>
        </div>
      </div>

      <form action={saveGlobalSettings} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        
        {/* Maintenance Mode */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-rose-100 shadow-sm overflow-hidden p-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 uppercase">Maintenance Mode</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">
                Globally disables access to the web and mobile apps.
              </p>
              
              <label className="flex items-center gap-3 cursor-pointer group w-max">
                <input type="hidden" name="maintenanceMode" value="false" />
                <input 
                  type="checkbox" 
                  name="maintenanceMode" 
                  value="true" 
                  defaultChecked={maintenanceConf.enabled}
                  className="hidden peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-checked:bg-rose-500 rounded-full transition-all flex items-center px-1.5 relative shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-7" />
                </div>
                <span className="text-sm font-bold text-slate-700 uppercase">Enable Maintenance Mode</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sync & Offline Overrides */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
          <div className="flex items-start gap-5 mb-8">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
              <FolderSync size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 uppercase">Sync Engine Defaults</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Global kill-switches for mobile and desktop sync.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-17">
             <label className="flex items-center gap-3 cursor-pointer group">
                <input type="hidden" name="syncEnabled" value="false" />
                <input 
                  type="checkbox" 
                  name="syncEnabled" 
                  value="true" 
                  defaultChecked={syncConf.enabled}
                  className="hidden peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-checked:bg-slate-900 rounded-full transition-all flex items-center px-1.5 relative">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-7" />
                </div>
                <span className="text-sm font-bold text-slate-700 uppercase">Allow Client Sync</span>
             </label>

             <label className="flex items-center gap-3 cursor-pointer group">
                <input type="hidden" name="offlineEnabled" value="false" />
                <input 
                  type="checkbox" 
                  name="offlineEnabled" 
                  value="true" 
                  defaultChecked={offlineConf.enabled}
                  className="hidden peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-checked:bg-slate-900 rounded-full transition-all flex items-center px-1.5 relative">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-7" />
                </div>
                <span className="text-sm font-bold text-slate-700 uppercase">Allow Offline Mode</span>
             </label>
          </div>

          <div className="ml-17 mt-8">
             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
               Global Default Max Offline Hours (If not specified in plan)
             </label>
             <input 
                name="defaultOfflineHours"
                type="number"
                defaultValue={offlineConf.defaultMaxHours}
                className="w-full md:w-64 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-3 text-sm font-bold outline-none"
             />
          </div>
        </div>

        <div className="flex justify-end pt-4">
           <button type="submit" className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
             Save Global Settings
           </button>
        </div>

      </form>
    </div>
  );
}
