'use client';

import React from 'react';
import { Home, Zap, Layers, BarChart3, MessageSquare } from 'lucide-react';

export type TabType = 'home' | 'train' | 'skills' | 'progress' | 'mentor';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  debtPoints: number;
}

export function Navigation({ currentTab, onSelectTab, debtPoints }: NavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'train', label: 'Train', icon: Zap, badge: debtPoints > 0 ? `${debtPoints}` : undefined },
    { id: 'skills', label: 'Skills', icon: Layers },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'mentor', label: 'Mentor', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-mentor-surface/95 backdrop-blur-md border-t border-mentor-border max-w-md mx-auto">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as TabType)}
              className={`relative flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
                isActive ? 'text-mentor-accent font-semibold scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 text-[10px] font-bold bg-mentor-danger text-white rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-mentor-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
