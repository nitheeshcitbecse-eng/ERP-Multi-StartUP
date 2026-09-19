import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/SystemStateContext';
import { formatMinutes } from '../../utils/courses';

export const SkillsPage = () => {
  const { skills, setActiveTab } = useApp();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ncct-page-header">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Skill Profile & Evidence Ledger</h1>
          <p className="text-xs text-slate-500">Built from the course modules you have completed</p>
        </div>

        <button
          onClick={() => setActiveTab('learning')}
          className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Go to My Learning</span>
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="ncct-card p-8 text-center space-y-2">
          <h3 className="text-lg font-semibold text-slate-900">No skills recorded yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your skills appear here as you complete modules in the courses your institute publishes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map(skill => {
            const isCompleted = skill.status === 'completed';

            return (
              <div key={skill.id} className="ncct-card p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{skill.name}</h3>
                    <span className="text-xs text-slate-500 font-medium">Category: {skill.category}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-semibold text-slate-900 block">{skill.proficiency}%</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {isCompleted ? '✓ Completed' : '● Developing'}
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {skill.completedModules} of {skill.totalModules} modules completed
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Evidence Ledger ({skill.evidence.length} {skill.evidence.length === 1 ? 'Record' : 'Records'})
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {skill.evidence.map((ev, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 block">{ev.assessmentName}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {ev.topics.length ? ev.topics.join(' · ') : ev.source}
                          </span>
                        </div>
                        <span className="shrink-0 flex items-center gap-1 font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {ev.durationMinutes ? formatMinutes(ev.durationMinutes) : 'Done'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
