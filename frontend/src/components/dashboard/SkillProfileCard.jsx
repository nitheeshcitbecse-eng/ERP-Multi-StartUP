import React from 'react';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/SystemStateContext';

export const SkillProfileCard = () => {
  const { skills, setActiveTab } = useApp();

  const completedCount = skills.filter(s => s.status === 'completed').length;
  const developingCount = skills.filter(s => s.status === 'developing').length;

  return (
    <div className="ncct-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">My Skill Profile</h3>
          <p className="text-xs text-slate-500">Built from the modules you have completed</p>
        </div>
        <button
          onClick={() => setActiveTab('skills')}
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
        >
          <span>View Full Skill Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Summary Pill Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
          ✓ {completedCount} Completed
        </span>
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200">
          ● {developingCount} Developing
        </span>
      </div>

      {skills.length === 0 && (
        <p className="text-xs text-slate-500">Complete a module in My Learning to start your skill profile.</p>
      )}

      {/* Skill Visual Bars */}
      <div className="space-y-3 pt-1">
        {skills.map(skill => {
          const isCompleted = skill.status === 'completed';

          return (
            <div key={skill.id} className="space-y-1.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{skill.name}</span>
                  {isCompleted ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Completed
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-medium">
                      Developing
                    </span>
                  )}
                </div>
                <span className="font-bold text-slate-900">{skill.proficiency}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${skill.proficiency}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Category: {skill.category}</span>
                <span>{skill.completedModules} of {skill.totalModules} modules completed</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
