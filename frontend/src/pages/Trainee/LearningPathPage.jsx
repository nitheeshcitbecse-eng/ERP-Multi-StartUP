import React from 'react';
import { LearningPathRoadmap } from '../../components/dashboard/LearningPathRoadmap';

export const LearningPathPage = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ncct-page-header">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Learning Path</h1>
          <p className="text-xs text-slate-500">Your institute's courses in order, and how far you have got in each</p>
        </div>
      </div>

      <LearningPathRoadmap />
    </div>
  );
};
