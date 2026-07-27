import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Mail, User, Key, QrCode, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface AuthModalProps {
  onSuccess: (userData: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<'AUTH' | 'MFA'>('AUTH');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Unspecified');
  const [totpToken, setTotpToken] = useState('');

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/v1/auth/register', { name, email, password, age, gender });
      setQrCodeUrl(res.data.qrCodeUrl);
      setMfaSecret(res.data.mfaSecret);
      setStep('MFA');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOrMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/v1/auth/login', {
        email,
        password,
        token: totpToken || undefined
      });
      onSuccess(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-clinical-navy flex items-center justify-center p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="bg-clinical-slate border border-clinical-darkBorder rounded-xl max-w-md w-full p-8 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-clinical-darkBorder pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-clinical-teal" />
            <h2 className="text-xl font-bold text-white">DOC Shaab Identity Access</h2>
          </div>
          <span className="text-xs bg-clinical-teal/20 text-clinical-teal px-2 py-1 rounded font-medium">
            2FA Enforced
          </span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded text-xs">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
        {step === 'AUTH' ? (
          <motion.form 
            key="auth"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onSubmit={isRegister ? handleRegister : handleLoginOrMfaVerify} 
            className="space-y-4"
          >
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. / Patient Full Name"
                      className="w-full bg-clinical-navy border border-clinical-darkBorder rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-clinical-teal"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full bg-clinical-navy border border-clinical-darkBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-clinical-teal"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-clinical-navy border border-clinical-darkBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-clinical-teal appearance-none"
                    >
                      <option value="Unspecified">Unspecified</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@hospital.org"
                  className="w-full bg-clinical-navy border border-clinical-darkBorder rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-clinical-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-clinical-navy border border-clinical-darkBorder rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-clinical-teal"
                />
              </div>
            </div>

            {!isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  TOTP Authenticator Code (Optional if not set)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value)}
                    placeholder="6-digit TOTP code"
                    className="w-full bg-clinical-navy border border-clinical-darkBorder rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-clinical-teal"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-clinical-teal hover:bg-teal-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Proceed to TOTP MFA Setup' : 'Authenticate & Unlock'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-xs text-clinical-teal hover:underline font-medium"
              >
                {isRegister ? 'Already have a patient account? Sign In' : 'New Patient? Create Encrypted Identity'}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.form 
            key="mfa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleLoginOrMfaVerify} 
            className="space-y-4 text-center"
          >
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-clinical-teal" />
                <span>Scan Authenticator QR Code</span>
              </h3>
              <p className="text-xs text-slate-400">
                Scan with Google Authenticator or Authy, then enter the 6-digit TOTP code below.
              </p>
            </div>

            {qrCodeUrl && (
              <div className="bg-white p-3 rounded-lg w-44 h-44 mx-auto flex items-center justify-center">
                <img src={qrCodeUrl} alt="TOTP QR Code" className="w-full h-full" />
              </div>
            )}

            <p className="text-[10px] font-mono text-slate-500">Secret: {mfaSecret}</p>

            <div>
              <input
                type="text"
                required
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value)}
                placeholder="000 000"
                className="w-full bg-clinical-navy border border-clinical-darkBorder rounded-lg px-4 py-2.5 text-center tracking-widest text-lg text-white focus:outline-none focus:border-clinical-teal"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-clinical-teal hover:bg-teal-600 text-white font-semibold rounded-lg shadow transition-all"
            >
              {loading ? 'Verifying...' : 'Verify TOTP & Unlock Dashboard'}
            </button>
          </motion.form>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
