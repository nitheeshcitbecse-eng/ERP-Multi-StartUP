import React from 'react';
import { Building2, MapPin, QrCode } from 'lucide-react';
import { useApp, useData } from '../../context/SystemStateContext';

export const ProfilePage = () => {
  const { trainee } = useData();
  const { openModal, skills } = useApp();

  return (
    <div className="space-y-6 pb-12">
      <div className="ncct-card p-6 ncct-chrome text-white space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={trainee.avatarUrl}
              alt={trainee.name}
              className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{trainee.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Verified Trainee
                </span>
              </div>
              <p className="text-xs tabular-nums text-indigo-200">NCCT Digital ID: {trainee.digitalId}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-300 pt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" /> {trainee.institute}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {trainee.location}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => openModal('qr_verify')}
            className="px-5 py-2.5 rounded-full bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            <QrCode className="w-4 h-4 text-slate-950" />
            <span>Verify NCCT Profile</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <span>Profile Completion Rate</span>
            <span className="text-emerald-400 font-bold">{trainee.profileCompletion}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-400 w-[88%]" />
          </div>
          <div className="flex items-center justify-between text-xs text-indigo-200 pt-1">
            <span>Missing: <strong>Career Preferences & Location Mobility</strong></span>
            <button
              onClick={() => alert('Opening profile editor modal...')}
              className="text-emerald-300 font-bold underline hover:text-emerald-200"
            >
              Complete Profile (+12%)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="ncct-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">Personal & Training Details</h3>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-semibold text-slate-900">{trainee.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Government Email:</span>
              <span className="tabular-nums text-slate-800">{trainee.email}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Mobile Phone:</span>
              <span className="tabular-nums text-slate-800">{trainee.phone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Programme Name:</span>
              <span className="font-semibold text-indigo-900">{trainee.programme}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Batch Code:</span>
              <span className="tabular-nums text-slate-800">{trainee.batch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Training Period:</span>
              <span className="font-medium text-slate-800">{trainee.trainingPeriod}</span>
            </div>
          </div>
        </div>

        <div className="ncct-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">Skills Ledger Summary</h3>
          <div className="space-y-2">
            {skills.length === 0 && (
              <p className="text-xs text-slate-500">No skills yet — they appear as you complete course modules.</p>
            )}
            {skills.map(s => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{s.name}</h4>
                  <span className="text-[10px] text-slate-500">{s.category}</span>
                </div>
                <span className="font-bold text-emerald-700">{s.proficiency}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
