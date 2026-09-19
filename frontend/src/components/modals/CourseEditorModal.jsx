import React, { useEffect, useState } from 'react';
import { X, BookOpen, Plus, Trash2, ArrowUp, ArrowDown, LoaderCircle, CircleAlert, Layers } from 'lucide-react';
import { useApp } from '../../context/SystemStateContext';
import { COURSE_STATUSES } from '../../utils/courses';

// Local key for list rendering; the server assigns the module id on save.
const newKey = () => `new-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const emptyModule = () => ({ key: newKey(), id: null, title: '', durationMinutes: 30, topics: '' });

const formFromCourse = course => ({
  title: course?.title ?? '',
  code: course?.code ?? '',
  category: course?.category ?? '',
  trainerName: course?.trainerName ?? '',
  description: course?.description ?? '',
  startDate: course?.startDate ?? '',
  endDate: course?.endDate ?? '',
  seats: course?.seats ?? 40,
  status: course?.status ?? 'draft',
  modules: course?.modules?.length
    ? course.modules.map(m => ({
        key: m.id,
        id: m.id,
        title: m.title,
        durationMinutes: m.durationMinutes,
        topics: m.topics.join(', '),
      }))
    : [emptyModule()],
});

const validate = form => {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Enter a course title.';
  if (!form.code.trim()) errors.code = 'Enter a course code.';
  const seats = Number(form.seats);
  if (!Number.isInteger(seats) || seats < 1) errors.seats = 'Seats must be a whole number of at least 1.';
  if (form.startDate && form.endDate && form.endDate < form.startDate) errors.endDate = 'End date must be on or after the start date.';
  form.modules.forEach((m, i) => {
    if (!m.title.trim()) errors[`module-${i}-title`] = 'Enter a module title.';
    const minutes = Number(m.durationMinutes);
    if (!Number.isInteger(minutes) || minutes < 1) errors[`module-${i}-duration`] = 'Minutes must be at least 1.';
  });
  if (form.status === 'published' && form.modules.length === 0) {
    errors.modules = 'Add at least one module before publishing.';
  }
  return errors;
};

const inputClass = hasError =>
  `w-full px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-shadow ${
    hasError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
  }`;

const Field = ({ label, htmlFor, optional, error, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label htmlFor={htmlFor} className="flex items-baseline justify-between text-xs font-semibold text-slate-700">
      <span>{label}</span>
      {optional && <span className="font-normal text-slate-400">Optional</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export const CourseEditorModal = () => {
  const { activeModal, courseBeingEdited } = useApp();
  if (activeModal !== 'course_editor') return null;
  // Keyed so the form starts fresh every time the editor opens.
  return <CourseEditorForm key={courseBeingEdited?.id ?? 'new'} course={courseBeingEdited} />;
};

const CourseEditorForm = ({ course }) => {
  const { closeModal, saveCourse, currentUser } = useApp();
  const isEditing = !!course;

  const [form, setForm] = useState(() => formFromCourse(course));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && !isSaving) closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSaving, closeModal]);

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const setModule = (index, field, value) =>
    setForm(prev => ({ ...prev, modules: prev.modules.map((m, i) => (i === index ? { ...m, [field]: value } : m)) }));

  const addModule = () => setForm(prev => ({ ...prev, modules: [...prev.modules, emptyModule()] }));

  const removeModule = index => setForm(prev => ({ ...prev, modules: prev.modules.filter((_, i) => i !== index) }));

  const moveModule = (index, offset) =>
    setForm(prev => {
      const modules = [...prev.modules];
      const target = index + offset;
      if (target < 0 || target >= modules.length) return prev;
      [modules[index], modules[target]] = [modules[target], modules[index]];
      return { ...prev, modules };
    });

  const handleSubmit = async e => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setIsSaving(true);
    setSubmitError('');
    try {
      await saveCourse(
        {
          ...form,
          title: form.title.trim(),
          code: form.code.trim(),
          modules: form.modules.map(m => ({
            id: m.id,
            title: m.title.trim(),
            durationMinutes: Number(m.durationMinutes),
            topics: m.topics
              .split(',')
              .map(t => t.trim())
              .filter(Boolean),
          })),
        },
        course?.id ?? null
      );
      closeModal();
    } catch (err) {
      setSubmitError(err.message || 'The course could not be saved. Please try again.');
      setIsSaving(false);
    }
  };

  const totalMinutes = form.modules.reduce((sum, m) => sum + (Number(m.durationMinutes) || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={e => e.target === e.currentTarget && !isSaving && closeModal()}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-editor-title"
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col ring-1 ring-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="course-editor-title" className="text-base font-semibold text-slate-900">
                {isEditing ? 'Edit course' : 'New course'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser?.institute
                  ? `Published courses are visible to trainees at ${currentUser.institute}.`
                  : 'Published courses are visible to trainees at your institute.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            disabled={isSaving}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {submitError && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Details */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Course details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Title" htmlFor="course-title" error={errors.title} className="sm:col-span-2">
                <input
                  id="course-title"
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  placeholder="e.g. Cooperative Accounting Essentials"
                  className={inputClass(errors.title)}
                  maxLength={255}
                  autoFocus
                />
              </Field>
              <Field label="Code" htmlFor="course-code" error={errors.code}>
                <input
                  id="course-code"
                  value={form.code}
                  onChange={e => setField('code', e.target.value.toUpperCase())}
                  placeholder="e.g. CAE-101"
                  className={inputClass(errors.code)}
                  maxLength={100}
                />
              </Field>
              <Field label="Category" htmlFor="course-category" optional>
                <input
                  id="course-category"
                  value={form.category}
                  onChange={e => setField('category', e.target.value)}
                  placeholder="e.g. Finance & Accounts"
                  className={inputClass(false)}
                  maxLength={100}
                />
              </Field>
              <Field label="Trainer" htmlFor="course-trainer" optional className="sm:col-span-2">
                <input
                  id="course-trainer"
                  value={form.trainerName}
                  onChange={e => setField('trainerName', e.target.value)}
                  placeholder="Name of the lead trainer"
                  className={inputClass(false)}
                  maxLength={255}
                />
              </Field>
              <Field label="Description" htmlFor="course-description" optional className="sm:col-span-3">
                <textarea
                  id="course-description"
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="What trainees will learn in this course"
                  rows={3}
                  className={`${inputClass(false)} resize-y`}
                  maxLength={5000}
                />
              </Field>
            </div>
          </section>

          {/* Schedule */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule & capacity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Start date" htmlFor="course-start" optional>
                <input
                  id="course-start"
                  type="date"
                  value={form.startDate}
                  onChange={e => setField('startDate', e.target.value)}
                  className={inputClass(false)}
                />
              </Field>
              <Field label="End date" htmlFor="course-end" optional error={errors.endDate}>
                <input
                  id="course-end"
                  type="date"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={e => setField('endDate', e.target.value)}
                  className={inputClass(errors.endDate)}
                />
              </Field>
              <Field label="Seats" htmlFor="course-seats" error={errors.seats}>
                <input
                  id="course-seats"
                  type="number"
                  min={1}
                  step={1}
                  value={form.seats}
                  onChange={e => setField('seats', e.target.value)}
                  className={inputClass(errors.seats)}
                />
              </Field>
            </div>
          </section>

          {/* Modules */}
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modules</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {form.modules.length} {form.modules.length === 1 ? 'module' : 'modules'} · {totalMinutes} minutes in total
                </p>
              </div>
              <button
                type="button"
                onClick={addModule}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" /> Add module
              </button>
            </div>

            {errors.modules && <p className="text-xs text-red-600">{errors.modules}</p>}

            {form.modules.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-1 py-6 rounded-xl border border-dashed border-slate-300 text-slate-500">
                <Layers className="w-5 h-5 text-slate-400" />
                <p className="text-sm">No modules yet.</p>
                <p className="text-xs">Trainees work through modules in the order listed here.</p>
              </div>
            ) : (
              <ol className="space-y-3">
                {form.modules.map((m, index) => (
                  <li key={m.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500">Module {index + 1}</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveModule(index, -1)}
                          disabled={index === 0}
                          aria-label={`Move module ${index + 1} up`}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveModule(index, 1)}
                          disabled={index === form.modules.length - 1}
                          aria-label={`Move module ${index + 1} down`}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeModule(index)}
                          aria-label={`Remove module ${index + 1}`}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <Field label="Title" htmlFor={`module-${m.key}-title`} error={errors[`module-${index}-title`]} className="sm:col-span-3">
                        <input
                          id={`module-${m.key}-title`}
                          value={m.title}
                          onChange={e => setModule(index, 'title', e.target.value)}
                          placeholder="e.g. Principles of cooperative accounting"
                          className={inputClass(errors[`module-${index}-title`])}
                          maxLength={200}
                        />
                      </Field>
                      <Field label="Minutes" htmlFor={`module-${m.key}-duration`} error={errors[`module-${index}-duration`]}>
                        <input
                          id={`module-${m.key}-duration`}
                          type="number"
                          min={1}
                          step={5}
                          value={m.durationMinutes}
                          onChange={e => setModule(index, 'durationMinutes', e.target.value)}
                          className={inputClass(errors[`module-${index}-duration`])}
                        />
                      </Field>
                      <Field label="Topics" htmlFor={`module-${m.key}-topics`} optional className="sm:col-span-4">
                        <input
                          id={`module-${m.key}-topics`}
                          value={m.topics}
                          onChange={e => setModule(index, 'topics', e.target.value)}
                          placeholder="Separate topics with commas"
                          className={inputClass(false)}
                        />
                      </Field>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Visibility */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visibility</h3>
            <div role="radiogroup" aria-label="Visibility" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {COURSE_STATUSES.map(option => {
                const selected = form.status === option.value;
                return (
                  <label
                    key={option.value}
                    className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                      selected ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="course-status"
                      value={option.value}
                      checked={selected}
                      onChange={() => setField('status', option.value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{option.hint}</span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button type="button" onClick={closeModal} disabled={isSaving} className="ncct-btn-secondary disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="ncct-btn-primary disabled:opacity-70">
            {isSaving && <LoaderCircle className="w-4 h-4 animate-spin" />}
            <span>{isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Create course'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
