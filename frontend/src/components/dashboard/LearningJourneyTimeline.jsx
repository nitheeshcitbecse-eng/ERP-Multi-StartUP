import React, { useState } from 'react';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../context/SystemStateContext';

export const LearningJourneyTimeline = () => {
  const { learningJourneyStages } = useApp();
  const [selectedId, setSelectedId] = useState(null);
  const currentIndex = learningJourneyStages.findIndex(s => s.status === 'current');
  const currentStage = learningJourneyStages[currentIndex] ?? learningJourneyStages[learningJourneyStages.length - 1];
  const selectedStage = learningJourneyStages.find(s => s.id === selectedId) ?? currentStage;
  const stageNumber = currentIndex === -1 ? learningJourneyStages.length : currentIndex + 1;

  return (
    <div className="ncct-card p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">Continuous NCCT Learning Journey</h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold ">
              Single Digital Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Your progress so far, from registration to completing your courses. Click any stage to see details.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold bg-indigo-50 px-3 py-1 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Stage {stageNumber} of {learningJourneyStages.length}: {currentStage.name}</span>
        </div>
      </div>

      {/* Horizontal Interactive Journey Pipeline */}
      <div className="relative pt-2 pb-4 overflow-x-auto no-scrollbar">
        {/* Connection Line */}
        <div className="absolute top-7 left-4 right-4 h-1 bg-slate-200 -z-0 rounded" />
        
        <div className="flex items-center justify-between min-w-[560px] px-2 relative z-10">
          {learningJourneyStages.map((stage, index) => {
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isSelected = selectedStage.id === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedId(stage.id)}
                className="flex flex-col items-center gap-2 group focus:outline-hidden"
              >
                {/* Node Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ring-4 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-emerald-100 group-hover:scale-110'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-indigo-200 animate-pulse shadow-md'
                      : 'bg-white text-slate-400 border-2 border-slate-300 ring-transparent group-hover:border-indigo-400'
                  } ${isSelected ? 'scale-110 ring-indigo-400' : ''}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Stage Name Label */}
                <span
                  className={`text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-indigo-900 font-bold'
                      : isSelected
                      ? 'text-indigo-700'
                      : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  {stage.name}
                </span>

                {/* Status Dot */}
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isCurrent
                      ? 'bg-indigo-100 text-indigo-900 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Upcoming'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="p-4 rounded-xl bg-slate-50/40 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Stage: {selectedStage.name}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-medium">{selectedStage.description}</p>
        </div>

        <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Milestone</span>
            <span className="font-semibold text-slate-800">{selectedStage.milestone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
