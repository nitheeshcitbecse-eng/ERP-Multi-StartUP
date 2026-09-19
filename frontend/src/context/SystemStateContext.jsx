import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSystemInit } from '../hooks/useSystemInit';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { homePathFor, pathForTab, routeFromPath } from '../routes/routePaths';
import { adminService, traineeService, trainerService, syncService, USE_MOCK } from '../services/api';
import { journeyStagesFromCourses, learningPathFromCourses, skillsFromCourses } from '../utils/traineeRecord';

/**
 * Global state for the whole app, in three slices:
 *   auth – session and token             → useAuth()
 *   data – dashboard data for the role   → useData()
 *   app  – UI state and actions          → useApp()
 */
const SystemStateContext = createContext(undefined);

/** Logs a failed background API call without interrupting the optimistic UI update. */
const reportFailure = action => error => console.error(`[SystemState] ${action} failed:`, error);

export const SystemStateProvider = ({ children }) => {
  const { auth, data } = useSystemInit();

  const navigate = useNavigate();
  const location = useLocation();

  // The URL is the source of truth for which portal and page are showing.
  const route = routeFromPath(location.pathname);
  const userRole = route?.role ?? auth.user?.role ?? 'trainee';
  const activeTab = route?.tab ?? null;

  // Persona switches call setUserRole(role) then setActiveTab(page); the role is held
  // briefly so shared page ids such as "profile" resolve inside the new portal.
  const pendingRoleRef = useRef(null);

  const setUserRole = role => {
    pendingRoleRef.current = role;
    navigate(homePathFor(role));
  };

  const setActiveTab = tab => {
    const role = pendingRoleRef.current ?? userRole;
    const replace = pendingRoleRef.current !== null;
    pendingRoleRef.current = null;
    navigate(pathForTab(tab, role), { replace });
  };
  const [language, setLanguage] = useState('en');
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState('09:42 AM');
  const [pendingSyncCount, setPendingSyncCount] = useState(27);
  const [selectedInstitute, setSelectedInstitute] = useState('ICM Chennai');
  const [selectedConflictItem, setSelectedConflictItem] = useState(null);

  // Once the session exists, the public route guard in routes/AppRoutes.jsx redirects
  // to the requested page or the role's home.
  const login = credentials => auth.login(credentials);
  const signup = details => auth.signup(details);

  const logout = () => auth.logout();

  const [demoMode, setDemoMode] = useState('before');

  const [activeModal, setActiveModal] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(data.certificates?.[0] ?? null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(data.careerOpportunities?.[0] ?? null);
  const [selectedTraineeForDrawer, setSelectedTraineeForDrawer] = useState(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Trainee state
  const [closedLoop, setClosedLoop] = useState(data.closedLoopIntervention ?? null);
  const [assessments, setAssessments] = useState(data.assessments ?? []);
  const [notifications, setNotifications] = useState(data.notifications ?? []);
  const certificates = data.certificates ?? [];
  const opportunities = data.careerOpportunities ?? [];

  // Trainer state
  const [interventions, setInterventions] = useState(data.interventions ?? []);
  const [competencyClaims, setCompetencyClaims] = useState(data.competencyEvidenceClaims ?? []);
  const [trainerNotes, setTrainerNotes] = useState(data.trainerNotes ?? []);
  const [traineeRiskList, setTraineeRiskList] = useState(data.traineeRiskList ?? []);

  // Courses: trainees see the published courses of their institute; admins manage their institute's courses.
  const [courses, setCourses] = useState(data.courses ?? []);
  const [adminCourses, setAdminCourses] = useState(data.adminCourses ?? []);
  const [courseBeingEdited, setCourseBeingEdited] = useState(null);

  // True once the editable copies above hold API data (mock data seeds them on the first render).
  const [isSeeded, setIsSeeded] = useState(USE_MOCK);

  // When fresh data arrives from the API, re-seed the editable copies.
  useEffect(() => {
    if (data.dataStatus !== 'ready') return;
    setIsSeeded(true);
    setClosedLoop(data.closedLoopIntervention ?? null);
    setAssessments(data.assessments ?? []);
    setNotifications(data.notifications ?? []);
    setInterventions(data.interventions ?? []);
    setCompetencyClaims(data.competencyEvidenceClaims ?? []);
    setTrainerNotes(data.trainerNotes ?? []);
    setTraineeRiskList(data.traineeRiskList ?? []);
    setCourses(data.courses ?? []);
    setAdminCourses(data.adminCourses ?? []);
    setSelectedCertificate(prev => prev ?? data.certificates?.[0] ?? null);
    setSelectedOpportunity(prev => prev ?? data.careerOpportunities?.[0] ?? null);
  }, [data.dataStatus, data.interventions, data.courses, data.adminCourses]);

  // The trainee's skills, learning path and journey come from their own course progress.
  const skills = useMemo(() => skillsFromCourses(courses), [courses]);
  const learningPath = useMemo(() => learningPathFromCourses(courses), [courses]);
  const learningJourneyStages = useMemo(
    () => journeyStagesFromCourses(courses, auth.user?.institute),
    [courses, auth.user?.institute]
  );

  const openModal = modalName => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const syncData = async () => {
    setIsSyncing(true);
    try {
      await syncService.syncOfflineRecords();
      setPendingSyncCount(0);
      setLastSyncedTime('Just now');
      setIsOffline(false);
    } catch (error) {
      reportFailure('Sync')(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const markNotificationAsRead = id => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    traineeService.markNotificationRead(id).catch(reportFailure('Mark notification read'));
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const completeBoosterQuiz = score => {
    setClosedLoop(prev => ({
      ...prev,
      afterScore: score,
      status: 'verified',
      interventionCompleted: true,
    }));

    setAssessments(prev =>
      prev.map(a => (a.title.includes('Cooperative Accounting') ? { ...a, score: score, status: 'passed' } : a))
    );

    traineeService.submitBoosterQuiz(score).catch(reportFailure('Submit booster quiz'));
  };

  const createIntervention = (topic, trainees, message, duration) => {
    const newIntervention = {
      id: `INT-2026-0${interventions.length + 1}`,
      topic,
      affectedTraineesCount: trainees.length,
      traineesList: trainees,
      beforeScore: 46,
      afterScore: 74,
      status: 'completed',
      createdDate: 'Today',
      deadline: 'In 3 days',
      trainerMessage: message,
      durationMinutes: duration,
      improvementPoints: 28,
    };
    setInterventions(prev => [newIntervention, ...prev]);
    trainerService.createIntervention({ topic, trainees, message, duration }).catch(reportFailure('Create intervention'));
  };

  const verifyCompetencyClaim = id => {
    setCompetencyClaims(prev => prev.map(c => (c.id === id ? { ...c, status: 'verified' } : c)));
    trainerService.verifyCompetencyClaim(id).catch(reportFailure('Verify competency claim'));
  };

  const addTrainerNote = (traineeId, text) => {
    const newNote = {
      id: `NOTE-${Date.now()}`,
      traineeId,
      noteText: text,
      createdAt: 'Just now',
      isPrivate: true,
    };
    setTrainerNotes(prev => [newNote, ...prev]);
    trainerService.addTraineeNote({ traineeId, text }).catch(reportFailure('Save trainer note'));
  };

  /* ---------------- Courses ---------------- */

  /** Opens the course editor: pass a course to edit it, or nothing to create one. */
  const openCourseEditor = (course = null) => {
    setCourseBeingEdited(course);
    setActiveModal('course_editor');
  };

  // Admins preview the trainee portal, so its course list follows their changes.
  const refreshCourses = () =>
    traineeService
      .getCourses()
      .then(setCourses)
      .catch(reportFailure('Refresh courses'));

  /** Creates or updates a course. Resolves to the saved course; rejects with the API error. */
  const saveCourse = async (form, courseId = null) => {
    const saved = courseId ? await adminService.updateCourse(courseId, form) : await adminService.createCourse(form);
    setAdminCourses(prev => (courseId ? prev.map(c => (c.id === courseId ? saved : c)) : [saved, ...prev]));
    refreshCourses();
    return saved;
  };

  const deleteCourse = async courseId => {
    await adminService.deleteCourse(courseId);
    setAdminCourses(prev => prev.filter(c => c.id !== courseId));
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  /** Marks a module complete (or reopens it) and stores the course the API returns. */
  const setModuleCompleted = async (courseId, moduleId, completed = true) => {
    const updated = await traineeService.setModuleCompleted(courseId, moduleId, completed);
    setCourses(prev => prev.map(c => (c.id === courseId ? updated : c)));
    return updated;
  };

  const app = {
    isAuthenticated: auth.isAuthenticated,
    currentUser: auth.user,
    login,
    signup,
    logout,
    userRole,
    setUserRole,
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    isOffline,
    setIsOffline,
    isSyncing,
    syncData,
    lastSyncedTime,
    pendingSyncCount,
    selectedInstitute,
    setSelectedInstitute,
    selectedConflictItem,
    setSelectedConflictItem,
    demoMode,
    setDemoMode,
    activeModal,
    openModal,
    closeModal,
    selectedCertificate,
    setSelectedCertificate,
    selectedOpportunity,
    setSelectedOpportunity,
    selectedTraineeForDrawer,
    setSelectedTraineeForDrawer,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    closedLoop,
    completeBoosterQuiz,
    interventions,
    createIntervention,
    competencyClaims,
    verifyCompetencyClaim,
    trainerNotes,
    addTrainerNote,
    traineeRiskList,
    skills,
    learningPath,
    learningJourneyStages,
    assessments,
    certificates,
    opportunities,
    notifications,
    markNotificationAsRead,
    unreadNotificationCount,
    courses,
    adminCourses,
    courseBeingEdited,
    openCourseEditor,
    saveCourse,
    deleteCourse,
    setModuleCompleted,
  };

  // Hold the routes back while a stored session is validated, or while a real backend loads data.
  let content = children;
  if (auth.isRestoring) {
    content = <LoadingScreen />;
  } else if (auth.isAuthenticated && !USE_MOCK && (data.dataStatus !== 'ready' || !isSeeded)) {
    content = <LoadingScreen error={data.dataStatus === 'error' ? data.dataError : null} onRetry={data.reloadData} />;
  }

  return <SystemStateContext.Provider value={{ auth, data, app }}>{content}</SystemStateContext.Provider>;
};

export const useSystemState = () => {
  const context = useContext(SystemStateContext);
  if (!context) throw new Error('useSystemState must be used within a SystemStateProvider');
  return context;
};

/** Session: user, isAuthenticated, isRestoring, signedOut, login, signup, logout. */
export const useAuth = () => useSystemState().auth;

/** Dashboard data for the signed-in role, plus dataStatus, dataError and reloadData. */
export const useData = () => useSystemState().data;

/** UI state and actions shared by every page. */
export const useApp = () => useSystemState().app;
