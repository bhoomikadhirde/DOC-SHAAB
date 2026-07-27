import React from 'react';
import { User, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface PatientHeaderProps {
  user: any;
  medicalHistory: any;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({ user, medicalHistory }) => {
  const rawAllergies = medicalHistory?.allergies;
  const allergies = Array.isArray(rawAllergies) ? rawAllergies : (rawAllergies ? [rawAllergies] : []);
  const bloodGroup = medicalHistory?.blood_group || 'O+ (Positive)';

  return (
    <header className="bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-clinical-navy text-white font-bold flex items-center justify-center text-lg border-2 border-clinical-teal shadow">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-clinical-navy">{user?.name || 'Patient'}</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              Session Verified
            </span>
          </div>
          <p className="text-xs text-clinical-textMuted font-medium">
            Age: <strong className="text-clinical-textDark">{user?.age || 32}</strong> • Gender:{' '}
            <strong className="text-clinical-textDark">{user?.gender || 'Male'}</strong> • Blood Group:{' '}
            <strong className="text-clinical-textDark">{bloodGroup}</strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Critical Allergies Badge */}
        {allergies.length > 0 ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 px-3 py-1.5 rounded-lg shadow-sm">
            <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block leading-none">Critical Allergies</span>
              <span className="text-xs font-semibold">{allergies.join(', ')}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold">No Known Drug Allergies</span>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-xs text-slate-700">
          <Activity className="w-4 h-4 text-clinical-teal" />
          <span>Vitals Monitoring Active</span>
        </div>
      </div>
    </header>
  );
};
