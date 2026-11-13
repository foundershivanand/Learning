'use client';

import React from 'react';
import { 
  Flame, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  Compass, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Clock,
  Globe
} from 'lucide-react';
import { TodayDashboardResponse, RealityMission } from '@personal-mentor/shared';

interface HomeViewProps {
  data: TodayDashboardResponse;
  realityMission: RealityMission | null;
  onStartTraining: () => void;
  onOpenSkills: () => void;
  onOpenReality: () => void;
  onOpenAllLinks?: () => void;
}

export function HomeView({
  data,
  realityMission,
  onStartTraining,
  onOpenSkills,
  onOpenReality,
  onOpenAllLinks,
}: HomeViewProps) {
  const { profile, dailyPlan, gamification, trainingDebt, primaryWeakness, skillsOverview } = data;
  const avgLevelNum = skillsOverview && skillsOverview.length > 0
    ? skillsOverview.reduce((acc, s) => acc + s.overallLevel + s.overallSublevel / 10, 0) / skillsOverview.length
    : 1.1;
  const currentLevelStr = `Level ${avgLevelNum.toFixed(1)}`;
  const tierNumber = Math.max(1, Math.floor(avgLevelNum));

  return (
    <div className="flex flex-col gap-6 pb-24 pt-2 max-w-7xl mx-auto w-full">
      {/* Top 3 Stat Banners for Desktop / Mobile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Current Level */}
        <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-mentor-muted">Current Ability Level</span>
            <div className="text-2xl font-black text-mentor-accent mt-0.5">{currentLevelStr}</div>
            <div className="text-xs text-gray-400 mt-1">Tier: Level {tierNumber} (Sublevel {Math.round((avgLevelNum % 1) * 10)}/10)</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-mentor-accent/10 border border-mentor-accent/30 flex items-center justify-center text-mentor-accent">
            <Award size={24} />
          </div>
        </div>

        {/* Stat 2: Daily Consistency & Streak */}
        <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-mentor-muted">Operating Rhythm</span>
            <div className="text-2xl font-black text-white mt-0.5 flex items-center gap-1.5">
              <Flame size={20} className="fill-mentor-accent text-mentor-accent" />
              <span>{gamification.currentStreakDays} Days</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Daily Target: {dailyPlan.targetMinutes} Mins Practice</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#1c1308] border border-amber-900/50 flex items-center justify-center text-mentor-accent">
            <Clock size={24} />
          </div>
        </div>

        {/* Stat 3: Training Debt & Accountability */}
        <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-mentor-muted">Training Debt</span>
            <div className={`text-2xl font-black mt-0.5 ${trainingDebt.totalActiveDebtPoints > 0 ? 'text-mentor-danger' : 'text-emerald-400'}`}>
              {trainingDebt.totalActiveDebtPoints} PTS
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {trainingDebt.totalActiveDebtPoints > 0 ? `${trainingDebt.mandatoryDrillsCount} Remediation Drills Required` : 'Clean Baseline • Zero Penalty'}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${trainingDebt.totalActiveDebtPoints > 0 ? 'bg-mentor-danger/20 border border-mentor-danger text-mentor-danger' : 'bg-emerald-950 border border-emerald-800 text-emerald-400'}`}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Primary Column (7 cols on desktop): Today's Active Practice Mission */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Action Challenge Hero Card */}
          <div className="bg-gradient-to-br from-mentor-surface via-[#141824] to-mentor-surface border border-mentor-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mentor-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs mb-3">
              <span className="px-3 py-1 rounded-full bg-mentor-accent/20 border border-mentor-accent/40 text-mentor-accent font-extrabold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Zap size={12} />
                Today's Action Workout
              </span>
              <span className="text-gray-400 font-semibold">{dailyPlan.targetMinutes} Mins Session</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white leading-tight mt-2">
              Adversarial Practice & Boundary Stress Testing
            </h2>
            <p className="text-xs md:text-sm text-gray-300 mt-3 leading-relaxed">
              The mentor selects your challenges based on your current performance boundary. You do not choose easy exercises. Your speech, structure, and tactical calculation will be evaluated against ruthless standards.
            </p>

            <button
              onClick={onStartTraining}
              className="group mt-6 w-full py-4 px-6 bg-gradient-to-r from-mentor-accent to-[#d48e00] hover:brightness-110 active:scale-[0.99] text-black font-black text-sm md:text-base rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all"
            >
              <Play size={20} className="fill-black" />
              <span>START ADVERSARIAL CHALLENGE</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Reality Mode Mission Protocol */}
          {realityMission && (
            <div className="bg-[#0b0e17] border border-cyan-950 rounded-3xl p-6 shadow-md">
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <Compass size={16} />
                  Reality Mode Field Mission
                </div>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded-full font-bold">
                  Physical Action
                </span>
              </div>

              <h3 className="text-base md:text-lg font-bold text-white">{realityMission.title}</h3>
              <p className="text-xs md:text-sm text-gray-300 mt-2 leading-relaxed">
                {realityMission.concreteObjective}
              </p>

              <div className="mt-4 pt-3 border-t border-cyan-950 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Requires 2-minute post-action reflection</span>
                <button
                  onClick={onOpenReality}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                >
                  <span>Review Protocol</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols on desktop): Diagnosis & Skills Overview */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Weakness Status Card */}
          <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-3">
              <div className="flex items-center gap-2 text-mentor-accent font-bold uppercase tracking-wider text-[11px]">
                <Target size={16} />
                Flaw Diagnosis
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-mentor-border text-[10px] font-bold text-gray-300 uppercase">
                {primaryWeakness ? `${primaryWeakness.severity} Severity` : 'Clean State'}
              </span>
            </div>

            {primaryWeakness ? (
              <div>
                <h3 className="text-base font-bold text-white">{primaryWeakness.dimensionName}</h3>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed bg-[#090b10] p-3.5 rounded-xl border border-mentor-border/60">
                  {primaryWeakness.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>Remediation required:</span>
                  <span className="font-bold text-mentor-accent">{primaryWeakness.consecutivePasses} / 3 Clean Passes</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-[#090b10] p-4 rounded-xl border border-mentor-border/60">
                <div className="text-xs font-semibold text-gray-300">No chronic weaknesses flagged yet.</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Complete challenges in the Practice Arena. The mentor will diagnose exact sub-skill flaws as you encounter friction.
                </p>
              </div>
            )}
          </div>

          {/* 15-Skills Quick Overview Card */}
          <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <TrendingUp size={16} className="text-mentor-accent" />
                  15 Skills Matrix
                </div>
                <button
                  onClick={onOpenSkills}
                  className="text-xs font-bold text-mentor-accent hover:underline flex items-center gap-1"
                >
                  <span>Explore Matrix</span>
                  <ArrowRight size={12} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Communication, Sales, Negotiation, Chess, Strategy, and Execution mapped to 10 mastery tiers.
              </p>

              {/* Sample Core Skills Preview */}
              <div className="flex flex-col gap-2.5">
                <div className="bg-[#090b10] p-3 rounded-xl border border-mentor-border/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Communication</span>
                  <span className="font-bold text-mentor-accent">Level 1.1</span>
                </div>
                <div className="bg-[#090b10] p-3 rounded-xl border border-mentor-border/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Entrepreneurship</span>
                  <span className="font-bold text-mentor-accent">Level 1.1</span>
                </div>
                <div className="bg-[#090b10] p-3 rounded-xl border border-mentor-border/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Chess (Tactics & Blindfold)</span>
                  <span className="font-bold text-mentor-accent">Level 1.1</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenSkills}
              className="mt-5 w-full py-2.5 px-4 bg-mentor-border hover:bg-mentor-border/80 text-white text-xs font-bold rounded-xl transition-colors"
            >
              View Full 15-Skill Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Ecosystem All Links Banner */}
      {onOpenAllLinks && (
        <div className="bg-gradient-to-r from-[#121520] via-mentor-surface to-[#161a27] border border-mentor-border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-mentor-accent/10 border border-mentor-accent/30 flex items-center justify-center text-mentor-accent shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Ecosystem Tools & Product Factories</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1c1407] text-mentor-accent border border-amber-900/60">
                  8 Connected Apps
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Instant access to Project Manager, Reusable Components, LaunchPilot, Finder, SkillForge, Content OS, Second Brain &amp; Setup Factory.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAllLinks}
            className="px-4 py-2.5 rounded-xl bg-mentor-accent hover:brightness-110 active:scale-[0.98] text-black font-extrabold text-xs transition flex items-center gap-2 shrink-0 shadow-sm"
          >
            <span>View All Links</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
