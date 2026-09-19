import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/SystemStateContext';

export const LearningPathRoadmap = () => {
  const { setActiveTab, learningPath } = useApp();

  const [selectedId, setSelectedId] = useState(null);
  const selectedNode =
    learningPath.find(n => n.id === selectedId) ??
    learningPath.find(n => n.status === 'current') ??
    learningPath[learningPath.length - 1];

  return (
    <div className="ncct-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Personalized Learning Path</h3>
          <p className="text-xs text-slate-500">The courses your institute has published, with your progress</p>
        </div>
        <button
          onClick={() => setActiveTab('learning')}
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
        >
          <span>Open My Learning</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {learningPath.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">
          No courses have been published for you yet. Your learning path appears here once your institute publishes one.
        </p>
      ) : (
        <>
          {/* Course Stepper Roadmap */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
            {learningPath.map((node, index) => {
              const isCompleted = node.status === 'completed';
              const isCurrent = node.status === 'current';
              const isSelected = selectedNode.id === node.id;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedId(node.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-28 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-900 shadow-md ring-2 ring-indigo-300'
                      : isCompleted
                      ? 'bg-emerald-50/70 border-emerald-200 text-slate-900 hover:bg-emerald-100/50'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  } ${isSelected && !isCurrent ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold ${isCurrent ? 'text-indigo-200' : 'text-slate-500'}`}>
                      Course {String(index + 1).padStart(2, '0')}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  <h4 className={`text-xs font-bold leading-tight line-clamp-2 ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                    {node.title}
                  </h4>

                  <span
                    className={`text-[9px] uppercase font-semibold ${
                      isCurrent ? 'text-emerald-300' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? `Active • ${node.progress}%` : `Upcoming • ${node.progress}%`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Course Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900">{selectedNode.title}</h4>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                  {selectedNode.duration} • {selectedNode.completedModules}/{selectedNode.totalModules} Modules
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {selectedNode.dates}
                {selectedNode.instructor && (
                  <>
                    {' '}• Trainer: <strong>{selectedNode.instructor}</strong>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Modules</span>
                <ul className="space-y-1 text-slate-700">
                  {selectedNode.modules.map(m => (
                    <li key={m.id} className="flex items-center gap-1.5">
                      {m.status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                      <span className={m.status === 'completed' ? 'text-slate-900' : 'text-slate-500'}>{m.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Topics Covered</span>
                {selectedNode.topicsCovered.length ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.topicsCovered.map(topic => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 rounded-full bg-white text-indigo-950 font-semibold border border-slate-200 text-[11px] flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">Complete a module to cover its topics.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
