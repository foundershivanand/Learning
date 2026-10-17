'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, CheckCircle, Target } from 'lucide-react';
import { SkillSummary } from '@personal-mentor/shared';
import { ALL_SKILLS } from '@personal-mentor/skills';

interface SkillsViewProps {
  skillsOverview?: SkillSummary[];
  onTrainSkill?: (skillId: string) => void;
}

export function SkillsView({ skillsOverview, onTrainSkill }: SkillsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>('communication');

  const categories = [
    { id: 'all', label: 'All 15' },
    { id: 'communication', label: 'Communication' },
    { id: 'business', label: 'Business' },
    { id: 'cognition', label: 'Cognition' },
    { id: 'tactics', label: 'Tactics' },
    { id: 'execution', label: 'Execution' },
  ];

  // Merge full skill metadata from ALL_SKILLS with current score states
  const skillsList = ALL_SKILLS.map(skill => {
    const summary = skillsOverview?.find(s => s.skill.id === skill.id);
    return {
      ...skill,
      overallScore: summary ? summary.overallScore : 50,
      overallLevel: summary ? summary.overallLevel : 1,
      overallSublevel: summary ? summary.overallSublevel : 1,
    };
  });

  const filteredSkills = selectedCategory === 'all'
    ? skillsList
    : skillsList.filter(s => s.category === selectedCategory);

  return (
    <div className="flex flex-col gap-4 pb-24 pt-2">
      {/* View Header */}
      <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-mentor-accent text-xs font-bold uppercase tracking-wider mb-1">
          <Layers size={16} />
          15-Skill Mastery Matrix
        </div>
        <p className="text-xs text-gray-300">
          Progression requires minimum 3 consecutive clean passes under adversarial conditions.
        </p>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-mentor-accent text-black font-bold'
                  : 'bg-mentor-border/60 text-gray-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid (Responsive 1 col mobile, 2 col tablet, 3 col desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map(skill => {
          const isExpanded = expandedSkillId === skill.id;

          return (
            <div
              key={skill.id}
              className="bg-mentor-surface border border-mentor-border rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{skill.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-mentor-border text-gray-400 uppercase">
                      {skill.category}
                    </span>
                  </div>
                  {/* Score & Sublevel */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="font-bold text-mentor-accent">
                      Level {skill.overallLevel}.{skill.overallSublevel}
                    </span>
                    <span>•</span>
                    <span>Score: {skill.overallScore} / 100</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mini Progress Bar */}
                  <div className="w-16 h-1.5 bg-mentor-border rounded-full overflow-hidden hidden sm:block">
                    <div 
                      className="h-full bg-mentor-accent rounded-full" 
                      style={{ width: `${skill.overallScore}%` }} 
                    />
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded Sub-dimensions Accordion */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-mentor-border/60 bg-[#0a0c12]">
                  <p className="text-xs text-gray-400 mb-3">{skill.description}</p>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Sub-Dimensions ({skill.dimensions.length})
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {skill.dimensions.map((dim: any) => (
                      <div key={dim.id} className="bg-mentor-surface border border-mentor-border/60 p-3 rounded-xl">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-gray-200">{dim.name}</span>
                          <span className="text-[10px] text-gray-400">Weight: {dim.weight}x</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-snug">{dim.description}</p>
                      </div>
                    ))}
                  </div>

                  {onTrainSkill && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrainSkill(skill.id);
                      }}
                      className="mt-4 w-full py-2.5 px-3 rounded-xl bg-mentor-accent/15 border border-mentor-accent/30 hover:bg-mentor-accent hover:text-black text-mentor-accent font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span>⚔️ TRAIN THIS SKILL →</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
