import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ArrowLeft, LogOut, Plus } from 'lucide-react';
import { auth, signInWithGoogle, signOutUser, testFirestoreConnection } from './firebase';
import { Language, PortalId } from './types';
import { useT } from './i18n';
import { useWorkspaceData } from './hooks/useWorkspaceData';
import { SignInView } from './components/SignInView';
import { PortalLauncher } from './components/PortalLauncher';
import { OwnerPortal } from './components/portals/OwnerPortal';
import { HrPortal } from './components/portals/HrPortal';
import { SalesPortal } from './components/portals/SalesPortal';
import { CrmPortal } from './components/portals/CrmPortal';
import { MarketingPortal } from './components/portals/MarketingPortal';
import { FinancePortal } from './components/portals/FinancePortal';
import { QuickEntryModal } from './components/QuickEntryModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [companyInput, setCompanyInput] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [portal, setPortal] = useState<PortalId>('launcher');
  const [quickModalOpen, setQuickModalOpen] = useState(false);

  const t = useT(lang);

  useEffect(() => {
    testFirestoreConnection();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const data = useWorkspaceData(
    user?.uid ?? null,
    user?.displayName || user?.email?.split('@')[0] || 'Owner',
    companyInput.trim() || undefined
  );

  const handleSignIn = async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setPortal('launcher');
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F8] flex items-center justify-center">
        <div className="text-sm font-medium text-[#6E6365]">Loading workspace...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <SignInView
        lang={lang}
        onLangChange={setLang}
        onSignIn={handleSignIn}
        signingIn={signingIn}
        authError={authError}
        companyInput={companyInput}
        onCompanyInputChange={setCompanyInput}
      />
    );
  }

  const displayName = user.displayName || user.email || 'Owner';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF8F8] text-[#1A1415] flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-[#E7DFDF] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => setPortal('launcher')}
            className="font-display text-lg font-bold tracking-tight text-[#5C1622] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.brand}
          </button>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {(
              [
                ['launcher', t.portals.launcher],
                ['owner', t.portals.owner],
                ['hr', t.portals.hr],
                ['sales', t.portals.sales],
                ['finance', t.portals.finance],
              ] as Array<[PortalId, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPortal(id)}
                className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  portal === id
                    ? 'border-[#5C1622] text-[#5C1622]'
                    : 'border-transparent text-[#6E6365] hover:text-[#1A1415]'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setQuickModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5C1622] hover:bg-[#450F18] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.quickEntry}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Toolbar (Back to Apps, Portal Switcher, Bilingual Toggle, Account) */}
      <div className="bg-white/80 border-b border-[#EFE9E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {portal !== 'launcher' && (
              <button
                type="button"
                onClick={() => setPortal('launcher')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#3E3537] bg-[#FAF8F8] border border-[#E7DFDF] hover:border-[#5C1622]/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.backToApps}</span>
              </button>
            )}
            <div className="text-xs text-[#6E6365] truncate">
              <span className="font-semibold text-[#1A1415]">
                {data.workspace?.name || 'Workspace'}
              </span>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              <span>{t.portals[portal]}</span>
            </div>

            {/* Quick CRM / Marketing switchers for convenience */}
            <div className="hidden sm:flex items-center gap-3 ml-3 pl-3 border-l border-[#E7DFDF] text-xs">
              <button
                type="button"
                onClick={() => setPortal('crm')}
                className={`whitespace-nowrap cursor-pointer ${
                  portal === 'crm' ? 'text-[#5C1622] font-semibold' : 'text-[#6E6365] hover:text-[#1A1415]'
                }`}
              >
                {t.portals.crm}
              </button>
              <button
                type="button"
                onClick={() => setPortal('marketing')}
                className={`whitespace-nowrap cursor-pointer ${
                  portal === 'marketing' ? 'text-[#5C1622] font-semibold' : 'text-[#6E6365] hover:text-[#1A1415]'
                }`}
              >
                {t.portals.marketing}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="inline-flex items-center p-0.5 bg-[#FAF8F8] border border-[#E7DFDF] rounded-lg">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  lang === 'en' ? 'bg-white text-[#5C1622] shadow-xs' : 'text-[#6E6365]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('my')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  lang === 'my' ? 'bg-white text-[#5C1622] shadow-xs' : 'text-[#6E6365]'
                }`}
              >
                မြန်မာ
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#5C1622] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {initial}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-[#1A1415] max-w-[140px] truncate">
                {displayName}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-xs text-[#6E6365] hover:text-[#5C1622] transition-colors whitespace-nowrap cursor-pointer"
                title={t.signOut}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.signOut}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <main className="flex-1">
        {data.error && (
          <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6">
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C]">
              {data.error}
            </div>
          </div>
        )}

        {data.loading ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-48 bg-white border border-[#E7DFDF] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {portal === 'launcher' && (
              <PortalLauncher lang={lang} data={data} onEnterPortal={setPortal} />
            )}
            {portal === 'owner' && (
              <OwnerPortal
                lang={lang}
                data={data}
                onUpdateWorkspace={data.updateWorkspace}
                onUpdateRecord={data.updateRecord}
                onNavigatePortal={(p) => setPortal(p)}
              />
            )}
            {portal === 'hr' && (
              <HrPortal
                lang={lang}
                userDisplayName={displayName}
                data={data}
                onCreateRecord={data.createRecord}
                onUpdateRecord={data.updateRecord}
                onDeleteRecord={data.deleteRecord}
              />
            )}
            {portal === 'sales' && (
              <SalesPortal
                lang={lang}
                data={data}
                onCreateRecord={data.createRecord}
                onUpdateRecord={data.updateRecord}
                onDeleteRecord={data.deleteRecord}
              />
            )}
            {portal === 'crm' && (
              <CrmPortal
                lang={lang}
                data={data}
                onCreateRecord={data.createRecord}
                onUpdateRecord={data.updateRecord}
                onDeleteRecord={data.deleteRecord}
              />
            )}
            {portal === 'marketing' && (
              <MarketingPortal
                lang={lang}
                data={data}
                onUpdateWorkspace={data.updateWorkspace}
                onCreateRecord={data.createRecord}
                onUpdateRecord={data.updateRecord}
                onDeleteRecord={data.deleteRecord}
              />
            )}
            {portal === 'finance' && (
              <FinancePortal
                lang={lang}
                data={data}
                onCreateRecord={data.createRecord}
                onUpdateRecord={data.updateRecord}
                onDeleteRecord={data.deleteRecord}
              />
            )}
          </>
        )}
      </main>

      <QuickEntryModal
        open={quickModalOpen}
        lang={lang}
        onClose={() => setQuickModalOpen(false)}
        onCreateRecord={data.createRecord}
      />
    </div>
  );
}
