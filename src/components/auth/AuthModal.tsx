import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  Lock,
  Mail,
  User,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Camera,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { API } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const { setCurrentUser, refreshAllData } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'verify_email' | 'onboarding' | 'forgot_password' | 'reset_password'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Onboarding Step State (1 through 7)
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<'woman' | 'man' | 'non_binary' | 'prefer_not_to_say'>('woman');
  const [lookingFor, setLookingFor] = useState<'men' | 'women' | 'everyone'>('men');
  const [dobYear, setDobYear] = useState('1964');
  const [dobMonth, setDobMonth] = useState('06');
  const [dobDay, setDobDay] = useState('15');
  const [city, setCity] = useState('Seattle');
  const [state, setState] = useState('WA');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Gardening', 'Morning Walks', 'Reading & Book Clubs']);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['companionship', 'serious_relationship']);
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [morningOrNight, setMorningOrNight] = useState<string>('early_bird');
  const [smoking, setSmoking] = useState<string>('non_smoker');
  const [alcohol, setAlcohol] = useState<string>('social_wine');
  const [petsInput, setPetsInput] = useState<string>('Golden Retriever');
  const [bio, setBio] = useState('Retired educator looking for honest companionship, morning botanical walks, and pleasant conversation.');

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - parseInt(dobYear || '1964');

  const INTEREST_OPTIONS = [
    'Traveling', 'Morning Walks', 'Cooking', 'Gardening', 'Classical Music',
    'Reading & Book Clubs', 'Movies & Cinema', 'Dancing', 'Pickleball & Sports',
    'Art & Watercolor', 'Photography', 'Camping & Nature', 'Volunteering',
    'Wine Tasting', 'Historical Biographies', 'Sailing & Boating',
  ];

  const GOAL_OPTIONS = [
    { id: 'companionship', label: 'Companionship', desc: 'Warm daily connection & sharing life together' },
    { id: 'serious_relationship', label: 'Serious Relationship', desc: 'Long-term committed partnership' },
    { id: 'friendship', label: 'Close Friendship', desc: 'Platonic connection & shared activities' },
    { id: 'travel_companionship', label: 'Travel Partner', desc: 'Exploring scenic places & vacations' },
    { id: 'activity_partner', label: 'Activity Partner', desc: 'Walking, dining, and hobby partner' },
  ];

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=80',
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await API.login({ email, password });
      setCurrentUser(res.user);
      await refreshAllData();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    // Advance to email verification
    setMode('verify_email');
  };

  const handleVerifyEmail = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await API.verifyEmail(email, verificationCode || '123456');
      setMode('onboarding');
      setOnboardingStep(1);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification code incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await API.forgotPassword(email);
      setSuccessMessage(res.message);
      if (res.code) {
        setResetCode(res.code);
      }
      setMode('reset_password');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      await API.resetPassword(email, resetCode, newPassword);
      setSuccessMessage('Password updated successfully! Please sign in with your new password.');
      setMode('login');
    } catch (err: any) {
      setErrorMessage(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setErrorMessage('');
    setLoading(true);
    const dobString = `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`;

    try {
      const res = await API.registerUser({
        email,
        password,
        firstName: firstName || 'Eleanor',
        dateOfBirth: dobString,
        gender,
        lookingForGender: lookingFor,
        city,
        state,
        relationshipGoals: selectedGoals as any,
        interests: selectedInterests,
        photos: [
          {
            id: `p_${Date.now()}`,
            url: selectedPhotoUrl,
            isPrimary: true,
            moderationStatus: 'APPROVED',
          },
        ],
        lifestyle: {
          activityLevel,
          morningOrNight,
          smoking,
          alcohol,
          pets: petsInput ? [petsInput] : [],
        },
        bio,
      });

      setCurrentUser(res.user);
      await refreshAllData();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Check age eligibility.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
      }
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto text-white">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-lg w-full my-auto p-6 sm:p-7 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 tap-active"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-md">
            <Heart className="w-7 h-7 fill-black text-black" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-white">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Your 50+ Account'}
            {mode === 'verify_email' && 'Verify Your Email'}
            {mode === 'onboarding' && 'Welcome! Set Up Your Profile'}
            {mode === 'forgot_password' && 'Reset Password'}
            {mode === 'reset_password' && 'Enter New Password'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            {mode === 'login' && 'Sign in to access your verified 50+ connections & messages.'}
            {mode === 'signup' && 'Safe, genuine companionship and community exclusively for adults 50+.'}
            {mode === 'verify_email' && `We sent a 6-digit confirmation code to ${email || 'your email'}.`}
            {mode === 'onboarding' && `Step ${onboardingStep} of 7 — Let's build your verified profile.`}
            {mode === 'forgot_password' && 'Enter your registered email to receive a password reset code.'}
            {mode === 'reset_password' && 'Enter the reset code and choose your new password.'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="bg-neutral-900 border border-neutral-700 text-white rounded-xl p-3 text-xs font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-neutral-900 border border-white text-white rounded-xl p-3 text-xs font-semibold">
            ✓ {successMessage}
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. eleanor.vance@example.com"
                  className="w-full bg-black border border-neutral-700 text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot_password')}
                  className="text-xs text-white hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-neutral-700 text-white pl-10 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow-lg transition-colors text-base flex items-center justify-center gap-2 tap-active min-h-[48px]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-neutral-400">Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('signup');
                }}
                className="text-xs text-white font-bold hover:underline"
              >
                Sign Up Here
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGNUP MODE (Step 1 of Auth) */}
        {mode === 'signup' && (
          <form onSubmit={handleInitialSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. eleanor.vance@example.com"
                  className="w-full bg-black border border-neutral-700 text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                Choose a Secure Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-black border border-neutral-700 text-white pl-10 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">50+ Age Commitment:</strong> By continuing, you confirm you are at least 50 years of age and agree to identity verification.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow-lg transition-colors text-base flex items-center justify-center gap-2 tap-active min-h-[48px]"
            >
              Continue to Verification →
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-neutral-400">Already registered? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('login');
                }}
                className="text-xs text-white font-bold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. EMAIL VERIFICATION STEP */}
        {mode === 'verify_email' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-neutral-300">
                Enter the 6-digit code sent to <strong className="text-white">{email}</strong>:
              </p>
              <div className="text-[11px] text-neutral-400">
                (For preview testing, enter code: <span className="text-white font-mono font-bold">123456</span>)
              </div>
            </div>

            <div className="flex justify-center">
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="bg-black border-2 border-neutral-600 text-white tracking-widest text-center text-2xl font-mono py-3 px-6 rounded-2xl w-48 focus:outline-none focus:border-white"
              />
            </div>

            <button
              onClick={handleVerifyEmail}
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow-lg transition-colors text-base flex items-center justify-center gap-2 tap-active min-h-[48px]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm Code & Build Profile →'}
            </button>

            <button
              type="button"
              onClick={() => setMode('signup')}
              className="w-full text-xs text-neutral-400 hover:text-white"
            >
              ← Change Email Address
            </button>
          </div>
        )}

        {/* 4. MULTI-STEP ONBOARDING FLOW (Steps 1 through 7) */}
        {mode === 'onboarding' && (
          <div className="space-y-5">
            {/* Step Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Step {onboardingStep} of 7</span>
                <span className="text-white font-bold">{Math.round((onboardingStep / 7) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${(onboardingStep / 7) * 100}%` }}
                />
              </div>
            </div>

            {/* Step 1: Name & Gender */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    What is your first name?
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Eleanor"
                    className="w-full bg-black border border-neutral-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    I identify as:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'woman', label: 'Woman' },
                      { id: 'man', label: 'Man' },
                      { id: 'non_binary', label: 'Non-Binary' },
                      { id: 'prefer_not_to_say', label: 'Prefer not to say' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGender(opt.id as any)}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all tap-active ${
                          gender === opt.id
                            ? 'bg-neutral-900 text-white border-white'
                            : 'bg-black text-neutral-400 border-neutral-800 hover:bg-neutral-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    Who would you like to meet?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'men', label: 'Men' },
                      { id: 'women', label: 'Women' },
                      { id: 'everyone', label: 'Everyone' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLookingFor(opt.id as any)}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all tap-active ${
                          lookingFor === opt.id
                            ? 'bg-neutral-900 text-white border-white'
                            : 'bg-black text-neutral-400 border-neutral-800 hover:bg-neutral-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date of Birth & 50+ Eligibility */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    When were you born?
                  </label>
                  <p className="text-xs text-neutral-400">
                    Your exact date of birth is kept strictly private and used to calculate your age ({calculatedAge} years old).
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Month</label>
                    <select
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="w-full bg-black border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m.toString().padStart(2, '0')}>
                          {new Date(2000, m - 1).toLocaleString('default', { month: 'short' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Day</label>
                    <select
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      className="w-full bg-black border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d.toString().padStart(2, '0')}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Year</label>
                    <select
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                      className="w-full bg-black border border-neutral-700 text-white p-3 rounded-xl text-xs sm:text-sm"
                    >
                      {Array.from({ length: 50 }, (_, i) => 1976 - i).map((y) => (
                        <option key={y} value={y.toString()}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-neutral-400 block">Verified Platform Age:</span>
                    <strong className="text-white text-base">{calculatedAge} Years Old</strong>
                  </div>
                  <span className="bg-white text-black text-xs font-black px-2.5 py-1 rounded-full">
                    ✓ Eligible 50+
                  </span>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    Where do you live?
                  </label>
                  <p className="text-xs text-neutral-400">
                    We show fuzzy approximate distances (e.g. "Seattle, 5 miles away") to protect your exact home address.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-300 font-bold">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Seattle"
                      className="w-full bg-black border border-neutral-700 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-300 font-bold">State / Region</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. WA"
                      className="w-full bg-black border border-neutral-700 text-white px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Profile Photo */}
            {onboardingStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    Choose Your Profile Photo
                  </label>
                  <p className="text-xs text-neutral-400">
                    Profiles with clear smiling photos receive genuine responses from other verified members.
                  </p>
                </div>

                {/* Selected Preview */}
                <div className="flex justify-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl relative">
                    <img
                      src={selectedPhotoUrl}
                      alt="Selected Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-neutral-400">Select an authentic sample portrait or paste your photo URL:</label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_PRESETS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedPhotoUrl(url)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all tap-active ${
                          selectedPhotoUrl === url ? 'border-white scale-105' : 'border-neutral-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="url"
                  value={selectedPhotoUrl}
                  onChange={(e) => setSelectedPhotoUrl(e.target.value)}
                  placeholder="Or paste custom image URL"
                  className="w-full bg-black border border-neutral-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-white"
                />
              </div>
            )}

            {/* Step 5: Interests */}
            {onboardingStep === 5 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    Select Your Favorite Interests (Pick 3 or more)
                  </label>
                  <p className="text-xs text-neutral-400">
                    Used by our compatibility engine to find people who love the same activities.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all tap-active ${
                          isSelected
                            ? 'bg-white text-black shadow'
                            : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 6: Relationship Goals */}
            {onboardingStep === 6 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    What are you looking for?
                  </label>
                  <p className="text-xs text-neutral-400">
                    Be open and honest. You can select multiple intentions.
                  </p>
                </div>

                <div className="space-y-2">
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <div
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all tap-active ${
                          isSelected
                            ? 'bg-neutral-900 border-white text-white shadow'
                            : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-900 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{goal.label}</span>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-white border-white text-black' : 'border-neutral-600'}`}>
                            {isSelected && <span className="text-[10px] font-black">✓</span>}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">{goal.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 7: Lifestyle Habits & Bio */}
            {onboardingStep === 7 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                    Lifestyle & About You
                  </label>
                  <p className="text-xs text-neutral-400">
                    A few details to ensure high lifestyle compatibility.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Activity Rhythm</label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full bg-black border border-neutral-700 text-white p-2.5 rounded-xl text-xs"
                    >
                      <option value="daily_active">Daily Active</option>
                      <option value="moderate">Moderate Pace</option>
                      <option value="relaxed">Relaxed & Gentle</option>
                      <option value="homebody">Cozy Homebody</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Morning or Night</label>
                    <select
                      value={morningOrNight}
                      onChange={(e) => setMorningOrNight(e.target.value)}
                      className="w-full bg-black border border-neutral-700 text-white p-2.5 rounded-xl text-xs"
                    >
                      <option value="early_bird">Early Bird</option>
                      <option value="night_owl">Night Owl</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-300 font-bold">Brief Bio / Introduction</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share what makes you smile and what you enjoy in this chapter of life..."
                    className="w-full bg-black border border-neutral-700 text-white p-2.5 rounded-xl text-xs focus:outline-none focus:border-white resize-none"
                  />
                </div>
              </div>
            )}

            {/* Bottom Nav Controls for Onboarding */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-800">
              {onboardingStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white tap-active"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {onboardingStep < 7 ? (
                <button
                  type="button"
                  onClick={() => setOnboardingStep(onboardingStep + 1)}
                  className="bg-white hover:bg-neutral-200 text-black font-black px-6 py-2.5 rounded-xl text-sm shadow transition-colors tap-active min-h-[42px]"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  className="bg-white hover:bg-neutral-200 text-black font-black px-6 py-2.5 rounded-xl text-sm shadow-lg transition-colors tap-active min-h-[42px] flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Enter Discover & Meet Matches →'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 5. FORGOT PASSWORD MODE */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. eleanor.vance@example.com"
                  className="w-full bg-black border border-neutral-700 text-white pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow-lg transition-colors text-base flex items-center justify-center gap-2 tap-active min-h-[48px]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Send 6-Digit Reset Code'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-xs text-neutral-400 hover:text-white text-center"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* 6. RESET PASSWORD MODE */}
        {mode === 'reset_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                6-Digit Reset Code
              </label>
              <input
                type="text"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="e.g. 582914"
                className="w-full bg-black border border-neutral-700 text-white font-mono text-center tracking-widest text-lg py-2.5 rounded-xl focus:outline-none focus:border-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-300 font-bold">
                New Secure Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-black border border-neutral-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-200 text-black font-black py-3.5 rounded-xl shadow-lg transition-colors text-base flex items-center justify-center gap-2 tap-active min-h-[48px]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Update Password & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
