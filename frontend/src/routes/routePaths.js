/**
 * Single source of truth for every URL in the app.
 *
 * Each role has a base path and a map of page id → URL segment. Page ids are the
 * values components already pass to `setActiveTab(...)`, so navigation keeps working
 * through SystemStateContext (useApp) while the browser URL, refresh and back button all behave.
 */

export const PATHS = {
  ROOT: '/',
  LOGIN: '/login',
};

export const ROLE_ROUTES = {
  trainee: {
    base: '/trainee',
    pages: {
      overview: 'overview',
      learning: 'learning',
      learning_path: 'learning-path',
      assessments: 'assessments',
      skills: 'skills',
      certificates: 'certificates',
      career: 'career',
      logistics: 'logistics',
      erp_analytics: 'erp-analytics',
      notifications: 'notifications',
      profile: 'profile',
      help: 'help',
    },
  },
  trainer: {
    base: '/trainer',
    pages: {
      trainer_overview: 'overview',
      trainer_batches: 'batches',
      trainer_trainees: 'trainees',
      trainer_attendance: 'attendance',
      trainer_assessments: 'assessments',
      trainer_skills: 'skill-gap-map',
      trainer_competency: 'competency',
      trainer_interventions: 'interventions',
      trainer_resources: 'resources',
      trainer_reports: 'reports',
      trainer_notifications: 'notifications',
      profile: 'profile',
    },
  },
  admin: {
    base: '/admin',
    pages: {
      admin_overview: 'overview',
      admin_programmes: 'courses',
      admin_nominations: 'nominations',
      admin_timetable: 'timetable',
      admin_certification: 'certification',
      admin_capacity: 'capacity',
      admin_hostel: 'hostel',
      admin_logistics: 'logistics',
      admin_trainers: 'trainers',
      admin_trainees: 'trainees',
      admin_analytics: 'analytics',
      admin_skills: 'skills',
      admin_outreach: 'outreach',
      admin_reports: 'reports',
      admin_network: 'network',
      admin_settings: 'settings',
      profile: 'profile',
    },
  },
};

/** Which portals a signed-in role may open (admins and trainers can switch persona). */
export const ROLE_ACCESS = {
  admin: ['admin', 'trainer', 'trainee'],
  trainer: ['trainer', 'trainee'],
  trainee: ['trainee'],
};

export const canAccessRole = (userRole, portalRole) => !!ROLE_ACCESS[userRole]?.includes(portalRole);

export const homePathFor = role => `${(ROLE_ROUTES[role] ?? ROLE_ROUTES.trainee).base}/overview`;

/** URL for a page id. Prefers the given role's portal (needed for shared ids like "profile"). */
export const pathForTab = (tab, preferredRole) => {
  const order = [preferredRole, 'trainee', 'trainer', 'admin'].filter(Boolean);
  for (const role of order) {
    const segment = ROLE_ROUTES[role]?.pages[tab];
    if (segment) return `${ROLE_ROUTES[role].base}/${segment}`;
  }
  return homePathFor(preferredRole);
};

/** Parses a pathname into { role, tab }, or null when it is not a portal page. */
export const routeFromPath = pathname => {
  for (const [role, { base, pages }] of Object.entries(ROLE_ROUTES)) {
    if (pathname === base || pathname.startsWith(`${base}/`)) {
      const segment = pathname.slice(base.length + 1).split('/')[0];
      const tab = Object.keys(pages).find(id => pages[id] === segment) ?? null;
      return { role, tab };
    }
  }
  return null;
};
