import React from 'react';
import { Home, FileText, Bot, MapPin, Settings, LogOut, Stethoscope } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: Home },
    { id: 'history', label: 'Medical History', icon: FileText },
    { id: 'ai-consult', label: 'AI Pre-Consultation', icon: Bot },
    { id: 'facilities', label: 'Doctor Connect & Maps', icon: MapPin },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-clinical-navy text-white flex flex-col h-screen sticky top-0 border-r border-clinical-darkBorder shrink-0">
      <div className="p-6 border-b border-clinical-darkBorder flex items-center gap-3">
        <div className="bg-clinical-teal p-2 rounded text-white shadow">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wider text-white">DOC SHAAB</h1>
          <p className="text-[10px] text-slate-400 font-mono">EHR AGGREGATOR v1.0</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-clinical-teal text-white shadow-md'
                  : 'text-slate-300 hover:bg-clinical-slate hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-clinical-darkBorder">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Lock / Log Out</span>
        </button>
      </div>
    </aside>
  );
};
