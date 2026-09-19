import React, { useState } from 'react';
import { BookOpen, Clock, CalendarDays, User, CircleCheck, Circle, CirclePlay, RotateCcw, LoaderCircle, CircleAlert } from 'lucide-react';
import { useApp } from '../../context/SystemStateContext';
import { SCHEDULE_BADGE, formatDateRange, formatMinutes } from '../../utils/courses';

const ProgressBar = ({ value, className = '' }) => (
  <div
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
    className={`w-full h-2 rounded-full bg-slate-100 overflow-hidden ${className}`}
  >
    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${value}%` }} />
  </div>
);

const MODULE_STATUS = {
  completed: { label: 'Completed', icon: CircleCheck, tone: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  in_progress: { label: 'Up next', icon: CirclePlay, tone: 'text-indigo-600', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  upcoming: { label: 'Not started', icon: Circle, tone: 'text-slate-300', badge: 'bg-slate-50 text-slate-500 ring-slate-200' },
};

export const LearningPage = () => {
  const { courses, setModuleCompleted, currentUser } = useApp();
  const [selectedId, setSelectedId] = useState(null);
  const [pendingModule, setPendingModule] = useState(null);
  const [actionError, setActionError] = useState('');

  const institute = currentUser?.institute;
  // Admins and trainers can preview this page; progress is recorded for trainees only.
  const canTrackProgress = currentUser?.role === 'trainee';

  const selectedCourse = courses.find(c => c.id === selectedId) ?? courses[0];

  const toggleModule = async (course, module) => {
    setPendingModule(module.id);
    setActionError('');
    try {
      await setModuleCompleted(course.id, module.id, module.status !== 'completed');
    } catch (err) {
      setActionError(err.message || 'Your progress could not be saved. Please try again.');
    } finally {
      setPendingModule(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="ncct-page-header">
        <h1 className="text-xl font-semibold text-slate-900">My Courses</h1>
        <p className="text-xs text-slate-500">
          {institute ? `Courses published by ${institute}.` : 'Courses published by your institute.'}
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="ncct-card ncct-card--flat flex flex-col items-center text-center px-6 py-16">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 mt-4">No courses published yet</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Your courses will appear here as soon as {institute ? `the ${institute} administrator` : 'your institution administrator'} publishes
            them.
          </p>
        </div>
      ) : (
        <>
          {/* Course list */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map(course => {
              const isSelected = selectedCourse?.id === course.id;
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setSelectedId(course.id)}
                  aria-pressed={isSelected}
                  className={`text-left p-5 rounded-2xl border bg-white transition-all space-y-4 focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{course.code}</span>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">{course.progress}%</span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 leading-snug">{course.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {course.instructor ? `Trainer: ${course.instructor}` : course.category || 'Trainer to be announced'}
                    </p>
                  </div>

                  <ProgressBar value={course.progress} />

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {course.remainingMinutes ? `${formatMinutes(course.remainingMinutes)} left` : 'All done'}
                    </span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {course.completedModules}/{course.totalModules} modules
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected course */}
          {selectedCourse && (
            <section className="ncct-card ncct-card--flat p-6 space-y-6" aria-labelledby="selected-course-title">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 pb-5 border-b border-slate-100">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-indigo-700">{selectedCourse.code}</span>
                    {selectedCourse.category && <span className="text-xs text-slate-500">· {selectedCourse.category}</span>}
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${SCHEDULE_BADGE[selectedCourse.schedule]}`}
                    >
                      {selectedCourse.schedule}
                    </span>
                  </div>
                  <h2 id="selected-course-title" className="text-xl font-semibold text-slate-900">
                    {selectedCourse.title}
                  </h2>
                  {selectedCourse.description && <p className="text-sm text-slate-600 leading-relaxed">{selectedCourse.description}</p>}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {selectedCourse.instructor || 'Trainer to be announced'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateRange(selectedCourse.startDate, selectedCourse.endDate)}
                    </span>
                  </div>
                </div>

                <div className="lg:w-60 shrink-0 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-slate-500">Your progress</span>
                    <span className="text-lg font-semibold text-slate-900 tabular-nums">{selectedCourse.progress}%</span>
                  </div>
                  <ProgressBar value={selectedCourse.progress} />
                  <p className="text-xs text-slate-500">
                    {selectedCourse.completedModules} of {selectedCourse.totalModules} modules complete
                  </p>
                </div>
              </div>

              {!canTrackProgress && (
                <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  You are previewing the trainee view. Progress is recorded only for trainee accounts.
                </p>
              )}

              {actionError && (
                <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modules</h3>

                {selectedCourse.modules.length === 0 ? (
                  <p className="text-sm text-slate-500">Modules for this course have not been added yet.</p>
                ) : (
                  <ol className="space-y-2">
                    {selectedCourse.modules.map((module, index) => {
                      const status = MODULE_STATUS[module.status];
                      const StatusIcon = status.icon;
                      const isPending = pendingModule === module.id;
                      const isDone = module.status === 'completed';
                      return (
                        <li
                          key={module.id}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            module.status === 'in_progress' ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <StatusIcon className={`w-5 h-5 mt-0.5 shrink-0 ${status.tone}`} aria-hidden="true" />
                            <div className="min-w-0 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-medium text-slate-500">Module {index + 1}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${status.badge}`}>
                                  {status.label}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-slate-900">{module.title}</h4>
                              {module.topics.length > 0 && (
                                <ul className="flex flex-wrap gap-1.5">
                                  {module.topics.map(topic => (
                                    <li key={topic} className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                      {topic}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:shrink-0 pl-8 sm:pl-0">
                            <span className="text-xs text-slate-500 tabular-nums flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> {formatMinutes(module.durationMinutes)}
                            </span>
                            {canTrackProgress && (
                              <button
                                type="button"
                                onClick={() => toggleModule(selectedCourse, module)}
                                disabled={pendingModule !== null}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${
                                  isDone
                                    ? 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
                                    : 'text-white bg-indigo-600 hover:bg-indigo-700'
                                }`}
                              >
                                {isPending ? (
                                  <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                                ) : isDone ? (
                                  <RotateCcw className="w-3.5 h-3.5" />
                                ) : (
                                  <CircleCheck className="w-3.5 h-3.5" />
                                )}
                                {isDone ? 'Mark as not done' : 'Mark complete'}
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
