import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Stethoscope } from 'lucide-react';
import axios from 'axios';

interface IdentitySetupProps {
  user: any;
  onComplete: () => void;
}

const PRIMARY_CONCERNS = [
  'Cardiovascular',
  'Mental Wellness',
  'Metabolism',
  'Nutrition',
  'Mobility & Joints'
];

export const IdentitySetup: React.FC<IdentitySetupProps> = ({ user, onComplete }) => {
  const [age, setAge] = useState(user?.age || 32);
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState('O+ (Positive)');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(['Cardiovascular']);
  const [allergyInput, setAllergyInput] = useState('Penicillin, Peanuts');

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('medicalReport', file);
    formData.append('reportType', 'Lab Diagnostic Report');

    setUploading(true);
    setOcrMessage('');
    try {
      const res = await axios.post('/api/v1/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedFiles(prev => [...prev, res.data.report]);
      if (res.data.detectedAllergies && res.data.detectedAllergies.length > 0) {
        setOcrMessage(`OCR NER Extracted Allergies: ${res.data.detectedAllergies.join(', ')}`);
        setAllergyInput(prev => prev ? `${prev}, ${res.data.detectedAllergies.join(', ')}` : res.data.detectedAllergies.join(', '));
      } else {
        setOcrMessage('Report uploaded & OCR parsed successfully.');
      }
    } catch (err: any) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const allergiesList = allergyInput.split(',').map(a => a.trim()).filter(Boolean);
      await axios.post('/api/v1/patient/history', {
        diseases: ['Hypertension risk'],
        allergies: allergiesList,
        chronic_conditions: selectedConcerns,
        primary_concerns: selectedConcerns,
        blood_group: bloodGroup
      });
      onComplete();
    } catch (err) {
      alert('Failed to save profile setup');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-bg p-6 flex items-center justify-center">
      <div className="bg-clinical-card border border-slate-200 rounded-xl max-w-2xl w-full p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-clinical-teal p-2 rounded text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-clinical-navy">Clinical Identity & EHR Intake</h1>
              <p className="text-xs text-clinical-textMuted">Setup initial medical context for Groq diagnostic engine</p>
            </div>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded font-semibold border border-slate-300">
            Step 1 of 2
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demographic Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-clinical-textMuted uppercase mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(parseInt(e.target.value, 10))}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-clinical-textDark focus:border-clinical-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-clinical-textMuted uppercase mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-clinical-textDark focus:border-clinical-teal focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-clinical-textMuted uppercase mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-clinical-textDark focus:border-clinical-teal focus:outline-none"
              >
                <option value="O+ (Positive)">O+ (Positive)</option>
                <option value="A+ (Positive)">A+ (Positive)</option>
                <option value="B+ (Positive)">B+ (Positive)</option>
                <option value="AB+ (Positive)">AB+ (Positive)</option>
                <option value="O- (Negative)">O- (Negative)</option>
              </select>
            </div>
          </div>

          {/* Primary Concerns Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-clinical-textMuted uppercase">
              Primary Concerns (Select all applicable)
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIMARY_CONCERNS.map(concern => {
                const isSelected = selectedConcerns.includes(concern);
                return (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => toggleConcern(concern)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-clinical-teal text-white border-clinical-teal shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {concern}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Known Allergies Tag Input */}
          <div>
            <label className="block text-xs font-bold text-clinical-textMuted uppercase mb-1">
              Known Allergies (Comma separated — CRITICAL FOR DOCTOR ALERT)
            </label>
            <div className="relative">
              <input
                type="text"
                value={allergyInput}
                onChange={e => setAllergyInput(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, Latex, Shellfish"
                className="w-full border border-red-200 bg-red-50/30 rounded-lg p-2.5 text-sm text-clinical-textDark focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Upload Medical Reports Dropzone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-clinical-textMuted uppercase">
              Upload Medical Reports (PDF / DICOM / JPEG — Max 50MB)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-clinical-teal rounded-xl p-6 text-center transition-all bg-slate-50 relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dcm"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-8 h-8 text-clinical-teal mx-auto mb-2" />
              <p className="text-xs font-semibold text-clinical-navy">
                {uploading ? 'Processing OCR Text Extraction...' : 'Drag & drop medical files or click to browse'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Automatic OCR & Clinical Entity NER Parsing</p>
            </div>

            {ocrMessage && (
              <div className="bg-teal-50 border border-teal-200 text-teal-800 p-2.5 rounded text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{ocrMessage}</span>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="space-y-1 pt-2">
                {uploadedFiles.map(f => (
                  <div key={f.report_id} className="flex items-center justify-between text-xs bg-slate-100 p-2 rounded border">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <FileText className="w-4 h-4 text-clinical-teal" />
                      <span>{f.filename}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">OCR Ready</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-clinical-navy hover:bg-slate-800 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-clinical-teal" />
            <span>{saving ? 'Saving Intake Profile...' : 'Confirm Intake & Unlock Clinical Dashboard'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
