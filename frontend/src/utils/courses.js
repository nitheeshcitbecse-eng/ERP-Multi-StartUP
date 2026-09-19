/**
 * utils/courses.js
 * Display helpers shared by the admin course manager and the trainee learning page.
 */

export const COURSE_STATUSES = [
  { value: 'draft', label: 'Draft', hint: 'Only admins can see it.' },
  { value: 'published', label: 'Published', hint: 'Visible to trainees at your institute.' },
  { value: 'archived', label: 'Archived', hint: 'Hidden from trainees; kept for records.' },
];

export const statusLabel = status => COURSE_STATUSES.find(s => s.value === status)?.label ?? status;

export const STATUS_BADGE = {
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  archived: 'bg-amber-50 text-amber-800 ring-amber-200',
};

export const SCHEDULE_BADGE = {
  Upcoming: 'bg-sky-50 text-sky-700 ring-sky-200',
  Ongoing: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Completed: 'bg-slate-100 text-slate-600 ring-slate-200',
  Unscheduled: 'bg-slate-50 text-slate-500 ring-slate-200',
};

/** "2026-09-18" -> "18 Sep 2026" (no timezone shift). */
export const formatDate = iso => {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateRange = (start, end) => {
  if (!start && !end) return 'Dates not set';
  if (!end) return `From ${formatDate(start)}`;
  if (!start) return `Until ${formatDate(end)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
};

/** 95 -> "1h 35m", 40 -> "40m". */
export const formatMinutes = minutes => {
  const total = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};
