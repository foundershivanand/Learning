'use client';

import React from 'react';
import { 
  Home, 
  Zap, 
  Layers, 
  BarChart3, 
  MessageSquare, 
  Flame, 
  AlertTriangle, 
  ShieldAlert, 
  Award,
  Play,
  Globe,
  ArrowUpRight
} from 'lucide-react';
import { TabType } from './Navigation';

interface DesktopSidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  debtPoints: number;
  streakDays: number;
  totalXp: number;
  overallLevel: number;
  userName: string;
  onStartTraining: () => void;
  onOpenAllLinks?: () => void;
}

export function DesktopSidebar({
  currentTab,
  onSelectTab,
  debtPoints,
  streakDays,
  totalXp,
  overallLevel,
  userName,
  onStartTraining,
  onOpenAllLinks,
}: DesktopSidebarProps) {
  const navItems = [
    { id: 'home', label: 'Overview', icon: Home, desc: "Today's Briefing" },
    { id: 'train', label: 'Practice Arena', icon: Zap, desc: 'Deliberate Drills', badge: debtPoints > 0 ? `${debtPoints}` : undefined },
    { id: 'skills', label: '16 Skills Matrix', icon: Layers, desc: 'Mastery Breakdown' },
    { id: 'progress', label: 'Progress & Debt', icon: BarChart3, desc: 'Remediation Ledger' },
    { id: 'mentor', label: 'Mentor Sparring', icon: MessageSquare, desc: 'Socratic Debrief' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 fixed inset-y-0 left-0 bg-mentor-surface border-r border-mentor-border z-40 p-5 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-mentor-border/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mentor-accent to-[#b87c00] flex items-center justify-center text-black font-black shadow-lg shadow-amber-950/20">
          <Zap size={22} className="fill-black" />
        </div>
        <div>
          <div className="text-sm font-extrabold tracking-wider text-white uppercase flex items-center gap-1.5">
            AI MENTOR
            <span className="text-[9px] bg-mentor-danger/20 text-mentor-danger px-1.5 py-0.5 rounded font-black border border-mentor-danger/40">
              RUTHLESS
            </span>
          </div>
          <div className="text-[11px] text-mentor-muted">Action-Oriented OS</div>
        </div>
      </div>

      {/* User Performance Card */}
      <div className="my-5 bg-[#090b10] border border-mentor-border/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white">{userName}</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-mentor-accent bg-[#1c1407] px-2 py-0.5 rounded-full border border-amber-900/50">
            <Flame size={12} className="fill-mentor-accent" />
            <span>{streakDays}D</span>
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-[11px] text-gray-400">Current Level</span>
          <span className="text-lg font-black text-mentor-accent tracking-tight">Level {overallLevel.toFixed(1)}</span>
        </div>

        <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
          <span>Tier</span>
          <span className="text-gray-200 font-semibold">Tier {Math.max(1, Math.floor(overallLevel))}</span>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-mentor-border/60 text-center">
          <div className="bg-mentor-surface p-1.5 rounded-lg">
            <div className="text-[9px] text-gray-400 uppercase">XP</div>
            <div className="text-xs font-bold text-white">{totalXp}</div>
          </div>
          <div className="bg-mentor-surface p-1.5 rounded-lg">
            <div className="text-[9px] text-gray-400 uppercase">Debt</div>
            <div className={`text-xs font-bold ${debtPoints > 0 ? 'text-mentor-danger' : 'text-emerald-400'}`}>
              {debtPoints} PTS
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onStartTraining}
        className="w-full mb-5 py-3 px-4 bg-gradient-to-r from-mentor-accent to-[#d48e00] hover:brightness-110 active:scale-[0.98] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-950/20 flex items-center justify-center gap-2 transition-all"
      >
        <Play size={14} className="fill-black" />
        <span>LAUNCH NEXT CHALLENGE</span>
      </button>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-1">
          Operating Modules
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as TabType)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-mentor-border/80 text-mentor-accent font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-mentor-accent stroke-[2.5]' : 'text-gray-400'} />
                <div>
                  <div className="text-xs leading-none">{item.label}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{item.desc}</div>
                </div>
              </div>

              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-mentor-danger text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Ecosystem All Links Button */}
      {onOpenAllLinks && (
        <button
          type="button"
          onClick={onOpenAllLinks}
          className="my-3 w-full py-2.5 px-3 rounded-xl bg-[#090b10] hover:bg-[#141824] border border-mentor-border/80 hover:border-mentor-accent/50 text-gray-300 hover:text-white transition-all flex items-center justify-between text-left group shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-mentor-accent/10 border border-mentor-accent/30 flex items-center justify-center text-mentor-accent group-hover:scale-105 transition-transform">
              <Globe size={14} className="text-mentor-accent" />
            </div>
            <div>
              <div className="text-xs font-bold leading-none text-white group-hover:text-mentor-accent transition">
                All Links
              </div>
              <div className="text-[10px] text-gray-400 mt-1">8 Connected Apps</div>
            </div>
          </div>
          <ArrowUpRight size={14} className="text-gray-400 group-hover:text-mentor-accent transition" />
        </button>
      )}

      {/* Bottom Accountability Footer */}
      <div className="pt-4 border-t border-mentor-border/80 text-[11px] text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-mentor-danger font-semibold">
          <ShieldAlert size={14} />
          <span>Brutal Mode Active</span>
        </div>
        <span className="text-[10px] text-gray-400">Zero Fluff</span>
      </div>
    </aside>
  );
}
