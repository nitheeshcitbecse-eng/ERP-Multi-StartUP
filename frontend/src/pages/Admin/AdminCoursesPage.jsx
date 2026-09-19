import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, BookOpen, LoaderCircle, CircleAlert } from 'lucide-react';
import { useApp } from '../../context/SystemStateContext';
import { COURSE_STATUSES, SCHEDULE_BADGE, STATUS_BADGE, formatDateRange, formatMinutes, statusLabel } from '../../utils/courses';

const FILTERS = [{ value: 'all', label: 'All' }, ...COURSE_STATUSES];

const Badge = ({ tone, children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${tone}`}>{children}</span>
);

const StatTile = ({ label, value, hint }) => (
  <div className="ncct-card ncct-card--flat p-4">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="text-2xl font-semibold text-slate-900 tabular-nums mt-1">{value}</p>
    {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
  </div>
);

const DeleteCourseDialog = ({ course, onCancel, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && !isDeleting && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDeleting, onCancel]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || 'The course could not be deleted.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={e => e.target === e.currentTarget && !isDeleting && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-course-title"
        className="bg-white rounded-2xl w-full max-w-md ring-1 ring-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h2 id="delete-course-title" className="text-base font-semibold text-slate-900">
              Delete “{course.title}”?
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              The course is removed for every trainee
              {course.learners > 0 ? `, including the progress of ${course.learners} ${course.learners === 1 ? 'learner' : 'learners'}` : ''}. This cannot be
              undone. To hide it but keep its records, archive it instead.
            </p>
          </div>
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={isDeleting} className="ncct-btn-secondary disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="ncct-btn-primary bg-red-600! hover:bg-red-700! disabled:opacity-70"
          >
            {isDeleting && <LoaderCircle className="w-4 h-4 animate-spin" />}
            <span>{isDeleting ? 'Deleting…' : 'Delete course'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminCoursesPage = () => {
  const { adminCourses: courses, openCourseEditor, deleteCourse, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseToDelete, setCourseToDelete] = useState(null);

  const institute = currentUser?.institute;

  const counts = useMemo(
    () => ({
      all: courses.length,
      ...Object.fromEntries(COURSE_STATUSES.map(s => [s.value, courses.filter(c => c.status === s.value).length])),
    }),
    [courses]
  );

  const learners = courses.reduce((sum, c) => sum + c.learners, 0);

  const query = searchTerm.trim().toLowerCase();
  const visibleCourses = courses.filter(course => {
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesSearch =
      !query || [course.title, course.code, course.category, course.trainerName].some(v => v?.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 ncct-page-header">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Courses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Trainees{institute ? ` at ${institute}` : ''} see only the courses you publish here.
          </p>
        </div>
        <button onClick={() => openCourseEditor()} className="ncct-btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>New course</span>
        </button>
      </div>

      {!institute && (
        <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Your account is not linked to an institute, so courses cannot be created. Contact support to set your institute.</span>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total courses" value={counts.all} />
        <StatTile label="Published" value={counts.published} hint="Visible to trainees" />
        <StatTile label="Drafts" value={counts.draft} hint="Only visible to admins" />
        <StatTile label="Learners started" value={learners} hint="Across all courses" />
      </div>

      <div className="ncct-card ncct-card--flat overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-slate-200">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search title, code, trainer…"
              aria-label="Search courses"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div role="tablist" aria-label="Filter by visibility" className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {FILTERS.map(filter => {
              const active = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    active ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter.label}
                  <span className={`ml-1.5 tabular-nums ${active ? 'text-slate-500' : 'text-slate-400'}`}>{counts[filter.value]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center text-center px-6 py-16">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-slate-900 mt-4">No courses yet</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Create your first course, add its modules, and publish it when it is ready for trainees.
            </p>
            {institute && (
              <button onClick={() => openCourseEditor()} className="ncct-btn-primary mt-5">
                <Plus className="w-4 h-4" />
                <span>Create a course</span>
              </button>
            )}
          </div>
        ) : visibleCourses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">No courses match your filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 mt-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="py-3 px-4">Course</th>
                  <th scope="col" className="py-3 px-4">Trainer</th>
                  <th scope="col" className="py-3 px-4">Schedule</th>
                  <th scope="col" className="py-3 px-4">Modules</th>
                  <th scope="col" className="py-3 px-4">Learners</th>
                  <th scope="col" className="py-3 px-4">Visibility</th>
                  <th scope="col" className="py-3 px-4 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleCourses.map(course => {
                  const minutes = course.modules.reduce((sum, m) => sum + m.durationMinutes, 0);
                  return (
                    <tr key={course.id} className="hover:bg-slate-50/70 transition-colors align-top">
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{course.code}</span>
                          {course.category && <span className="text-xs text-slate-500 truncate">{course.category}</span>}
                        </div>
                        <p className="font-semibold text-slate-900 mt-1">{course.title}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {course.trainerName || <span className="text-slate-400">Not assigned</span>}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="text-slate-700 tabular-nums text-xs">{formatDateRange(course.startDate, course.endDate)}</p>
                        <div className="mt-1">
                          <Badge tone={SCHEDULE_BADGE[course.schedule]}>{course.schedule}</Badge>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="text-slate-900 tabular-nums">{course.modules.length}</p>
                        <p className="text-xs text-slate-500">{formatMinutes(minutes)}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="text-slate-900 tabular-nums">
                          {course.learners} <span className="text-slate-400">/ {course.seats}</span>
                        </p>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(100, (course.learners / course.seats) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge tone={STATUS_BADGE[course.status]}>{statusLabel(course.status)}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openCourseEditor(course)}
                            aria-label={`Edit ${course.title}`}
                            title="Edit"
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCourseToDelete(course)}
                            aria-label={`Delete ${course.title}`}
                            title="Delete"
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {courseToDelete && (
        <DeleteCourseDialog
          course={courseToDelete}
          onCancel={() => setCourseToDelete(null)}
          onConfirm={async () => {
            await deleteCourse(courseToDelete.id);
            setCourseToDelete(null);
          }}
        />
      )}
    </div>
  );
};
