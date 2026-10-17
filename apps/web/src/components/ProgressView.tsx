'use client';

import React from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  ShieldAlert, 
  Clock 
} from 'lucide-react';
import { Weakness, TrainingDebtSummary, GamificationState } from '@personal-mentor/shared';

interface ProgressViewProps {
  weaknesses: Weakness[];
  trainingDebt: TrainingDebtSummary;
  gamification: GamificationState;
}

export function ProgressView({ weaknesses, trainingDebt, gamification }: ProgressViewProps) {
  const activeWeaknesses = weaknesses.filter(w => w.status !== 'RESOLVED');
  const resolvedWeaknesses = weaknesses.filter(w => w.status === 'RESOLVED');

  return (
    <div className="flex flex-col gap-5 pb-24 pt-2">
      {/* Header Summary */}
      <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-mentor-accent text-xs font-bold uppercase tracking-wider mb-3">
          <BarChart3 size={16} />
          Performance & Remediation Trajectory
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#090b10] border border-mentor-border p-3 rounded-xl">
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Streak</div>
            <div className="text-lg font-bold text-mentor-accent flex items-center justify-center gap-1 mt-0.5">
              <Flame size={16} className="fill-mentor-accent" />
              {gamification.currentStreakDays}D
            </div>
          </div>
          <div className="bg-[#090b10] border border-mentor-border p-3 rounded-xl">
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Total XP</div>
            <div className="text-lg font-bold text-white mt-0.5">{gamification.totalXp}</div>
          </div>
          <div className="bg-[#090b10] border border-mentor-border p-3 rounded-xl">
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Boss Clears</div>
            <div className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <Trophy size={15} />
              {gamification.bossClearsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Training Debt Ledger */}
      <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5 text-mentor-danger font-bold uppercase tracking-wider text-[11px]">
            <AlertTriangle size={15} />
            Training Debt Ledger
          </div>
          <span className="text-xs font-bold text-white">
            {trainingDebt.totalActiveDebtPoints} Points Active
          </span>
        </div>

        {trainingDebt.unresolvedDebts.length === 0 ? (
          <div className="text-xs text-gray-400 py-3 text-center bg-[#090b10] rounded-xl border border-mentor-border/60">
            Zero active debt. All required remediation drills completed.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {trainingDebt.unresolvedDebts.map(d => (
              <div key={d.id} className="bg-[#1a0e12] border border-rose-950 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-200">{d.description}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{d.reason}</div>
                </div>
                <div className="px-2.5 py-1 rounded bg-mentor-danger/20 text-mentor-danger font-black text-xs">
                  +{d.points} PTS
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Weaknesses Section */}
      <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5 text-mentor-accent font-bold uppercase tracking-wider text-[11px]">
            <ShieldAlert size={15} />
            Active Flaws Under Remediation ({activeWeaknesses.length})
          </div>
        </div>

        {activeWeaknesses.length === 0 ? (
          <div className="text-xs text-gray-400 py-3 text-center bg-[#090b10] rounded-xl border border-mentor-border/60">
            No active chronic flaws flagged. Operating cleanly.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {activeWeaknesses.map(w => (
              <div key={w.id} className="bg-[#090b10] border border-mentor-border p-3.5 rounded-xl">
                <div className="flex items-center justify-between text-xs mb-1">
                  <h4 className="font-bold text-white">{w.dimensionName}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-mentor-danger/20 text-mentor-danger uppercase">
                    {w.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-snug">{w.description}</p>
                <div className="mt-2.5 pt-2 border-t border-mentor-border/60 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Occurrences: {w.occurrenceCount}</span>
                  <span className="font-semibold text-mentor-accent">
                    {w.consecutivePasses} / 3 Clean Passes
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Weaknesses Section */}
      {resolvedWeaknesses.length > 0 && (
        <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-3">
            <CheckCircle2 size={15} />
            Resolved & Mastered Weaknesses ({resolvedWeaknesses.length})
          </div>
          <div className="flex flex-col gap-2">
            {resolvedWeaknesses.map(w => (
              <div key={w.id} className="bg-[#0c1a14] border border-emerald-950 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-200">{w.dimensionName}</div>
                  <div className="text-[10px] text-gray-400">{w.description}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950">
                  RESOLVED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
