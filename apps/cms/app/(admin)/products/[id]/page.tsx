import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cms } from "@gritorquit/domain";
import { 
  updateFeatureValue, 
  toggleProductFeature, 
  removeProductFeature, 
  createSystemFeature,
  updateProductDetailsAction
} from "../actions";
import { MarketingDetailsForm } from "./components/MarketingDetailsForm";
import { CreateFeatureForm } from "./components/CreateFeatureForm";
import { SidebarPreview } from "./components/SidebarPreview";
import { 
  ChevronLeft, Save, Trash2, Plus, 
  Zap, Lock, Gauge, CheckCircle2,
  Settings2, ShieldCheck, BarChart3, 
  BookOpen, Youtube, Layout, 
  Hammer, Sparkles, Database,
  Eye, EyeOff, FileText,
  Smartphone, Monitor, WifiOff, FolderSync
} from "lucide-react";

// ✅ CRITICAL: Force dynamic to prevent build errors
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const [product, allFeatures] = await Promise.all([
    cms.getProductDetail(id),
    cms.getAllFeatures(),
  ]);

  if (!product) notFound();

  const productId = String(product.id);
  const activeFeatures = product.productFeatures;
  const activeFeatureMap = new Map(activeFeatures.map(pf => [String(pf.feature.key), pf]));
  
  // Categorization Logic
  const categories = [
    {
      id: "core",
      title: "Core Access & Navigation",
      icon: <ShieldCheck className="text-emerald-500" size={20} />,
      description: "Control visibility of main dashboard modules and navigation links.",
      keys: [
        { key: "ACCESS_PLANS", label: "Roadmaps Feature", icon: <Layout size={16}/>, description: "Unlocks AI-driven Roadmaps within the Study page, allowing users to generate and manage complex multi-day plans." },
        { key: "ACCESS_TODAY", label: "Today View", icon: <CheckCircle2 size={16}/>, description: "Unlocks the 'Today' dashboard, giving users a unified view of their daily tasks, habits, and study modules." },
        { key: "ACCESS_HABITS", label: "Habits & Checklist", icon: <Sparkles size={16}/>, description: "Unlocks the Daily Checklist and Habit Tracker, enabling users to build and monitor daily routines." },
        { key: "ACCESS_NOTES", label: "Notes Manager", icon: <FileText size={16}/>, description: "Unlocks the rich-text Notes manager and blueprinting features." },
        { key: "ACCESS_DAILY_JOURNAL", label: "Daily Journaling", icon: <FileText size={16}/>, description: "Unlocks the ability to write and save free-form daily notes." },
        { key: "ACCESS_ANALYTICS", label: "Analytics Dashboard", icon: <BarChart3 size={16}/>, description: "Unlocks the Analytics page, providing users with detailed insights, charts, and statistics on their productivity." },
        { key: "ACCESS_ADVANCED_ANALYTICS", label: "Advanced Analytics", icon: <BarChart3 size={16}/>, description: "Unlocks deep insights, long-term trends, and burnout risk analysis algorithms." },
        { key: "THEME_CUSTOMIZATION", label: "Theme Customization", icon: <Sparkles size={16}/>, description: "Allows the user to select custom dark/light modes and colored themes." },
        { key: "ACCESS_PDF_EXPORT", label: "PDF Exporting", icon: <FileText size={16}/>, description: "Allows exporting plans, notes, and dashboards to PDF." },
      ]
    },
    {
      id: "study",
      title: "Study & Upgrade OS",
      icon: <BookOpen className="text-blue-500" size={20} />,
      description: "Manage hierarchical access to Study tracks and specific content types.",
      keys: [
        { key: "ACCESS_STUDY", label: "Upgrade OS (Main)", icon: <Zap size={16}/>, description: "The master switch for the 'Upgrade OS' section. Required to access any study-related features." },
        { key: "ACCESS_STUDY_YOUTUBE", label: "YouTube Playlists", icon: <Youtube size={16}/>, description: "Allows users to import and track progress on educational YouTube playlists." },
        { key: "ACCESS_STUDY_COURSE", label: "Course Tracker", icon: <BookOpen size={16}/>, description: "Allows users to manually track progress through structured online courses or certifications." },
        { key: "ACCESS_STUDY_PROJECT", label: "Project Tracker", icon: <Hammer size={16}/>, description: "Allows users to manage and track complex, multi-phase learning projects." },
        { key: "ACCESS_STUDY_AI_PLANNER", label: "Study AI Planner", icon: <Sparkles size={16}/>, description: "Unlocks the AI-driven study planner assistant." },
        { key: "ACCESS_SPACED_REPETITION", label: "Spaced Repetition", icon: <Zap size={16}/>, description: "Unlocks automated revision scheduling algorithms to combat the forgetting curve." },
        { key: "ACCESS_WEEKLY_REFLECTION", label: "Weekly Reflection", icon: <CheckCircle2 size={16}/>, description: "Unlocks the weekly cognitive load and mood journaling tools." },
      ]
    },
    {
      id: "sync",
      title: "Sync & Offline Architecture",
      icon: <FolderSync className="text-orange-500" size={20} />,
      description: "Control cross-platform sync capabilities and offline database features.",
      keys: [
        { key: "ACCESS_MOBILE_SYNC", label: "Mobile App Sync", icon: <Smartphone size={16}/>, description: "Allows the user to sync data with the React Native mobile application." },
        { key: "ACCESS_DESKTOP_SYNC", label: "Desktop App Sync", icon: <Monitor size={16}/>, description: "Allows the user to sync data with the Tauri desktop application." },
        { key: "ACCESS_OFFLINE_DB", label: "Offline Local Database", icon: <WifiOff size={16}/>, description: "Enables WatermelonDB local persistence for complete offline usage." },
      ]
    },
    {
      id: "limits",
      title: "Usage & AI Limits",
      icon: <Database className="text-purple-500" size={20} />,
      description: "Set quantitative limits on resources and AI generation credits.",
      isNumeric: true,
      keys: [
        { key: "AI_GEN_LIMIT", label: "Monthly AI Credits", icon: <Sparkles size={16}/>, description: "The number of times a user can invoke AI generation (e.g., creating a new plan) per month." },
        { key: "MAX_PLANS", label: "Max Active Roadmaps", icon: <Layout size={16}/>, description: "The maximum number of concurrent, unarchived roadmaps a user can have at any given time." },
        { key: "MAX_PLAN_DAYS", label: "Max Days per Roadmap", icon: <Database size={16}/>, description: "The maximum duration (in days) a single AI-generated roadmap can span." },
        { key: "MAX_HABITS_TRACKED", label: "Max Active Habits", icon: <Sparkles size={16}/>, description: "The maximum number of daily habits a user can actively track simultaneously." },
        { key: "MAX_STUDY_YOUTUBE", label: "YouTube Playlist Cap", icon: <Youtube size={16}/>, description: "The maximum number of YouTube playlists a user can actively track." },
        { key: "MAX_STUDY_COURSES", label: "Course Enrollment Cap", icon: <BookOpen size={16}/>, description: "The maximum number of active courses a user can track." },
        { key: "MAX_STUDY_PROJECTS", label: "Project Slots", icon: <Hammer size={16}/>, description: "The maximum number of active projects a user can manage." },
        { key: "MAX_VIDEOS_PER_PLAYLIST", label: "Max Videos per Playlist", icon: <Youtube size={16}/>, description: "The maximum number of videos allowed when importing a single YouTube playlist." },
        { key: "MAX_OFFLINE_DURATION_HOURS", label: "Max Offline Hours", icon: <WifiOff size={16}/>, description: "The maximum number of hours the user can stay offline before requiring a sync." },
        { key: "TOKEN_EXPIRY_HOURS", label: "JWT Token Expiry (Hours)", icon: <Lock size={16}/>, description: "The maximum lifetime of the offline authentication JWT token." },
        { key: "MAX_FILE_SIZE", label: "Max File Upload Size (MB)", icon: <Database size={16}/>, description: "The maximum allowed file size for media and document uploads in MB." },
      ]
    }
  ];

  // Identify "Other" features that are not in the standard categories
  const standardKeys = new Set(categories.flatMap(c => c.keys.map(k => k.key)));
  const otherFeatures = allFeatures.filter(f => !standardKeys.has(String(f.key)));

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
      
      {/* Header Area */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <Link href="/products" className="group inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-900 mb-6 transition-all">
          <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> BACK TO PLANS
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
               <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <Settings2 size={24} />
               </div>
               <div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
                    {String(product.name)}
                  </h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                        {String(product.key)}
                        </span>
                        <span className="text-slate-400 text-xs font-medium">Plan ID: {productId}</span>
                    </div>
                    
                    <SidebarPreview 
                        productFeatures={activeFeatures} 
                        productName={String(product.name)} 
                        tier={String(product.key)} 
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="relative z-10 text-left md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl w-full md:w-auto border border-slate-100 md:border-none">
            <div className="text-4xl font-bold text-slate-900 tracking-tighter leading-none mb-1">
              ₹{(Number(product.price) / 100).toLocaleString()}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Monthly Subscription</div>
          </div>
        </div>
      </div>

      {/* NEW: Edit Plan Marketing Details */}
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="text-rose-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">Plan Marketing Details</h2>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Controls how this plan appears on the web subscription page</p>
          </div>
          
          <MarketingDetailsForm product={product} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content: Categorized Settings */}
        <div className="lg:col-span-8 space-y-6">
          
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="px-8 py-6 border-b border-rose-100/50 bg-slate-50/30">
                <div className="flex items-center gap-3 mb-1">
                  {cat.icon}
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">{cat.title}</h2>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed ml-8">{cat.description}</p>
              </div>

              <div className="divide-y divide-rose-50/50">
                {cat.keys.map((k) => {
                  const activeFeature = activeFeatureMap.get(k.key);
                  const isEnabled = !!activeFeature;
                  const featureId = activeFeature ? String(activeFeature.feature.id) : allFeatures.find(f => f.key === k.key)?.id;
                  
                  return (
                    <div key={k.key} className="px-4 md:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 group hover:bg-rose-50/30 transition-all">
                      <div className="flex items-start md:items-center gap-4 md:gap-5">
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border ${
                          isEnabled ? 'bg-white border-rose-100 text-rose-500 group-hover:scale-110 group-hover:rotate-3' : 'bg-slate-50 border-transparent text-slate-300'
                        }`}>
                          {k.icon}
                        </div>
                        <div className="flex-1 pr-6">
                          <div className="flex items-center gap-3 mb-1">
                            <div className={`text-sm font-bold tracking-tight uppercase ${isEnabled ? 'text-slate-900' : 'text-slate-400'}`}>
                              {k.label}
                            </div>
                            <div className="text-[8px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-tighter border border-slate-200">
                              {k.key}
                            </div>
                          </div>
                          <p className={`text-[10px] leading-relaxed uppercase tracking-widest font-bold ${isEnabled ? 'text-slate-400' : 'text-slate-300'}`}>
                            {k.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pl-16 md:pl-0">
                        {/* Numeric Value Input */}
                        {cat.isNumeric && isEnabled && (
                          <form action={updateFeatureValue} className="flex items-center gap-3">
                            <input type="hidden" name="productId" value={productId} />
                            <input type="hidden" name="featureId" value={String(activeFeature?.featureId)} />
                            <div className="relative flex items-center">
                              <input 
                                name="value" 
                                type="number" 
                                defaultValue={Number((activeFeature?.value as any)?.value ?? 0)} 
                                className="w-24 bg-white border border-slate-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none transition-all shadow-sm"
                              />
                              <button className="ml-2 p-2.5 bg-slate-900 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md active:scale-90">
                                <Save size={14} />
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Toggle Logic */}
                        <form action={isEnabled ? removeProductFeature : toggleProductFeature}>
                          <input type="hidden" name="productId" value={productId} />
                          <input type="hidden" name="featureId" value={featureId ? String(featureId) : ""} />
                          <input type="hidden" name="key" value={k.key} />
                          <input type="hidden" name="description" value={k.label} />
                          
                          <button 
                            type="submit"
                            className={`relative w-14 h-7 rounded-full transition-all duration-500 flex items-center px-1.5 ${
                              isEnabled ? 'bg-slate-900 shadow-lg shadow-slate-200' : 'bg-slate-200'
                            } cursor-pointer active:scale-95 group/toggle`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-500 ${
                              isEnabled ? 'translate-x-7 scale-110' : 'translate-x-0'
                            }`} />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Other/Custom Features Section */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
             <div className="px-8 py-6 border-b border-rose-100/50 bg-slate-50/30">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Database className="text-rose-500" size={20} />
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">Extended Features</h2>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest">
                      {otherFeatures.length} Active
                   </span>
                </div>
             </div>
             
             <div className="p-8">
                {otherFeatures.length === 0 ? (
                  <div className="text-center py-10 opacity-40">
                    <Database size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No custom features found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {otherFeatures.map(f => {
                       const isEnabled = activeFeatureMap.has(String(f.key));
                       return (
                        <div key={String(f.id)} className={`p-5 rounded-[1.5rem] border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 group ${
                          isEnabled ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white border-slate-100 text-slate-600 hover:border-rose-200'
                        }`}>
                           <div className="min-w-0 pr-4 w-full">
                             <div className="text-xs font-bold truncate tracking-tight uppercase">{String(f.key)}</div>
                             <div className={`text-[9px] font-bold truncate mt-1 uppercase tracking-widest ${isEnabled ? 'text-slate-400' : 'text-slate-400'}`}>
                               {String(f.description)}
                             </div>
                           </div>
                           <form action={isEnabled ? removeProductFeature : toggleProductFeature} className="self-end md:self-auto">
                              <input type="hidden" name="productId" value={productId} />
                              <input type="hidden" name="featureId" value={String(f.id)} />
                              <button className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                                isEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 border border-transparent'
                              }`}>
                                {isEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                           </form>
                        </div>
                       );
                    })}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar: Global Actions */}
        <div className="lg:col-span-4 space-y-8 sticky top-8">
          
          <div className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/10 transition-all duration-700" />
             
             <h3 className="text-xl font-bold tracking-tight mb-2 relative z-10 flex items-center gap-2 uppercase">
                <Sparkles size={20} className="text-rose-400" />
                Tier Health
             </h3>
             <p className="text-[10px] font-bold text-slate-400 mb-8 relative z-10 leading-relaxed uppercase tracking-[0.2em]">
                Configuration snapshot for this entity.
             </p>

             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/10 transition-all hover:bg-white/10 group/item">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/item:text-slate-200 transition-colors">Active Configs</span>
                   <span className="text-2xl font-bold text-white">{activeFeatures.length}</span>
                </div>
                <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/10 transition-all hover:bg-white/10 group/item">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/item:text-slate-200 transition-colors">Access Gates</span>
                   <span className="text-2xl font-bold text-rose-400">
                      {activeFeatures.filter(f => String(f.feature.key).startsWith("ACCESS_")).length}
                   </span>
                </div>
                <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/10 transition-all hover:bg-white/10 group/item">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/item:text-slate-200 transition-colors">Usage Limits</span>
                   <span className="text-2xl font-bold text-blue-400">
                      {activeFeatures.filter(f => !String(f.feature.key).startsWith("ACCESS_")).length}
                   </span>
                </div>
             </div>

             <div className="mt-10 pt-8 border-t border-white/5">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] text-center opacity-50">
                   CMS CORE ENGINE V3.0
                </div>
             </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
             <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Plus size={16} className="text-rose-500" />
                Global Schema
             </h3>
             <CreateFeatureForm />
          </div>

        </div>
      </div>
    </div>
  );
}
