import React from 'react';
import {
  BookOpen,
  Users,
  UserCheck,
  Gauge,
  Award,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Plus,
  Sparkles,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { useApp, useData } from '../../context/SystemStateContext';
import { t } from '../../utils/i18n';

export const AdminOverviewPage = () => {
  const { operationalSignals, demandSignals, networkInstitutes } = useData();
  const { setActiveTab, openModal, openCourseEditor, setSelectedConflictItem, isOffline, syncData, isSyncing, pendingSyncCount, language } = useApp();

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <section className="ncct-hero">
        <img
          className="ncct-hero-media"
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000"
          alt=""
        />
        <div className="ncct-hero-scrim" />
        <div className="ncct-hero-inner space-y-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-sm font-medium ring-1 ring-white/25">
              NCCT Admin Command
            </span>
            <h1 className="text-4xl sm:text-5xl">{t('greeting', language)}</h1>
            <p className="text-lg text-white/85 leading-relaxed">
              {t('greetingSub', language)} · 10 September 2026
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => openCourseEditor()} className="ncct-btn-light">
              <Plus className="w-4 h-4" />
              <span>{t('btnCreateProg', language)}</span>
            </button>
            <button onClick={() => setActiveTab('admin_nominations')} className="ncct-btn-outline-light">
              {t('btnManageNom', language)}
            </button>
            <button onClick={() => openModal('schedule_session')} className="ncct-btn-outline-light">
              {t('btnScheduleSess', language)}
            </button>
            <button onClick={() => setActiveTab('admin_capacity')} className="ncct-btn-outline-light">
              {t('btnAllocateRes', language)}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1 — EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('kpiActiveProg', language)}</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-slate-900">42</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" /> +8.4% vs prev month
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('kpiTrainees', language)}</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-slate-900">1,284</div>
          <div className="text-[10px] text-slate-500 font-medium">92% active participation</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('kpiSeats', language)}</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-slate-900">316</div>
          <div className="text-[10px] text-slate-500 font-medium">Across active batches</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('kpiCapacity', language)}</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Gauge className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-teal-700">82%</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" /> +6.2% this month
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('kpiCertReady', language)}</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-indigo-900">74%</div>
          <div className="text-[10px] text-slate-500 font-medium">947 trainees on track</div>
        </div>

        {/* Card 6 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('kpiEmployed', language)}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-emerald-700">438</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" /> +12% this quarter
          </div>
        </div>
      </div>

      {/* SECTION 2 — "WHAT NEEDS YOUR ATTENTION?" AI PRIORITY PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900">{t('attentionTitle', language)}</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold border border-amber-200">
                5 Active Signals
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t('attentionSub', language)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {operationalSignals.map(sig => (
            <div
              key={sig.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                sig.severity === 'HIGH'
                  ? 'bg-red-50/40 border-red-200/80 hover:border-red-300'
                  : sig.severity === 'MEDIUM'
                  ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300'
                  : 'bg-emerald-50/30 border-emerald-200/80 hover:border-emerald-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase ${
                    sig.severity === 'HIGH'
                      ? 'bg-red-600 text-white'
                      : sig.severity === 'MEDIUM'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {sig.category}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-nums font-bold">{sig.id}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{sig.title}</h3>
                <p className="text-xs text-slate-600">{sig.description}</p>
                <p className="text-[11px] font-semibold text-slate-800 bg-white/70 p-2 rounded-lg border border-slate-200/60">
                  ⚡ Impact: {sig.impactText}
                </p>
              </div>

              <button
                onClick={() => {
                  if (sig.category === 'TRAINER CONFLICT') {
                    openModal('schedule_session');
                  } else if (sig.category === 'CAPACITY GAP') {
                    openCourseEditor();
                  } else if (sig.category === 'HOSTEL PRESSURE') {
                    setActiveTab('admin_hostel');
                  } else {
                    setActiveTab('admin_capacity');
                  }
                }}
                className="w-full py-1.5 px-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{sig.actionText}</span>
                <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3 — NCCT NETWORK COMMAND CENTRE MAP */}
      <div className="ncct-chrome text-white rounded-2xl p-6 shadow-xl space-y-6 border border-indigo-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-semibold text-white">NCCT Network Command Centre</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold border border-teal-400/30">
                20 Institutes Connected
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Realtime view of training demand, seat capacity and programme delivery across connected institutes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('admin_network')}
              className="px-3.5 py-2 rounded-full bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors"
            >
              View Full Network Map
            </button>
          </div>
        </div>

        {/* Network Nodes Representation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {networkInstitutes.map(inst => (
            <div
              key={inst.id}
              className="p-4 rounded-xl bg-indigo-900/50 border border-indigo-800/80 space-y-3 hover:border-teal-400/60 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{inst.name}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  inst.status === 'Healthy'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : inst.status === 'High Demand'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                }`}>
                  ● {inst.status}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-indigo-200 font-medium">
                  <span>Capacity Utilisation</span>
                  <span className="font-bold text-teal-300">{inst.capacityUtilisation}%</span>
                </div>
                <div className="w-full bg-indigo-600 h-2 rounded-full overflow-hidden border border-indigo-800">
                  <div
                    className="bg-teal-500 h-full rounded-full"
                    style={{ width: `${inst.capacityUtilisation}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-indigo-300 pt-1 tabular-nums">
                <span>Active: {inst.activeProgrammes} Prog</span>
                <span>Seats: {inst.filledSeats}/{inst.totalSeats}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4 — TRAINING DEMAND RADAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Training Demand Radar</h2>
            <p className="text-xs text-slate-500">
              Where demand is rising and where NCCT has available capacity across regional institutes.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('admin_capacity')}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
          >
            Open Demand Intelligence <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demandSignals.map(item => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{item.programmeName}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  item.demandLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Demand: {item.demandLevel} ↑
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-semibold block uppercase">Capacity</span>
                  <span className="font-bold text-slate-900">{item.currentCapacity}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-semibold block uppercase">Required</span>
                  <span className="font-bold text-slate-900">{item.requiredCapacity}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-semibold block uppercase">Gap/Surplus</span>
                  <span className={`font-bold ${item.gapOrSurplus < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {item.gapOrSurplus > 0 ? `+${item.gapOrSurplus}` : item.gapOrSurplus}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-indigo-950 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Recommendation: {item.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 12 — INPUT → OUTPUT PIPELINE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Training Outcomes (Input → Output Pipeline)</h2>
            <p className="text-xs text-slate-500">
              Moving beyond "How many trained?" to "What changed and who is employed?"
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Trained</span>
            <span className="text-xl font-semibold text-slate-900">1,284</span>
            <span className="text-[10px] text-slate-500 block">Enrolled Candidates</span>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[10px] text-indigo-600 font-bold uppercase block">2. Completed</span>
            <span className="text-xl font-semibold text-indigo-950">1,176</span>
            <span className="text-[10px] text-indigo-700 block">Course Completed</span>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100">
            <span className="text-[10px] text-teal-600 font-bold uppercase block">3. Certified</span>
            <span className="text-xl font-semibold text-teal-900">947</span>
            <span className="text-[10px] text-teal-700 block">Assessment Passed</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
            <span className="text-[10px] text-amber-700 font-bold uppercase block">4. Verified</span>
            <span className="text-xl font-semibold text-amber-950">812</span>
            <span className="text-[10px] text-amber-800 block">Skill Verified</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">5. Employed</span>
            <span className="text-xl font-semibold text-emerald-800">438</span>
            <span className="text-[10px] text-emerald-700 block">Career Linked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
