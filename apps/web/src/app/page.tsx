'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, TabType } from '../components/Navigation';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { HomeView } from '../components/HomeView';
import { TrainView } from '../components/TrainView';
import { SkillsView } from '../components/SkillsView';
import { ProgressView } from '../components/ProgressView';
import { MentorView } from '../components/MentorView';
import { AllLinksModal } from '../components/AllLinksModal';
import { ApiClient } from '../lib/api-client';
import { TodayDashboardResponse, RealityMission } from '@personal-mentor/shared';
import { Zap, X, Compass, ShieldAlert, Flame, Globe } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [trainSkillId, setTrainSkillId] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<TodayDashboardResponse | null>(null);
  const [realityMission, setRealityMission] = useState<RealityMission | null>(null);
  const [showRealityModal, setShowRealityModal] = useState(false);
  const [showAllLinksModal, setShowAllLinksModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await ApiClient.getToday();
      setDashboardData(data);
      const mission = await ApiClient.getRealityMission();
      setRealityMission(mission);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-mentor-bg text-mentor-muted gap-3">
        <Zap size={36} className="animate-spin text-mentor-accent" />
        <span className="text-xs uppercase tracking-widest font-bold">Synchronizing Mentor Brain...</span>
      </div>
    );
  }

  const overallLevel = dashboardData.skillsOverview && dashboardData.skillsOverview.length > 0
    ? dashboardData.skillsOverview.reduce((acc, s) => acc + s.overallLevel + s.overallSublevel / 10, 0) / dashboardData.skillsOverview.length
    : 1.1;

  return (
    <div className="min-h-screen bg-mentor-bg text-gray-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar (Left side, hidden on mobile) */}
      <DesktopSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        debtPoints={dashboardData.trainingDebt.totalActiveDebtPoints}
        streakDays={dashboardData.gamification.currentStreakDays}
        totalXp={dashboardData.gamification.totalXp}
        overallLevel={overallLevel > 1.0 ? overallLevel : 1.1}
        userName={dashboardData.profile.name}
        onStartTraining={() => setCurrentTab('train')}
        onOpenAllLinks={() => setShowAllLinksModal(true)}
      />

      {/* Main Content Area (Expansive for desktop, mobile-scrollable) */}
      <main className="md:pl-64 lg:pl-72 flex-1 w-full min-h-screen bg-mentor-bg flex flex-col">
        {/* Mobile Top Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-mentor-border/80 bg-mentor-surface/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-mentor-accent to-amber-600 flex items-center justify-center text-black font-black">
              <Zap size={15} className="fill-black" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-white uppercase">AI MENTOR</span>
              <span className="text-[9px] ml-1.5 text-mentor-accent font-bold">OS</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAllLinksModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12141c] hover:bg-[#1a1e2b] border border-mentor-border text-xs font-bold text-gray-200 transition"
          >
            <Globe size={13} className="text-mentor-accent" />
            <span>All Links</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-mentor-accent/20 text-mentor-accent font-bold">
              8
            </span>
          </button>
        </div>

        {/* Top Desktop Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-mentor-border/60 bg-mentor-surface/40 backdrop-blur-sm sticky top-0 z-30">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-mentor-muted">Active Operating View</div>
            <h1 className="text-lg font-black text-white capitalize">
              {currentTab === 'home' && "Today's Briefing & Performance Matrix"}
              {currentTab === 'train' && 'Adversarial Practice Arena'}
              {currentTab === 'skills' && '15 Skills Mastery Taxonomy'}
              {currentTab === 'progress' && 'Performance & Remediation Trajectory'}
              {currentTab === 'mentor' && 'Socratic Sparring & Accountability Console'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* All Links Button */}
            <button
              type="button"
              onClick={() => setShowAllLinksModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mentor-surface hover:bg-[#181c28] border border-mentor-border hover:border-mentor-accent/50 text-xs font-bold text-gray-200 transition-all shadow-sm group"
              title="View All Connected Ecosystem Platforms"
            >
              <Globe size={14} className="text-mentor-accent group-hover:rotate-12 transition-transform" />
              <span>All Links</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#1c1407] text-mentor-accent border border-amber-900/60">
                8
              </span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mentor-surface border border-mentor-border text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-gray-300 font-semibold">Engine: Deterministic Math</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1407] border border-amber-900/60 text-mentor-accent text-xs font-bold">
              <Flame size={14} className="fill-mentor-accent" />
              <span>{dashboardData.gamification.currentStreakDays}D Streak</span>
            </div>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 w-full px-4 sm:px-6 md:px-8 py-4 md:py-6">
          {currentTab === 'home' && (
            <HomeView
              data={dashboardData}
              realityMission={realityMission}
              onStartTraining={() => setCurrentTab('train')}
              onOpenSkills={() => setCurrentTab('skills')}
              onOpenReality={() => setShowRealityModal(true)}
              onOpenAllLinks={() => setShowAllLinksModal(true)}
            />
          )}

          {currentTab === 'train' && (
            <TrainView
              initialSkill={trainSkillId}
              onChallengeComplete={() => {
                loadDashboard();
              }}
            />
          )}

          {currentTab === 'skills' && (
            <SkillsView 
              skillsOverview={dashboardData.skillsOverview} 
              onTrainSkill={(skillId) => {
                setTrainSkillId(skillId);
                setCurrentTab('train');
              }}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressView
              weaknesses={dashboardData.weaknesses || (dashboardData.primaryWeakness ? [dashboardData.primaryWeakness] : [])}
              trainingDebt={dashboardData.trainingDebt}
              gamification={dashboardData.gamification}
              recentAttempts={dashboardData.recentAttempts}
            />
          )}

          {currentTab === 'mentor' && (
            <MentorView />
          )}
        </div>

        {/* Reality Mode Modal */}
        {showRealityModal && realityMission && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-mentor-surface border border-mentor-border rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setShowRealityModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-xs mb-2">
                <Compass size={16} />
                Reality Mode Field Protocol
              </div>
              <h3 className="text-lg font-black text-white mb-3">{realityMission.title}</h3>

              <div className="bg-[#0b0e17] border border-cyan-950 p-4 rounded-2xl mb-3">
                <span className="text-[11px] font-bold text-cyan-300 uppercase">Real-World Scenario</span>
                <p className="text-xs md:text-sm text-gray-300 mt-1 leading-relaxed">
                  {realityMission.realWorldScenario}
                </p>
              </div>

              <div className="bg-[#091512] border border-emerald-950 p-4 rounded-2xl mb-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase">Concrete Objective</span>
                <p className="text-xs md:text-sm text-emerald-100 mt-1 leading-relaxed">
                  {realityMission.concreteObjective}
                </p>
              </div>

              <div className="bg-[#1c0f12] border border-rose-950 p-4 rounded-2xl mb-5">
                <span className="text-[11px] font-bold text-mentor-danger uppercase">Anti-Goal (Do NOT do this)</span>
                <p className="text-xs md:text-sm text-rose-200 mt-1 leading-relaxed">
                  {realityMission.antiGoal}
                </p>
              </div>

              <button
                onClick={() => setShowRealityModal(false)}
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs md:text-sm rounded-xl shadow-lg transition-all"
              >
                Accept Field Mission
              </button>
            </div>
          </div>
        )}

        {/* Ecosystem All Links Modal Popup */}
        <AllLinksModal
          isOpen={showAllLinksModal}
          onClose={() => setShowAllLinksModal(false)}
        />

        {/* Mobile-Only Bottom Navigation */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          debtPoints={dashboardData.trainingDebt.totalActiveDebtPoints}
        />
      </main>
    </div>
  );
}
