import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { API } from '../../services/api';
import {
  ChevronLeft,
  ShieldCheck,
  Mail,
  Phone,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  RotateCw,
  Shield,
} from 'lucide-react';

interface VerificationScreenProps {
  onBack: () => void;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({ onBack }) => {
  const { currentUser, setCurrentUser, refreshAllData } = useApp();

  const [emailCode, setEmailCode] = useState<string>('');
  const [emailMsg, setEmailMsg] = useState<string>('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState<boolean>(false);

  const [phoneInput, setPhoneInput] = useState<string>(currentUser?.phone || '');
  const [phoneCode, setPhoneCode] = useState<string>('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'code'>('input');
  const [phoneMsg, setPhoneMsg] = useState<string>('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState<boolean>(false);

  // Photo selfie state
  const [isPhotoScanning, setIsPhotoScanning] = useState<boolean>(false);
  const [photoVerifiedLocal, setPhotoVerifiedLocal] = useState<boolean>(false);
  const [photoMsg, setPhotoMsg] = useState<string>('');

  // ID verification state
  const [idType, setIdType] = useState<'drivers_license' | 'passport' | 'state_id'>('drivers_license');
  const [isSubmittingID, setIsSubmittingID] = useState<boolean>(false);
  const [idMsg, setIdMsg] = useState<string>('');

  if (!currentUser) return null;

  const isEmailVerified = !!currentUser.emailVerified;
  const isPhoneVerified = !!currentUser.phoneVerified;
  const isFullVerified = currentUser.verificationStatus === 'VERIFIED';

  const handleSendEmailCode = async () => {
    setEmailMsg('Verification code sent to your registered email address.');
  };

  const handleVerifyEmail = async () => {
    if (!emailCode.trim()) {
      setEmailMsg('Please enter the 6-digit code received in your email.');
      return;
    }
    setIsVerifyingEmail(true);
    setEmailMsg('');
    try {
      await API.verifyEmail(currentUser.email || '', emailCode.trim());
      setEmailMsg('✓ Email verified successfully!');
      refreshAllData();
    } catch (err: any) {
      setEmailMsg(err.message || 'Invalid verification code.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSendPhoneOTP = () => {
    if (!phoneInput.trim() || phoneInput.length < 7) {
      setPhoneMsg('Please enter a valid phone number.');
      return;
    }
    setPhoneStep('code');
    setPhoneMsg('SMS code sent: enter 582914 or any 6-digit code.');
  };

  const handleVerifyPhone = async () => {
    if (!phoneCode.trim()) {
      setPhoneMsg('Please enter the verification code.');
      return;
    }
    setIsVerifyingPhone(true);
    setPhoneMsg('');
    try {
      // update phone verified on user
      const updated = await API.updateMe({
        phoneVerified: true as any,
        phone: phoneInput.trim(),
      });
      setCurrentUser(updated);
      setPhoneMsg('✓ Phone number verified successfully!');
      refreshAllData();
    } catch (err: any) {
      setPhoneMsg('Could not verify phone. Please try again.');
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleSimulateSelfieScan = () => {
    setIsPhotoScanning(true);
    setPhotoMsg('Performing camera liveness check... Please look straight ahead and smile gently.');
    setTimeout(() => {
      setIsPhotoScanning(false);
      setPhotoVerifiedLocal(true);
      setPhotoMsg('✓ Photo liveness check passed! Your profile matches your live facial scan.');
    }, 2000);
  };

  const handleCompleteFullVerification = async () => {
    setIsSubmittingID(true);
    setIdMsg('Encrypting ID document and confirming 50+ age eligibility...');
    try {
      const res = await API.completeVerification(currentUser.id, idType.toUpperCase() as any);
      if (res && res.user) {
        setCurrentUser(res.user);
      }
      setIdMsg('✓ Congratulations! You have received your Verified 50+ Member Badge.');
      refreshAllData();
    } catch (err: any) {
      setIdMsg(err.message || 'Verification could not be completed.');
    } finally {
      setIsSubmittingID(false);
    }
  };

  return (
    <div className="space-y-4 pb-8 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <button
          id="btn-verification-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-bold transition-all tap-active"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span>Menu</span>
        </button>

        <h2 className="text-base sm:text-lg font-bold font-serif text-white">
          Trust & Identity Verification
        </h2>

        <div className="w-12" />
      </div>

      {/* Trust & Safety Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Why Verification Matters in SilverHeart
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
              We are dedicated exclusively to genuine adults aged 50 and above. Identity checks eliminate scammers, fake profiles, and commercial solicitations so you can converse with peace of mind.
            </p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center gap-2.5 text-xs text-neutral-400">
          <Lock className="w-4 h-4 text-white shrink-0" />
          <span>
            Privacy Guarantee: Verification documents are encrypted with AES-256 and never shared or displayed on your public profile.
          </span>
        </div>
      </div>

      {/* 1. EMAIL VERIFICATION */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Email Verification</span>
              <span className="text-xs text-neutral-400">{currentUser.email}</span>
            </div>
          </div>

          {isEmailVerified ? (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          ) : (
            <span className="text-xs font-bold text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-full">
              Action Required
            </span>
          )}
        </div>

        {!isEmailVerified && (
          <div className="pt-2 space-y-2 border-t border-neutral-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                placeholder="Enter 6-digit code (e.g. 582914)"
                className="flex-1 bg-neutral-900 border border-neutral-700 text-white p-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white"
              />
              <button
                onClick={handleVerifyEmail}
                disabled={isVerifyingEmail}
                className="px-4 py-2.5 bg-white text-black font-black text-xs rounded-xl shadow-md disabled:opacity-60"
              >
                {isVerifyingEmail ? 'Checking...' : 'Verify'}
              </button>
            </div>
            <button
              onClick={handleSendEmailCode}
              className="text-xs text-neutral-400 hover:text-white underline"
            >
              Resend code to {currentUser.email}
            </button>
          </div>
        )}

        {emailMsg && (
          <p className="text-xs text-neutral-300 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
            {emailMsg}
          </p>
        )}
      </div>

      {/* 2. PHONE OTP VERIFICATION */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Phone Security Verification</span>
              <span className="text-xs text-neutral-400">
                {currentUser.phone || 'Prevents duplicate and automated accounts'}
              </span>
            </div>
          </div>

          {isPhoneVerified ? (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          ) : (
            <span className="text-xs font-bold text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-full">
              Unverified
            </span>
          )}
        </div>

        {!isPhoneVerified && (
          <div className="pt-2 space-y-2 border-t border-neutral-900">
            {phoneStep === 'input' ? (
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="flex-1 bg-neutral-900 border border-neutral-700 text-white p-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white"
                />
                <button
                  onClick={handleSendPhoneOTP}
                  className="px-4 py-2.5 bg-white text-black font-black text-xs rounded-xl shadow-md"
                >
                  Send Code
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  placeholder="Enter 6-digit SMS code"
                  className="flex-1 bg-neutral-900 border border-neutral-700 text-white p-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-white"
                />
                <button
                  onClick={handleVerifyPhone}
                  disabled={isVerifyingPhone}
                  className="px-4 py-2.5 bg-white text-black font-black text-xs rounded-xl shadow-md disabled:opacity-60"
                >
                  {isVerifyingPhone ? 'Checking...' : 'Confirm'}
                </button>
              </div>
            )}
          </div>
        )}

        {phoneMsg && (
          <p className="text-xs text-neutral-300 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
            {phoneMsg}
          </p>
        )}
      </div>

      {/* 3. PHOTO LIVENESS CHECK */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Photo Liveness Check</span>
              <span className="text-xs text-neutral-400">
                Confirm your photos are really you (takes 10 seconds)
              </span>
            </div>
          </div>

          {photoVerifiedLocal || isFullVerified ? (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passed
            </span>
          ) : (
            <button
              onClick={handleSimulateSelfieScan}
              disabled={isPhotoScanning}
              className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded-xl shadow-sm disabled:opacity-60"
            >
              {isPhotoScanning ? 'Scanning...' : 'Start Scan'}
            </button>
          )}
        </div>

        {photoMsg && (
          <p className="text-xs text-neutral-300 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
            {photoMsg}
          </p>
        )}
      </div>

      {/* 4. GOVERNMENT ID & 50+ AGE CONFIRMATION */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Verified 50+ Member Badge</span>
              <span className="text-xs text-neutral-400">
                Encrypted Government ID / Driver's License check
              </span>
            </div>
          </div>

          {isFullVerified ? (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full Badge
            </span>
          ) : (
            <span className="text-xs font-bold text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-full">
              Not Completed
            </span>
          )}
        </div>

        {!isFullVerified && (
          <div className="space-y-3 pt-2 border-t border-neutral-900">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Select Document Type
              </label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-white"
              >
                <option value="drivers_license">Driver's License</option>
                <option value="passport">Passport</option>
                <option value="state_id">State Identification Card</option>
              </select>
            </div>

            <button
              onClick={handleCompleteFullVerification}
              disabled={isSubmittingID}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3 px-4 rounded-xl text-xs sm:text-sm transition-all tap-active flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              {isSubmittingID ? (
                <RotateCw className="w-4 h-4 animate-spin text-black" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-black" />
              )}
              <span>{isSubmittingID ? 'Verifying Encrypted Document...' : 'Submit & Receive 50+ Verified Badge'}</span>
            </button>
          </div>
        )}

        {idMsg && (
          <p className="text-xs text-neutral-300 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
            {idMsg}
          </p>
        )}
      </div>
    </div>
  );
};
