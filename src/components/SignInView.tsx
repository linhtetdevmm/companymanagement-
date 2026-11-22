import React, { useState } from 'react';
import { Building2, CheckCircle2, Layers } from 'lucide-react';
import { Language } from '../types';
import { useT } from '../i18n';
import { INPUT_CLS } from './ui/Primitives';

export function SignInView({
  lang,
  onLangChange,
  onSignIn,
  signingIn,
  authError,
  companyInput,
  onCompanyInputChange,
}: {
  lang: Language;
  onLangChange: (l: Language) => void;
  onSignIn: () => void;
  signingIn: boolean;
  authError: string | null;
  companyInput: string;
  onCompanyInputChange: (val: string) => void;
}) {
  const t = useT(lang);
  const [touched, setTouched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    onSignIn();
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Deep Burgundy Panel (iPhone 18 Pro Max Maroon Accent) */}
      <div className="lg:col-span-5 bg-[#5C1622] text-white px-8 py-12 lg:px-14 lg:py-16 flex flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, #8D2739 0%, transparent 55%), radial-gradient(circle at 85% 80%, #2D080F 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/12 border border-white/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">{t.brand}</span>
        </div>

        <div className="relative z-10 my-12 lg:my-0 max-w-md">
          <div className="p-6 rounded-2xl bg-white/8 border border-white/15 backdrop-blur-sm mb-8">
            <div className="text-xs font-medium text-white/75 mb-3">{t.workspaceReady}</div>
            <div className="grid grid-cols-2 gap-3 text-xs text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span>{t.portals.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span>{t.portals.hr}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span>{t.portals.sales}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span>{t.portals.finance}</span>
              </div>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-balance">
            {t.tagline}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
            {t.subTagline}
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/65">
          White &amp; Deep Burgundy Edition · Unified Cloud Workspace
        </div>
      </div>

      {/* Right Crisp White Sign-In Panel */}
      <div className="lg:col-span-7 bg-[#FAF8F8] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white border border-[#E7DFDF] rounded-2xl p-8 shadow-[0_2px_12px_rgba(26,20,21,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-medium text-[#6E6365]">{t.brand}</span>
            <div className="inline-flex items-center p-1 bg-[#FAF8F8] border border-[#E7DFDF] rounded-lg">
              <button
                type="button"
                onClick={() => onLangChange('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  lang === 'en' ? 'bg-white text-[#5C1622] shadow-xs' : 'text-[#6E6365] hover:text-[#1A1415]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onLangChange('my')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  lang === 'my' ? 'bg-white text-[#5C1622] shadow-xs' : 'text-[#6E6365] hover:text-[#1A1415]'
                }`}
              >
                မြန်မာ
              </button>
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold text-[#1A1415] tracking-tight">
            {t.signInTitle}
          </h2>
          <p className="mt-1.5 text-sm text-[#6E6365] leading-relaxed">{t.signInSubtitle}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="block text-xs font-medium text-[#3E3537] mb-1.5">
                {lang === 'en' ? 'Company / Workspace Name (Optional)' : 'ကုမ္ပဏီ / Workspace အမည် (ထည့်သွင်းနိုင်သည်)'}
              </span>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#938789] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => onCompanyInputChange(e.target.value)}
                  placeholder="e.g. Apex Trading Co."
                  maxLength={120}
                  className={`${INPUT_CLS} pl-9`}
                />
              </div>
              {touched && companyInput.trim().length === 0 && (
                <span className="mt-1 block text-[11.5px] text-[#6E6365]">
                  {lang === 'en'
                    ? 'Leave blank to use your default company workspace.'
                    : 'မထည့်သွင်းပါက ပုံသေကုမ္ပဏီ Workspace ကို ဖန်တီးပေးပါမည်။'}
                </span>
              )}
            </label>

            {authError && (
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C]">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={signingIn}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81"
                />
              </svg>
              <span>{signingIn ? t.signingIn : t.continueWithGoogle}</span>
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6E6365]">
            {lang === 'en'
              ? 'Your company records sync securely to Cloud Firestore.'
              : 'သင်၏ ကုမ္ပဏီအချက်အလက်များကို Cloud Firestore တွင် လုံခြုံစွာ သိမ်းဆည်းပါသည်။'}
          </p>
        </div>
      </div>
    </div>
  );
}
