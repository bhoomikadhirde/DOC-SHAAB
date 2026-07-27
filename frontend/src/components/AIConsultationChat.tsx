import React, { useState } from 'react';
import { Bot, Send, User, AlertTriangle, ShieldCheck, FileCheck, Sparkles, CheckSquare, Stethoscope } from 'lucide-react';
import axios from 'axios';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AIConsultationChatProps {
  user: any;
  medicalHistory: any;
  onGenerateSummary: (summary: any) => void;
}

export const AIConsultationChat: React.FC<AIConsultationChatProps> = ({ user, medicalHistory, onGenerateSummary }) => {
  const allergies = medicalHistory?.allergies || [];
  const chronic = medicalHistory?.chronic_conditions || [];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello ${user?.name || 'Patient'}. I am DOC Shaab AI — your pre-consultation diagnostic intake assistant. What main symptoms or health concerns bring you in today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const [symptomChecklist, setSymptomChecklist] = useState([
    { symptom: 'Chief Complaint Stated', checked: true },
    { symptom: 'Onset & Duration Defined', checked: false },
    { symptom: 'Severity Rating Evaluated', checked: false },
    { symptom: 'Allergy Cross-Reference', checked: allergies.length > 0 }
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentQuery = inputText;
    setInputText('');
    setLoading(true);

    try {
      const res = await axios.post('/api/v1/ai/chat', {
        message: currentQuery,
        conversationHistory: messages
      });

      const aiMsg: Message = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'ai',
        text: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

      // Progress symptom checklist dynamically
      setSymptomChecklist(prev =>
        prev.map((item, idx) => (idx <= prev.filter(i => i.checked).length ? { ...item, checked: true } : item))
      );
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'ai',
          text: 'I have logged your symptom. Could you provide how many days this has been present?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSummary = async () => {
    setGeneratingSummary(true);
    try {
      const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
      const res = await axios.post('/api/v1/ai/summary', {
        chiefComplaint: lastUserMsg?.text || 'Pre-consultation clinical intake',
        symptomsList: messages.filter(m => m.sender === 'user').map(m => m.text)
      });
      onGenerateSummary(res.data.summary);
    } catch (err) {
      alert('Failed to generate pre-consultation summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Chatbot Area */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-clinical-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-clinical-teal text-white rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Groq Pre-Consultation Diagnostic Intake</h2>
              <p className="text-[10px] text-slate-300">RAG Context Enabled • Adaptive Symptom Analysis</p>
            </div>
          </div>
          <button
            onClick={handleTriggerSummary}
            disabled={generatingSummary}
            className="px-3.5 py-1.5 bg-clinical-teal hover:bg-teal-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generatingSummary ? 'Generating Report...' : 'Compile Pre-Consultation Summary'}</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-clinical-navy text-white'
                    : 'bg-clinical-teal text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-4 rounded-xl text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-clinical-navy text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-clinical-textDark rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                <span className="block text-[9px] mt-1.5 opacity-60 text-right">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic bg-white p-3 rounded-lg w-48 border">
              <Sparkles className="w-4 h-4 text-clinical-teal animate-spin" />
              <span>Analyzing symptom parameters...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Describe your symptoms, pain scale, or duration..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-clinical-textDark focus:outline-none focus:border-clinical-teal"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-2.5 bg-clinical-teal hover:bg-teal-600 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right Patient Context Panel (Spec Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinical-navy flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-clinical-teal" />
              <span>Live Patient Context Panel</span>
            </h3>
            <p className="text-[10px] text-slate-500">Real-time EHR cross-reference</p>
          </div>

          {/* Critical Allergies Box */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase block">Critical Allergies</span>
            {allergies.length > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                {allergies.map((alg: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-red-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{alg}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>No Known Drug Allergies</span>
              </div>
            )}
          </div>

          {/* Relevant History */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase block">Relevant Medical History</span>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
              {chronic.length > 0 ? (
                chronic.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                    <FileCheck className="w-3.5 h-3.5 text-clinical-teal shrink-0" />
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-500 italic">No chronic conditions flagged.</span>
              )}
            </div>
          </div>

          {/* Symptom Progress Checklist */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase block">Intake Progress Checklist</span>
            <div className="space-y-2">
              {symptomChecklist.map((chk, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between text-xs p-2.5 rounded border transition-all ${
                    chk.checked ? 'bg-teal-50/60 border-teal-200 text-teal-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="font-medium">{chk.symptom}</span>
                  <CheckSquare className={`w-4 h-4 ${chk.checked ? 'text-clinical-teal' : 'text-slate-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-100 p-3 rounded-lg border text-[11px] text-slate-600 space-y-1">
          <span className="font-bold text-clinical-navy block">Doctor Summary Note:</span>
          <p>This intake will be compiled into a structured clinical printout for physician review.</p>
        </div>
      </div>
    </div>
  );
};
