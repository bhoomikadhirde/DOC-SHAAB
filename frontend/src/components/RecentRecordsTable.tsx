import React, { useState } from 'react';
import { FileText, Eye, CheckCircle, Download } from 'lucide-react';
import { ViewRecordModal } from './ViewRecordModal';

interface RecentRecordsTableProps {
  records: any[];
}

export const RecentRecordsTable: React.FC<RecentRecordsTableProps> = ({ records }) => {
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  return (
    <>
    <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-clinical-navy flex items-center gap-2">
            <FileText className="w-4 h-4 text-clinical-teal" />
            <span>Recent Uploaded Medical Records & Diagnostic OCR</span>
          </h2>
          <p className="text-xs text-slate-500">Encrypted PHI local storage & Tesseract OCR entity extraction</p>
        </div>
        <span className="text-xs text-clinical-teal font-semibold">
          {records.length} Documents Indexed
        </span>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
              <th className="p-3.5">Document Name</th>
              <th className="p-3.5">Report Type</th>
              <th className="p-3.5">Date Uploaded</th>
              <th className="p-3.5">OCR Text Snippet</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No records uploaded yet. Upload a PDF/JPEG medical report in setup or history.
                </td>
              </tr>
            ) : (
              records.map((doc) => (
                <tr key={doc.report_id} className="hover:bg-slate-50/80 transition-all">
                  <td className="p-3.5 font-semibold text-clinical-navy flex items-center gap-2">
                    <FileText className="w-4 h-4 text-clinical-teal shrink-0" />
                    <span>{doc.filename}</span>
                  </td>
                  <td className="p-3.5 text-slate-600">{doc.report_type}</td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(doc.date_uploaded).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-xs truncate font-mono text-[11px]">
                    {doc.snippet}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button 
                      onClick={() => setSelectedRecord(doc)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
    
    {selectedRecord && (
      <ViewRecordModal 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
      />
    )}
    </>
  );
};
