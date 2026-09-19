import React, { useState } from 'react';
import { X, Building, Search, ShieldCheck, UserCheck, Send } from 'lucide-react';
import { useApp, useData } from '../../context/SystemStateContext';

export const EmployerDashboardPreviewModal = () => {
  const { trainee } = useData();
  const { skills, activeModal, closeModal } = useApp();
  const [invited, setInvited] = useState(false);

  if (activeModal !== 'employer_preview') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-300 space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-teal-400 flex items-center justify-center font-bold shadow-md">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">Cooperative Employer & Recruiter Portal</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                Ecosystem Module
              </span>
            </div>
            <p className="text-xs text-slate-500">
              National Candidate Verification & PACS Placement Ledger
            </p>
          </div>
        </div>

        {/* Recruiter Search Bar Simulation */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-700 block">Candidate Verification Search</span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                readOnly
                value={`Verified Digital ID: ${trainee.digitalId}`}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs tabular-nums font-bold text-indigo-900"
              />
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
              ✓ Verified Candidate
            </span>
          </div>
        </div>

        {/* Candidate Profile Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center gap-4">
            <img
              src={trainee.avatarUrl}
              alt={trainee.name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-100"
            />
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900">{trainee.name}</h4>
              <p className="text-xs text-slate-600 font-medium">{trainee.programme}</p>
              <p className="text-[11px] text-slate-500 tabular-nums">Institute: {trainee.institute}</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed Courses</span>
            <div className="flex flex-wrap gap-1.5">
              {skills.filter(s => s.status === 'completed').map(s => (
                <span key={s.id} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> {s.name} ({s.proficiency}%)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recruiter Action Footer */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">Recruiter Action for TNSC Bank / PACS</span>

          {invited ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Interview Invitation Sent to Arun!</span>
            </div>
          ) : (
            <button
              onClick={() => setInvited(true)}
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4 text-teal-400" />
              <span>Send Placement Offer / Interview Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
