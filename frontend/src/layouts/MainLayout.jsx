import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter, PageBreadcrumb } from './SiteFooter';
import { GlobalStatusStrip } from '../components/admin/GlobalStatusStrip';
import { useApp } from '../context/SystemStateContext';

// Shared Modals
import { QRVerificationModal } from '../components/modals/QRVerificationModal';
import { ClosedLoopInterventionModal } from '../components/modals/ClosedLoopInterventionModal';
import { CertificateDetailModal } from '../components/modals/CertificateDetailModal';
import { CareerDetailModal } from '../components/modals/CareerDetailModal';
import { BiometricAttendanceModal } from '../components/modals/BiometricAttendanceModal';
import { EmployerDashboardPreviewModal } from '../components/modals/EmployerDashboardPreviewModal';
import { NominationModal } from '../components/modals/NominationModal';

// Trainer Modals
import { CreateInterventionWizardModal } from '../components/modals/CreateInterventionWizardModal';
import { AnnouncementModal } from '../components/modals/AnnouncementModal';
import { TrainerResourceModal } from '../components/modals/TrainerResourceModal';

// Admin Modals
import { NominationConflictModal } from '../components/modals/NominationConflictModal';
import { CourseEditorModal } from '../components/modals/CourseEditorModal';
import { ScheduleSessionModal } from '../components/modals/ScheduleSessionModal';
import { ResourceRequestModal } from '../components/modals/ResourceRequestModal';
import { GlobalSearchModal } from '../components/modals/GlobalSearchModal';
import { SyncCenterModal } from '../components/offline/SyncCenterModal';
import { AIAssistantDrawer } from '../components/ai/AIAssistantDrawer';
import { AITrainerAssistantDrawer } from '../components/ai/AITrainerAssistantDrawer';
import { AIOpsAssistantDrawer } from '../components/ai/AIOpsAssistantDrawer';
import { WifiOff, RefreshCw, Sparkles } from 'lucide-react';

export const MainLayout = () => {
  const location = useLocation();
  const { isOffline, syncData, isSyncing, openModal, setIsAiDrawerOpen, userRole } = useApp();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openModal('global_search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-700 antialiased overflow-x-clip">
      {/* Two-tier site header: brand bar + primary navigation */}
      <SiteHeader />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Global Status Strip */}
        {userRole === 'admin' && <GlobalStatusStrip />}

        {/* Offline Banner Alert */}
        {isOffline && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 lg:px-8 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                <WifiOff className="w-3.5 h-3.5" />
              </span>
              <span className="text-amber-900 truncate">
                <strong className="font-semibold">Rural Edge Mode.</strong>{' '}
                <span className="text-amber-800/90">
                  Records are saved locally to IndexedDB and sync to Central Cloud automatically.
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openModal('sync_center')}
                className="ncct-press px-3 py-1.5 rounded-lg bg-white text-amber-900 text-[11px] font-semibold border border-amber-300 hover:border-amber-400 hover:bg-amber-50"
              >
                Sync Center
              </button>
              <button
                onClick={syncData}
                disabled={isSyncing}
                className="ncct-press px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-70"
              >
                {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                <span>{isSyncing ? 'Syncing…' : 'Go Online & Sync'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Wrapper — keyed so each view replays the entrance choreography */}
        <PageBreadcrumb />
        <main key={location.pathname} className="flex-1 px-4 lg:px-8 py-8 max-w-[1280px] w-full mx-auto app-page-enter">
          <Outlet />
        </main>
        <SiteFooter />
      </div>

      {/* Shared Modals */}
      <QRVerificationModal />
      <ClosedLoopInterventionModal />
      <CertificateDetailModal />
      <CareerDetailModal />
      <BiometricAttendanceModal />
      <EmployerDashboardPreviewModal />
      <NominationModal />
      <SyncCenterModal />

      {/* Trainer Modals */}
      <CreateInterventionWizardModal />
      <AnnouncementModal />
      <TrainerResourceModal />

      {/* Admin Modals */}
      <NominationConflictModal />
      <CourseEditorModal />
      <ScheduleSessionModal />
      <ResourceRequestModal />
      <GlobalSearchModal />

      {/* Role-based AI Drawers */}
      {userRole === 'admin' ? (
        <AIOpsAssistantDrawer />
      ) : userRole === 'trainer' ? (
        <AITrainerAssistantDrawer />
      ) : (
        <AIAssistantDrawer />
      )}

      {/* Floating AI Button — collapsed to a disc until hovered, so it never
          competes with the content it sits over. */}
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        className="group ncct-press fixed bottom-6 right-6 z-30 h-14 pl-3.5 pr-3.5 hover:pr-5 rounded-2xl bg-white text-indigo-700 text-sm font-semibold shadow-lg hover:shadow-xl ring-1 ring-slate-200 flex items-center gap-2.5 overflow-hidden"
      >
        <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-12">
          <Sparkles className="w-3.5 h-3.5" />
        </span>
        <span className="max-w-0 group-hover:max-w-[15rem] opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all duration-500 ease-out-expo">
          {userRole === 'admin'
            ? 'NCCT Ops Assistant'
            : userRole === 'trainer'
            ? 'NCCT AI Trainer Assistant'
            : 'NCCT AI Assistant'}
        </span>
      </button>
    </div>
  );
};
