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
  TrendingUp
} from 'lucide-react';
import { TodayDashboardResponse, RealityMission } from '@personal-mentor/shared';

interface HomeViewProps {
  data: TodayDashboardResponse;
  realityMission: RealityMission | null;
  onStartTraining: () => void;
  onOpenSkills: () => void;
  onOpenReality: () => void;
}

export function HomeView({
  data,
  realityMission,
  onStartTraining,
  onOpenSkills,
  onOpenReality,
}: HomeViewProps) {
  const { profile, dailyPlan, gamification, trainingDebt, primaryWeakness } = data;

  return (
    <div className="flex flex-col gap-5 pb-24 pt-2">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-mentor-surface to-[#161a26] border border-mentor-border rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-mentor-muted font-medium">Personal Mentor OS</div>
            <h1 className="text-xl font-bold text-white mt-0.5">{profile.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#1a140a] border border-[#3b2a0c] text-mentor-accent px-3 py-1.5 rounded-full text-xs font-bold">
              <Flame size={15} className="fill-mentor-accent" />
              <span>{gamification.currentStreakDays}D</span>
            </div>
            <div className="bg-mentor-border/60 text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold">
              {gamification.totalXp} XP
            </div>
          </div>
        </div>

        {/* Level Banner */}
        <div className="mt-4 pt-4 border-t border-mentor-border/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">Current Ability Level</span>
            <div className="text-2xl font-black text-mentor-accent tracking-tight">Level 4.7</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">Operating Mode</span>
            <div className="text-xs font-bold text-mentor-danger uppercase tracking-wide flex items-center gap-1 mt-1 justify-end">
              <ShieldAlert size={13} />
              Brutal Coach
            </div>
          </div>
        </div>
      </div>

      {/* Training Debt Warning (If active) */}
      {trainingDebt.totalActiveDebtPoints > 0 && (
        <div className="bg-gradient-to-r from-[#200d14] to-mentor-surface border border-mentor-danger/50 rounded-2xl p-4 flex items-start gap-3 shadow-md">
          <div className="p-2 bg-mentor-danger/20 rounded-xl text-mentor-danger mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-mentor-danger tracking-wide uppercase">Training Debt: {trainingDebt.totalActiveDebtPoints} Points</h2>
              <span className="text-[11px] font-semibold bg-mentor-danger/30 text-rose-200 px-2 py-0.5 rounded-full">
                {trainingDebt.mandatoryDrillsCount} Mandatory Drills
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Debt accrued from missed constraints and repeated flaws. Level progression is locked until debt drills are repaid.
            </p>
          </div>
        </div>
      )}

      {/* Primary Weakness Card */}
      {primaryWeakness && (
        <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <div className="flex items-center gap-1.5 text-mentor-accent font-semibold uppercase tracking-wider text-[11px]">
              <Target size={14} />
              Priority Target Weakness
            </div>
            <span className="px-2 py-0.5 rounded bg-mentor-danger/20 text-mentor-danger text-[10px] font-bold uppercase">
              {primaryWeakness.severity} Severity
            </span>
          </div>
          <h3 className="text-base font-bold text-white">{primaryWeakness.dimensionName}</h3>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            {primaryWeakness.description}
          </p>
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-mentor-border text-xs text-gray-400">
            <span>Remediation streak:</span>
            <span className="font-semibold text-mentor-accent">{primaryWeakness.consecutivePasses} / 3 Clean Passes</span>
          </div>
        </div>
      )}

      {/* Main Action: Start Challenge Button */}
      <button
        onClick={onStartTraining}
        className="group relative w-full bg-gradient-to-r from-mentor-accent to-[#ffb703] hover:brightness-110 active:scale-[0.98] text-black font-extrabold text-base py-4 px-6 rounded-2xl shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
      >
        <Play size={20} className="fill-black" />
        <span>START ADVERSARIAL CHALLENGE</span>
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </button>

      {/* Reality Mode Mission Card */}
      {realityMission && (
        <div className="bg-[#0e111a] border border-[#23293d] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider text-[11px]">
              <Compass size={14} />
              Reality Mode Mission
            </div>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">Physical Field Task</span>
          </div>
          <h3 className="text-sm font-bold text-white">{realityMission.title}</h3>
          <p className="text-xs text-gray-300 mt-1 line-clamp-2">
            {realityMission.concreteObjective}
          </p>
          <button 
            onClick={onOpenReality}
            className="mt-3 text-xs text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>View Full Field Protocol</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Quick Skills Summary Row */}
      <div 
        onClick={onOpenSkills}
        className="bg-mentor-surface/60 border border-mentor-border hover:border-mentor-accent/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-mentor-border/80 rounded-xl text-mentor-accent">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">15 Skills Engine</div>
            <div className="text-xs text-gray-400">Communication, Chess, Sales, Strategy...</div>
          </div>
        </div>
        <ArrowRight size={16} className="text-gray-400" />
      </div>
    </div>
  );
}
