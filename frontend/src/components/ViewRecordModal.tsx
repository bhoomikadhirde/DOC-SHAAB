import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, ShieldCheck } from 'lucide-react';

interface ViewRecordModalProps {
  record: any;
  onClose: () => void;
}

export const ViewRecordModal: React.FC<ViewRecordModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-clinical-navy/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-clinical-teal/10 text-clinical-teal rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-clinical-navy text-lg">{record.filename}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {new Date(record.date_uploaded).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 text-clinical-teal"><ShieldCheck className="w-3.5 h-3.5"/> PHI Encrypted</span>
                  <span className="px-2 py-0.5 bg-slate-200 rounded text-slate-700 font-medium">{record.report_type}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
            
            {/* Original Document Viewer */}
            {record.file_data ? (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col items-center">
                <div className="w-full bg-slate-100 border-b border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 flex justify-between">
                  <span>Original Document Preview</span>
                  <a 
                    href={`data:${record.mime_type || 'application/pdf'};base64,${record.file_data}`} 
                    download={record.filename}
                    className="text-clinical-teal hover:underline"
                  >
                    Download
                  </a>
                </div>
                {record.mime_type?.startsWith('image/') ? (
                  <img 
                    src={`data:${record.mime_type};base64,${record.file_data}`} 
                    alt="Medical Report" 
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <iframe 
                    src={`data:${record.mime_type || 'application/pdf'};base64,${record.file_data}`} 
                    className="w-full h-[60vh] border-none"
                    title="Document Viewer"
                  />
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                <p className="text-slate-500 text-sm">Original document file is not available.</p>
              </div>
            )}

            {/* OCR Extraction Results */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-clinical-navy mb-4 border-b border-slate-100 pb-2">
                Tesseract OCR Extraction Results
              </h3>
              <div className="font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {record.extracted_text || record.snippet || "No text could be extracted from this document."}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors"
            >
              Close Viewer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
