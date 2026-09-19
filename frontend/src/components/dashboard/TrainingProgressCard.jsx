import React from 'react';
import { Award, BookOpen, Calendar, FileText, Wrench } from 'lucide-react';
import { useApp } from '../../context/SystemStateContext';

export const TrainingProgressCard = () => {
  const { courses } = useApp();

  // Module completion across every course the institute has published.
  const totalModules = courses.reduce((sum, c) => sum + c.totalModules, 0);
  const completedModules = courses.reduce((sum, c) => sum + c.completedModules, 0);
  const modulePercentage = totalModules ? Math.round((completedModules * 100) / totalModules) : 0;

  const metrics = [
    {
      label: 'Learning Modules',
      percentage: modulePercentage,
      color: 'bg-emerald-500',
      icon: BookOpen,
      subtext: totalModules ? `${completedModules} of ${totalModules} modules done` : 'No courses published yet',
    },
    { label: 'Attendance Rate', percentage: 92, color: 'bg-teal-500', icon: Calendar, subtext: '23 of 25 sessions' },
    { label: 'Assessment Avg', percentage: 64, color: 'bg-indigo-600', icon: FileText, subtext: '6 tests completed' },
    { label: 'Practical Labs', percentage: 71, color: 'bg-amber-500', icon: Wrench, subtext: 'PACS ERP labs' },
  ];

  return (
    <div className="ncct-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Overall Training Progress</h3>
          <p className="text-xs text-slate-500">
            {courses.length ? `${courses.length} ${courses.length === 1 ? 'course' : 'courses'} from your institute` : 'Across your programme'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>In Progress</span>
        </div>
      </div>

      {/* Main Big Percentage Indicator */}
      <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-indigo-600 transition-all duration-1000 ease-out"
              strokeDasharray="68, 100"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold text-slate-900 leading-none">68%</span>
            <span className="text-[9px] text-slate-500 uppercase font-semibold">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span>Certification Milestone</span>
            <span className="text-indigo-700 font-bold">28 Sep 2026</span>
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            Complete <strong className="text-slate-900 font-semibold">2 remaining assessments</strong> and maintain &gt;85% attendance to unlock your NCCT Credential.
          </p>
        </div>
      </div>

      {/* Progress Bars Breakdown Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="p-3 rounded-lg border border-slate-100 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{metric.label}</span>
                </div>
                <span className="font-bold text-slate-900">{metric.percentage}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${metric.color} transition-all duration-700`}
                  style={{ width: `${metric.percentage}%` }}
                />
              </div>

              <span className="text-[10px] text-slate-500 block truncate">{metric.subtext}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
