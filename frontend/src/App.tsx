import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollVideoIntro } from './components/ScrollVideoIntro';
import { AuthModal } from './components/AuthModal';
import { IdentitySetup } from './components/IdentitySetup';
import { Sidebar } from './components/Sidebar';
import { PatientHeader } from './components/PatientHeader';
import { VitalsPanel } from './components/VitalsPanel';
import { RecentRecordsTable } from './components/RecentRecordsTable';
import { AIConsultationChat } from './components/AIConsultationChat';
import { FacilityFinder } from './components/FacilityFinder';
import { ConsultationSummaryModal } from './components/ConsultationSummaryModal';
import { Sparkles, FileText } from 'lucide-react';

export function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [vitals, setVitals] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);

  const [showVideoIntro, setShowVideoIntro] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showIdentitySetup, setShowIdentitySetup] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSummary, setSelectedSummary] = useState<any>(null);

  // Check persistent JWT cookie session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get('/api/v1/auth/me');
        if (res.data.user) {
          setUser(res.data.user);
          setMedicalHistory(res.data.medicalHistory);
          setShowVideoIntro(false); // Skip intro video for existing valid session
          loadDashboardData();
        }
      } catch (err) {
        // No session -> show video intro
      } finally {
        setSessionChecked(true);
      }
    };
    checkSession();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await axios.get('/api/v1/patient/dashboard');
      setVitals(res.data.vitals);
      setRecords(res.data.recentRecords || []);
      if (res.data.medicalHistory) {
        setMedicalHistory(res.data.medicalHistory);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  const handleFinishIntro = () => {
    setShowVideoIntro(false);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuthModal(false);
    setShowIdentitySetup(true);
  };

  const handleIdentityComplete = () => {
    setShowIdentitySetup(false);
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
    } catch (e) {}
    setUser(null);
    setShowVideoIntro(true);
    setShowAuthModal(false);
    setShowIdentitySetup(false);
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-clinical-navy flex items-center justify-center text-white text-xs font-mono">
        Authenticating Encrypted Session...
      </div>
    );
  }

  // 1. Landing Experience — Scroll-Synced Video
  if (showVideoIntro && !user) {
    return <ScrollVideoIntro onFinishIntro={handleFinishIntro} />;
  }

  // 2. Auth & MFA Modal
  if (showAuthModal && !user) {
    return <AuthModal onSuccess={handleAuthSuccess} />;
  }

  // 3. Identity & Report Upload Setup
  if (showIdentitySetup && user) {
    return <IdentitySetup user={user} onComplete={handleIdentityComplete} />;
  }

  // 4. Main Clinical EHR Dashboard
  return (
    <div className="flex min-h-screen bg-clinical-bg text-clinical-textDark font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col min-w-0">
        <PatientHeader user={user} medicalHistory={medicalHistory} />

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 h-full"
            >
          {activeTab === 'dashboard' && (
            <>
              {/* Action Banner */}
              <div className="bg-gradient-to-r from-clinical-navy to-clinical-slate border border-clinical-darkBorder rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-clinical-teal">
                    Pre-Consultation Engine
                  </span>
                  <h2 className="text-lg font-bold">Start AI Clinical Pre-Consultation</h2>
                  <p className="text-xs text-slate-300">
                    Groq RAG diagnostic intake + automated doctor-ready summary output
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('ai-consult')}
                  className="px-5 py-3 bg-clinical-teal hover:bg-teal-600 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg transition-all shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start AI Consultation Intake</span>
                </button>
              </div>

              {/* Vitals Panel */}
              <VitalsPanel vitals={vitals} />

              {/* Recent Records Table */}
              <RecentRecordsTable records={records} />
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <RecentRecordsTable records={records} />
            </div>
          )}

          {activeTab === 'ai-consult' && (
            <AIConsultationChat
              user={user}
              medicalHistory={medicalHistory}
              onGenerateSummary={(sum) => setSelectedSummary(sum)}
            />
          )}

          {activeTab === 'facilities' && <FacilityFinder />}

          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl space-y-4">
              <h2 className="text-base font-bold text-clinical-navy">System & Encryption Settings</h2>
              <div className="text-xs text-slate-600 space-y-2 font-mono">
                <p>MFA Method: <strong>TOTP Authenticator App</strong></p>
                <p>Data Encryption: <strong>AES-256 (PHI Rest & Transit)</strong></p>
                <p>Audit Logging: <strong>Winston Structured Local Logs</strong></p>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Pre-Consultation Summary Modal */}
      {selectedSummary && (
        <ConsultationSummaryModal
          summary={selectedSummary}
          user={user}
          onClose={() => setSelectedSummary(null)}
        />
      )}
    </div>
  );
}
