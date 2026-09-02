import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

type AuthTab = 'signin' | 'signup';
type AuthMethod = 'password' | 'magic_link';

export const AuthScreen: React.FC = () => {
  const { signInWithPassword, signUpWithPassword, resetPassword, sendMagicLink } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  const [tab, setTab] = useState<AuthTab>('signin');
  const [method, setMethod] = useState<AuthMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetFormState = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleTabChange = (nextTab: AuthTab) => {
    setTab(nextTab);
    setIsResetMode(false);
    resetFormState();
  };

  const handleMethodChange = (nextMethod: AuthMethod) => {
    setMethod(nextMethod);
    setIsResetMode(false);
    resetFormState();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage(t('authEmailRequired'));
      return;
    }

    if (isResetMode) {
      setIsLoading(true);
      try {
        await resetPassword(cleanEmail);
        setSuccessMessage(t('authPasswordResetSent'));
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : t('authGenericError'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (method === 'magic_link') {
      setIsLoading(true);
      try {
        await sendMagicLink(cleanEmail);
        setSuccessMessage(t('authMagicLinkSent'));
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : t('authGenericError'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Password authentication
    if (!password) {
      setErrorMessage(t('authPasswordRequired'));
      return;
    }

    if (tab === 'signup') {
      if (password.length < 6) {
        setErrorMessage(t('authPasswordMinLength'));
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(t('authPasswordMismatch'));
        return;
      }

      setIsLoading(true);
      try {
        const result = await signUpWithPassword(cleanEmail, password);
        if (result.needsEmailConfirmation) {
          setSuccessMessage(t('authSignUpConfirmationSent'));
        } else {
          setSuccessMessage(t('authSignUpSuccess'));
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : t('authGenericError'));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign In with password
      setIsLoading(true);
      try {
        await signInWithPassword(cleanEmail, password);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : t('authInvalidCredentials'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher in top right corner */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            language === 'en'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('id')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            language === 'id'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ID
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">{t('appName')}</h1>
          <p className="text-xs text-slate-400 mt-1">{t('authTagline')}</p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-5">
          {/* Sign In vs Sign Up Tabs */}
          {!isResetMode && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80">
              <button
                type="button"
                onClick={() => handleTabChange('signin')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'signin'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('authSignIn')}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'signup'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('authSignUp')}
              </button>
            </div>
          )}

          {/* Reset Password Header (if in reset mode) */}
          {isResetMode && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  {t('authResetPasswordTitle')}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{t('authResetPasswordSubtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  resetFormState();
                }}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                {t('authBackToSignIn')}
              </button>
            </div>
          )}

          {/* Auth Method Selector: Password vs Magic Link */}
          {!isResetMode && (
            <div className="flex items-center justify-center gap-4 text-xs pt-1">
              <button
                type="button"
                onClick={() => handleMethodChange('password')}
                className={`flex items-center gap-1.5 font-semibold transition-colors pb-1 border-b-2 ${
                  method === 'password'
                    ? 'text-emerald-400 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t('authMethodPassword')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleMethodChange('magic_link')}
                className={`flex items-center gap-1.5 font-semibold transition-colors pb-1 border-b-2 ${
                  method === 'magic_link'
                    ? 'text-emerald-400 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t('authMethodMagicLink')}</span>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="auth-email">
                {t('authEmailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password fields (when method is password and not reset mode) */}
            {!isResetMode && method === 'password' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300" htmlFor="auth-password">
                      {t('authPasswordLabel')}
                    </label>
                    {tab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          resetFormState();
                        }}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {t('authForgotPassword')}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {tab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="auth-confirm-password">
                      {t('authConfirmPasswordLabel')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="auth-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t('authProcessing')}</span>
                </div>
              ) : isResetMode ? (
                <>
                  <span>{t('authSendResetLink')}</span>
                  <Send className="w-4 h-4" />
                </>
              ) : method === 'magic_link' ? (
                <>
                  <span>{t('authSendMagicLink')}</span>
                  <Send className="w-4 h-4" />
                </>
              ) : tab === 'signup' ? (
                <>
                  <span>{t('authCreateAccountButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{t('authSignInButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Cloud Badge */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('authCloudSecurityNote')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
