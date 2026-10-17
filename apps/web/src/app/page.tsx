'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, TabType } from '../components/Navigation';
import { HomeView } from '../components/HomeView';
import { TrainView } from '../components/TrainView';
import { SkillsView } from '../components/SkillsView';
import { ProgressView } from '../components/ProgressView';
import { MentorView } from '../components/MentorView';
import { ApiClient } from '../lib/api-client';
import { TodayDashboardResponse, RealityMission } from '@personal-mentor/shared';
import { Zap, X, Compass, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [dashboardData, setDashboardData] = useState<TodayDashboardResponse | null>(null);
  const [realityMission, setRealityMission] = useState<RealityMission | null>(null);
  const [showRealityModal, setShowRealityModal] = useState(false);
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

  return (
    <main className="min-h-screen bg-mentor-bg text-gray-100 flex justify-center">
      {/* Mobile-constrained viewport container */}
      <div className="w-full max-w-md min-h-screen flex flex-col px-4 relative">
        {/* Active Tab View */}
        {currentTab === 'home' && (
          <HomeView
            data={dashboardData}
            realityMission={realityMission}
            onStartTraining={() => setCurrentTab('train')}
            onOpenSkills={() => setCurrentTab('skills')}
            onOpenReality={() => setShowRealityModal(true)}
          />
        )}

        {currentTab === 'train' && (
          <TrainView
            onChallengeComplete={() => {
              // Refresh state in background
              loadDashboard();
            }}
          />
        )}

        {currentTab === 'skills' && (
          <SkillsView skillsOverview={dashboardData.skillsOverview} />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            weaknesses={dashboardData.primaryWeakness ? [dashboardData.primaryWeakness] : []}
            trainingDebt={dashboardData.trainingDebt}
            gamification={dashboardData.gamification}
          />
        )}

        {currentTab === 'mentor' && (
          <MentorView />
        )}

        {/* Reality Mode Modal */}
        {showRealityModal && realityMission && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-mentor-surface border border-mentor-border rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
              <button
                onClick={() => setShowRealityModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-xs mb-2">
                <Compass size={16} />
                Reality Mode Protocol
              </div>
              <h3 className="text-base font-bold text-white mb-2">{realityMission.title}</h3>

              <div className="bg-[#0b0e17] border border-cyan-950 p-3 rounded-xl mb-3">
                <span className="text-[11px] font-bold text-cyan-300 uppercase">Scenario</span>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {realityMission.realWorldScenario}
                </p>
              </div>

              <div className="bg-[#091512] border border-emerald-950 p-3 rounded-xl mb-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase">Concrete Objective</span>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  {realityMission.concreteObjective}
                </p>
              </div>

              <div className="bg-[#1c0f12] border border-rose-950 p-3 rounded-xl mb-4">
                <span className="text-[11px] font-bold text-mentor-danger uppercase">Anti-Goal (Do NOT do this)</span>
                <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                  {realityMission.antiGoal}
                </p>
              </div>

              <button
                onClick={() => setShowRealityModal(false)}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-xl shadow-lg"
              >
                Accept Field Mission
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          debtPoints={dashboardData.trainingDebt.totalActiveDebtPoints}
        />
      </div>
    </main>
  );
}
