import React from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../context/SystemStateContext';
import { MainLayout } from '../layouts/MainLayout';
import { PATHS, ROLE_ROUTES, canAccessRole, homePathFor } from './routePaths';

// Auth
import { SignInPage } from '../pages/Auth/SignInPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

// Trainee Pages
import { OverviewPage } from '../pages/Trainee/OverviewPage';
import { LearningPage } from '../pages/Trainee/LearningPage';
import { LearningPathPage } from '../pages/Trainee/LearningPathPage';
import { AssessmentsPage } from '../pages/Trainee/AssessmentsPage';
import { SkillsPage } from '../pages/Trainee/SkillsPage';
import { CertificatesPage } from '../pages/Trainee/CertificatesPage';
import { CareerPage } from '../pages/Trainee/CareerPage';
import { LogisticsPage } from '../pages/Trainee/LogisticsPage';
import { ERPAnalyticsPage } from '../pages/Trainee/ERPAnalyticsPage';
import { NotificationsPage } from '../pages/Trainee/NotificationsPage';
import { ProfilePage } from '../pages/Trainee/ProfilePage';
import { HelpPage } from '../pages/Trainee/HelpPage';

// Trainer Pages
import { TrainerOverviewPage } from '../pages/Trainer/TrainerOverviewPage';
import { TrainerBatchesPage } from '../pages/Trainer/TrainerBatchesPage';
import { TrainerTraineesPage } from '../pages/Trainer/TrainerTraineesPage';
import { TrainerAttendancePage } from '../pages/Trainer/TrainerAttendancePage';
import { TrainerAssessmentsPage } from '../pages/Trainer/TrainerAssessmentsPage';
import { TrainerSkillsPage } from '../pages/Trainer/TrainerSkillsPage';
import { TrainerCompetencyPage } from '../pages/Trainer/TrainerCompetencyPage';
import { TrainerInterventionsPage } from '../pages/Trainer/TrainerInterventionsPage';
import { TrainerResourcesPage } from '../pages/Trainer/TrainerResourcesPage';
import { TrainerReportsPage } from '../pages/Trainer/TrainerReportsPage';
import { TrainerNotificationsPage } from '../pages/Trainer/TrainerNotificationsPage';

// Admin Pages
import { AdminOverviewPage } from '../pages/Admin/AdminOverviewPage';
import { AdminCoursesPage } from '../pages/Admin/AdminCoursesPage';
import { AdminNominationsPage } from '../pages/Admin/AdminNominationsPage';
import { AdminTimetablePage } from '../pages/Admin/AdminTimetablePage';
import { AdminCertificationPage } from '../pages/Admin/AdminCertificationPage';
import { AdminCapacityPage } from '../pages/Admin/AdminCapacityPage';
import { AdminHostelPage } from '../pages/Admin/AdminHostelPage';
import { AdminLogisticsPage } from '../pages/Admin/AdminLogisticsPage';
import { AdminTrainersPage } from '../pages/Admin/AdminTrainersPage';
import { AdminTraineesPage } from '../pages/Admin/AdminTraineesPage';
import { AdminAnalyticsPage } from '../pages/Admin/AdminAnalyticsPage';
import { AdminSkillsPage } from '../pages/Admin/AdminSkillsPage';
import { AdminOutreachPage } from '../pages/Admin/AdminOutreachPage';
import { AdminReportsPage } from '../pages/Admin/AdminReportsPage';
import { AdminNetworkPage } from '../pages/Admin/AdminNetworkPage';
import { AdminSettingsPage } from '../pages/Admin/AdminSettingsPage';

/** Page component for every page id in routePaths.js. */
const PAGE_COMPONENTS = {
  trainee: {
    overview: OverviewPage,
    learning: LearningPage,
    learning_path: LearningPathPage,
    assessments: AssessmentsPage,
    skills: SkillsPage,
    certificates: CertificatesPage,
    career: CareerPage,
    logistics: LogisticsPage,
    erp_analytics: ERPAnalyticsPage,
    notifications: NotificationsPage,
    profile: ProfilePage,
    help: HelpPage,
  },
  trainer: {
    trainer_overview: TrainerOverviewPage,
    trainer_batches: TrainerBatchesPage,
    trainer_trainees: TrainerTraineesPage,
    trainer_attendance: TrainerAttendancePage,
    trainer_assessments: TrainerAssessmentsPage,
    trainer_skills: TrainerSkillsPage,
    trainer_competency: TrainerCompetencyPage,
    trainer_interventions: TrainerInterventionsPage,
    trainer_resources: TrainerResourcesPage,
    trainer_reports: TrainerReportsPage,
    trainer_notifications: TrainerNotificationsPage,
    profile: ProfilePage,
  },
  admin: {
    admin_overview: AdminOverviewPage,
    admin_programmes: AdminCoursesPage,
    admin_nominations: AdminNominationsPage,
    admin_timetable: AdminTimetablePage,
    admin_certification: AdminCertificationPage,
    admin_capacity: AdminCapacityPage,
    admin_hostel: AdminHostelPage,
    admin_logistics: AdminLogisticsPage,
    admin_trainers: AdminTrainersPage,
    admin_trainees: AdminTraineesPage,
    admin_analytics: AdminAnalyticsPage,
    admin_skills: AdminSkillsPage,
    admin_outreach: AdminOutreachPage,
    admin_reports: AdminReportsPage,
    admin_network: AdminNetworkPage,
    admin_settings: AdminSettingsPage,
    profile: ProfilePage,
  },
};

/* ---------------- Route guards ---------------- */

/**
 * Pages for signed-out users only (sign-in). Once signed in, the user goes to the page
 * they originally requested (saved by ProtectedRoute), or to their home page.
 */
const PublicRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from?.pathname;
    return <Navigate to={from && from !== PATHS.LOGIN ? from : homePathFor(user?.role)} replace />;
  }
  return <Outlet />;
};

/** Requires a signed-in user; otherwise sends them to /login and remembers where they were going. */
const ProtectedRoute = () => {
  const { isAuthenticated, signedOut } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace state={signedOut ? undefined : { from: location }} />;
  }
  return <Outlet />;
};

/** Restricts a portal to the roles allowed to open it; others are sent to their own home page. */
const RoleRoute = ({ role }) => {
  const { user } = useAuth();

  if (!canAccessRole(user?.role, role)) {
    return <Navigate to={homePathFor(user?.role)} replace />;
  }
  return <Outlet />;
};

/** "/" goes to the signed-in user's home page, or to sign-in. */
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  return <Navigate to={isAuthenticated ? homePathFor(user?.role) : PATHS.LOGIN} replace />;
};

export const AppRoutes = () => (
  <Routes>
    <Route path={PATHS.ROOT} element={<RootRedirect />} />

    {/* Signed-out only */}
    <Route element={<PublicRoute />}>
      <Route path={PATHS.LOGIN} element={<SignInPage />} />
    </Route>

    {/* Signed-in: every portal shares the site header, footer and dialogs */}
    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        {Object.entries(ROLE_ROUTES).map(([role, { base, pages }]) => (
          <Route key={role} path={base} element={<RoleRoute role={role} />}>
            <Route index element={<Navigate to="overview" replace />} />
            {Object.entries(pages).map(([tab, segment]) => {
              const Page = PAGE_COMPONENTS[role][tab];
              return <Route key={tab} path={segment} element={<Page />} />;
            })}
          </Route>
        ))}
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
