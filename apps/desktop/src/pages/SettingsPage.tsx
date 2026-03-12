import React from 'react';
import { Settings, Wrench } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="transform-gpu p-8 max-w-5xl mx-auto w-full">
      <div className="transform-gpu mb-8">
        <h1 className="transform-gpu text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="transform-gpu text-slate-400" /> Settings
        </h1>
        <p className="transform-gpu text-lg text-slate-500 mt-2">Configure your local workspace preferences.</p>
      </div>

      <div className="transform-gpu flex flex-col items-center justify-center py-20 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
        <div className="transform-gpu bg-slate-100 p-4 rounded-full mb-4">
          <Wrench size={32} className="transform-gpu text-slate-400" />
        </div>
        <h3 className="transform-gpu text-xl font-bold text-slate-900 mb-2">Settings Syncing</h3>
        <p className="transform-gpu text-slate-500 max-w-sm">Local application settings are currently being integrated. To change global account settings, please visit the web application.</p>
      </div>
    </div>
  );
}
