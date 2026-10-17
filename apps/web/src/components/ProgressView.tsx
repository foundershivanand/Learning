'use client';

import React from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  ShieldAlert, 
  Clock,
  Zap
} from 'lucide-react';
import { Weakness, TrainingDebtSummary, GamificationState, AttemptWithChallenge } from '@personal-mentor/shared';

interface ProgressViewProps {
  weaknesses: Weakness[];
  trainingDebt: TrainingDebtSummary;
  gamification: GamificationState;
  recentAttempts?: AttemptWithChallenge[];
}

export function ProgressView({ weaknesses, trainingDebt, gamification, recentAttempts }: ProgressViewProps) {
  const activeWeaknesses = weaknesses.filter(w => w.status !== 'RESOLVED');
  const resolvedWeaknesses = weaknesses.filter(w => w.status === 'RESOLVED');

  return (
    <div className="flex flex-col gap-6 pb-24 pt-2 max-w-7xl mx-auto w-full">
      {/* Header Summary */}
      <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-mentor-accent text-xs font-bold uppercase tracking-wider mb-3">
          <BarChart3 size={16} />
          Performance & Remediation Trajectory
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-[#090b10] border border-mentor-border p-4 rounded-xl">
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Streak</div>
            <div className="text-xl font-black text-mentor-accent flex items-center justify-center gap-1.5 mt-1">
              <Flame size={18} className="fill-mentor-accent" />
              {gamification.currentStreakDays}D
            </div>
          </div>
          <div className="bg-[#090b10] border border-mentor-border p-4 rounded-xl">
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Total XP</div>
            <div className="text-xl font-black text-white mt-1">{gamification.totalXp}</div>
          </div>
          <div className="bg-[#090b10] border border-mentor-border p-4 rounded-xl">
            <div className="text-[10px] text-gray-400 uppercase font-semibold">Boss Clears</div>
            <div className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1.5 mt-1">
              <Trophy size={18} />
              {gamification.bossClearsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Two-Column Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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

      {/* Drill Performance & History */}
      <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-4 pb-3 border-b border-mentor-border/60">
          <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs">
            <Zap size={15} className="text-mentor-accent" />
            Drill Performance & Evaluation History
          </div>
          <span className="text-xs text-mentor-accent font-bold bg-[#090b10] px-3 py-1 rounded-full border border-mentor-border">
            {recentAttempts?.length || 0} Logged
          </span>
        </div>

        {(!recentAttempts || recentAttempts.length === 0) ? (
          <div className="text-xs text-gray-400 py-8 text-center bg-[#090b10] rounded-xl border border-mentor-border/60">
            Zero drills completed yet. Jump into the Practice Arena to establish your baseline.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {recentAttempts.map((att) => (
              <div key={att.id} className="bg-[#090b10] border border-mentor-border p-4 rounded-xl flex flex-col gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">
                      {att.challenge?.title || `Challenge ${att.challengeId}`}
                    </span>
                    {att.challenge?.skillId && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-mentor-surface border border-mentor-border text-gray-300 font-semibold uppercase">
                        {att.challenge.skillId.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded ${att.evaluation?.passed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-mentor-danger/20 text-mentor-danger border border-mentor-danger/40'}`}>
                      {att.evaluation ? `${att.evaluation.overallScore}/100` : 'N/A'} {att.evaluation?.passed ? '✓ PASSED' : '✗ FAILED'}
                    </span>
                  </div>
                </div>

                {att.responseText && (
                  <div className="p-3 rounded-lg bg-mentor-surface/60 border border-mentor-border/40 text-[11px] text-gray-300 italic leading-relaxed">
                    "{att.responseText}"
                  </div>
                )}

                {att.evaluation?.brutalCritique && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-mentor-border/40 text-xs">
                    <div className="text-rose-300">
                      <span className="font-black text-mentor-danger uppercase text-[10px] tracking-wider">Identified Flaw: </span>
                      <span className="font-semibold">{att.evaluation.brutalCritique.singleBiggestWeakness}</span>
                    </div>
                    {att.evaluation.brutalCritique.correctiveDrillInstructions && (
                      <div className="text-amber-200/90 text-[11px]">
                        <span className="font-black text-mentor-accent uppercase text-[10px] tracking-wider">Mandatory Fix: </span>
                        {att.evaluation.brutalCritique.correctiveDrillInstructions}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
