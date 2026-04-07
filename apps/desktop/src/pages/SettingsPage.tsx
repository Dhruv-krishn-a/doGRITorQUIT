import React from 'react';
import { Settings, Wrench } from 'lucide-react';

export default function SettingsPage() {
 return (
  <div className="p-8 max-w-5xl mx-auto w-full">
   <div className="mb-8">
    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
     <Settings className="text-slate-400" /> Settings
    </h1>
    <p className="text-lg text-slate-500 mt-2">Configure your local workspace preferences.</p>
   </div>

   <div className="flex flex-col items-center justify-center py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
    <div className="bg-slate-100 p-4 rounded-full mb-4">
     <Wrench size={32} className="text-slate-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">Settings Syncing</h3>
    <p className="text-slate-500 max-w-sm">Local application settings are currently being integrated. To change global account settings, please visit the web application.</p>
   </div>
  </div>
 );
}
