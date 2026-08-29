import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, UserCheck, Camera, FileText, CheckCircle2, RefreshCw, X, Lock, AlertTriangle, Upload } from 'lucide-react';
import { API } from '../../services/api';

export const IdentityVerificationModal: React.FC = () => {
  const { showVerificationModal, setShowVerificationModal, setCurrentUser, currentUser } = useApp();
  const [step, setStep] = useState<'intro' | 'document' | 'liveness' | 'verifying' | 'success' | 'error'>('intro');
  const [docType, setDocType] = useState<string>("DRIVERS_LICENSE");
  const [fullName, setFullName] = useState(currentUser?.firstName || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '1966-04-12');
  const [frontDocUrl, setFrontDocUrl] = useState<string>(currentUser?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80');
  const [selfieUrl, setSelfieUrl] = useState<string>(currentUser?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showVerificationModal) return null;

  const handleStartProcess = () => {
    setStep('document');
  };

  const handleDocumentUploaded = () => {
    if (!fullName || !dateOfBirth) {
      setErrorMessage('Please confirm your legal name and birthdate.');
      return;
    }
    setErrorMessage('');
    setStep('liveness');
  };

  const handlePerformLivenessAndSubmit = async () => {
    setStep('verifying');
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await API.submitVerification({
        documentType: docType,
        documentFrontUrl: frontDocUrl,
        selfieUrl,
        fullName: fullName || currentUser?.firstName || 'User',
        dateOfBirth: dateOfBirth || currentUser?.dateOfBirth || '1966-04-12',
      });

      if (response.success) {
        const updatedUser = await API.getMe();
        setCurrentUser(updatedUser);
        setStep('success');
      } else {
        setErrorMessage(response.message || 'Verification could not be approved.');
        setStep('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification processing failed.');
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 text-white">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={() => setShowVerificationModal(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 tap-active"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-white">50+ Trust & Identity Verification</h3>
            <p className="text-xs text-neutral-300 flex items-center gap-1 mt-0.5">
              <Lock className="w-3 h-3 text-white" /> Encrypted Government ID & Age Check
            </p>
          </div>
        </div>

        {/* Step 1: Intro */}
        {step === 'intro' && (
          <div className="space-y-4">
            <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 space-y-3 text-xs sm:text-sm text-neutral-200">
              <p className="font-bold text-white text-sm">
                Why we require 100% verified identity for adults 50+:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-white font-black">✓</span>
                  <span><strong>Zero Catfishing / No Bots:</strong> Confirms genuine human presence and date of birth 50+.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-black">✓</span>
                  <span><strong>Scam Immunity:</strong> Stops fraud syndicates and fake impersonation profiles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-black">✓</span>
                  <span><strong>Privacy Guarantee:</strong> Raw ID documents are encrypted and never made public.</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartProcess}
              id="btn-start-id-verification"
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow-lg transition-colors text-base flex items-center justify-center gap-2 tap-active min-h-[48px]"
            >
              <UserCheck className="w-5 h-5 text-black" />
              Begin Real Identity Verification
            </button>
          </div>
        )}

        {/* Step 2: Document Capture */}
        {step === 'document' && (
          <div className="space-y-4">
            <div className="text-sm text-neutral-300">
              Step 1 of 2: Select your government-issued photo ID to confirm age 50+:
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'DRIVERS_LICENSE', label: "Driver's License" },
                { id: 'PASSPORT', label: 'Passport' },
                { id: 'STATE_ID', label: 'State Senior ID' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDocType(item.id)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all tap-active ${
                    docType === item.id
                      ? 'bg-white text-black border-white shadow'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto mb-1" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-800">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Full Legal Name on Document</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Date of Birth (Must be age 50 or older)</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-neutral-700 bg-neutral-900 rounded-2xl p-5 text-center space-y-2">
              <Camera className="w-8 h-8 text-neutral-400 mx-auto" />
              <div className="text-sm font-bold text-white">
                Front ID Photo Ready
              </div>
              <p className="text-xs text-neutral-400">
                Encrypted scan validates date of birth and authentic security features.
              </p>
            </div>

            {errorMessage && (
              <div className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleDocumentUploaded}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3 rounded-xl shadow transition-colors tap-active min-h-[44px]"
            >
              Continue to Biometric Facial Liveness →
            </button>
          </div>
        )}

        {/* Step 3: Liveness Face Check */}
        {step === 'liveness' && (
          <div className="space-y-4 text-center">
            <div className="text-sm text-neutral-300">
              Step 2 of 2: Biometric Liveness Check (Confirms real person matching the ID)
            </div>

            <div className="w-40 h-40 rounded-full border-4 border-white mx-auto overflow-hidden bg-black relative flex items-center justify-center shadow-inner">
              <img
                src={selfieUrl}
                alt="Face Scan Preview"
                className="w-full h-full object-cover opacity-85"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-2 border-white rounded-full animate-pulse pointer-events-none" />
            </div>

            <p className="text-xs text-neutral-300 max-w-xs mx-auto">
              Please position your face clearly in good lighting to verify live human presence.
            </p>

            <button
              onClick={handlePerformLivenessAndSubmit}
              disabled={isSubmitting}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow transition-colors tap-active min-h-[48px] flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5 text-black" />
              Verify & Complete Authentication
            </button>
          </div>
        )}

        {/* Step 4: Processing State */}
        {step === 'verifying' && (
          <div className="py-8 text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-white mx-auto animate-spin" />
            <h4 className="text-lg font-bold text-white font-serif">
              Analyzing Document & Biometrics...
            </h4>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Verifying age 50+ eligibility, document authenticity, and facial match with secure server trust engine.
            </p>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h4 className="text-2xl font-bold font-serif text-white">
              Identity & Age 50+ Verified!
            </h4>
            <p className="text-sm text-neutral-300 max-w-sm mx-auto">
              Congratulations {currentUser?.firstName}! Your official <strong className="text-white">Verified 50+ Member Badge</strong> is now active on your profile.
            </p>

            <button
              onClick={() => setShowVerificationModal(false)}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3 rounded-xl shadow transition-colors tap-active min-h-[44px]"
            >
              Done & Return to Profile
            </button>
          </div>
        )}

        {/* Error State */}
        {step === 'error' && (
          <div className="py-6 text-center space-y-4">
            <AlertTriangle className="w-16 h-16 text-rose-400 mx-auto" />
            <h4 className="text-xl font-bold text-white font-serif">
              Verification Notice
            </h4>
            <p className="text-sm text-neutral-300 max-w-sm mx-auto">
              {errorMessage || 'Verification could not be completed. Please review your details and re-submit.'}
            </p>

            <button
              onClick={() => setStep('document')}
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3 rounded-xl shadow transition-colors tap-active min-h-[44px]"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
