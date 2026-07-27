import React from 'react';
import { Heart, Activity, Moon, TrendingUp } from 'lucide-react';

interface VitalsPanelProps {
  vitals: any;
}

export const VitalsPanel: React.FC<VitalsPanelProps> = ({ vitals }) => {
  const hr = vitals?.heartRate || { current: 72, unit: 'BPM', status: 'Normal', trend: [68, 70, 74, 71, 75, 72] };
  const spo2 = vitals?.bloodOxygen || { current: 98, unit: '%', status: 'Optimal', trend: [97, 98, 98, 99, 98, 98] };
  const sleep = vitals?.sleepQuality || { current: 8.2, unit: 'hrs', status: 'Good', trend: [7.1, 7.8, 8.0, 8.5, 8.2] };

  const renderSparkline = (data: number[], color: string) => {
    if (!data || data.length === 0) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * 100;
        const y = 30 - ((val - min) / range) * 20;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 35">
        <polyline fill="none" stroke={color} strokeWidth="2.5" points={points} strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-clinical-textMuted flex items-center gap-2">
          <Activity className="w-4 h-4 text-clinical-teal" />
          <span>Real-Time Patient Vitals & Trends</span>
        </h2>
        <span className="text-[10px] text-slate-500 font-mono">Scanned 1 min ago</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Heart Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <Heart className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-slate-700">Heart Rate</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {hr.status}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-clinical-navy">{hr.current}</span>
              <span className="text-xs text-slate-500 font-medium">{hr.unit}</span>
            </div>
            <div className="w-24">{renderSparkline(hr.trend, '#E53E3E')}</div>
          </div>
        </div>

        {/* Blood Oxygen */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-clinical-teal rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Blood Oxygen (SpO2)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-clinical-teal border border-teal-200">
              {spo2.status}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-clinical-navy">{spo2.current}</span>
              <span className="text-xs text-slate-500 font-medium">{spo2.unit}</span>
            </div>
            <div className="w-24">{renderSparkline(spo2.trend, '#2C7A7B')}</div>
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Moon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Rest & Sleep</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {sleep.status}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-clinical-navy">{sleep.current}</span>
              <span className="text-xs text-slate-500 font-medium">{sleep.unit}</span>
            </div>
            <div className="w-24">{renderSparkline(sleep.trend, '#6366F1')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
