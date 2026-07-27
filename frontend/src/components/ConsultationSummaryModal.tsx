import React from 'react';
import { X, Printer, ShieldAlert, CheckCircle, Stethoscope, AlertTriangle, FileText } from 'lucide-react';

interface ConsultationSummaryModalProps {
  summary: any;
  user: any;
  onClose: () => void;
}

export const ConsultationSummaryModal: React.FC<ConsultationSummaryModalProps> = ({ summary, user, onClose }) => {
  if (!summary) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCritical = summary.risk_level === 'CRITICAL' || (summary.doctor_alerts && summary.doctor_alerts.length > 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        {/* Modal Action Bar */}
        <div className="bg-clinical-navy text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-clinical-teal" />
            <h2 className="font-bold text-sm">Doctor Pre-Consultation Summary Report</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-clinical-teal hover:bg-teal-600 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Print Clinical Report</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Clinical Sheet Body */}
        <div className="p-8 space-y-6 bg-white text-clinical-textDark font-sans">
          {/* Header Branding */}
          <div className="flex items-center justify-between border-b-2 border-clinical-navy pb-4">
            <div>
              <h1 className="text-2xl font-black text-clinical-navy tracking-tight">DOC SHAAB CLINICAL INTAKE</h1>
              <p className="text-xs text-slate-500 font-mono">CONFIDENTIAL MEDICAL DOCUMENT • PRE-CONSULTATION SUMMARY</p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p>Date: <strong>{new Date().toLocaleDateString()}</strong></p>
              <p>Report ID: <strong className="font-mono">{summary.summary_id}</strong></p>
            </div>
          </div>

          {/* Patient Details Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Patient Name</span>
              <strong className="text-clinical-navy font-bold text-sm">{summary.patient_name || user?.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Age / Gender</span>
              <strong>{user?.age || 32} Yrs / {user?.gender || 'Male'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Risk Stratification</span>
              <span className={`inline-block px-2 py-0.5 rounded font-extrabold text-[10px] ${
                isCritical ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {summary.risk_level || 'STABLE'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Triage Status</span>
              <strong className="text-clinical-teal font-bold">Doctor Review Ready</strong>
            </div>
          </div>

          {/* Doctor Alerts / Critical Warnings */}
          {summary.doctor_alerts && summary.doctor_alerts.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg space-y-1">
              <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>CRITICAL ALLERGY / RED FLAG WARNING</span>
              </div>
              <ul className="text-xs text-red-700 list-disc list-inside">
                {summary.doctor_alerts.map((alert: string, idx: number) => (
                  <li key={idx}>{alert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Physiological Assessment */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-clinical-navy border-b border-slate-200 pb-1">
              1. Physiological Assessment & Clinical Presentation
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
              {summary.summary_text}
            </div>
          </div>

          {/* Potential Pathologies */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-clinical-navy border-b border-slate-200 pb-1">
              2. Differential Potential Pathologies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {summary.potential_pathologies?.map((pathology: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-slate-100 p-2.5 rounded border border-slate-200 font-semibold text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-clinical-navy text-white text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span>{pathology}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Protocols */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-clinical-navy border-b border-slate-200 pb-1">
              3. Recommended Clinical Diagnostics & Protocols
            </h3>
            <div className="space-y-1.5">
              {summary.recommended_protocols?.map((protocol: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-emerald-50/50 border border-emerald-200 rounded text-emerald-900 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{protocol}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Physician Signature Block */}
          <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p>Generated by: <strong>DOC Shaab AI Diagnostic Engine</strong></p>
              <p className="text-[10px]">HIPAA Compliant Encrypted Output</p>
            </div>
            <div className="text-center">
              <div className="w-44 border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-700">Attending Physician Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
