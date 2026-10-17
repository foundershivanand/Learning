import { Skill } from '@personal-mentor/shared';
import comm from './communication.json';
import pub from './public_speaking.json';
import sales from './sales.json';
import neg from './negotiation.json';
import ent from './entrepreneurship.json';
import strat from './business_strategy.json';
import crit from './critical_thinking.json';
import prob from './problem_solving.json';
import dec from './decision_making.json';
import lead from './leadership.json';
import chess from './chess.json';
import mem from './memory_visualization.json';
import learn from './learning_ability.json';
import creat from './creativity.json';
import disc from './discipline_execution.json';

export const ALL_SKILLS: Skill[] = [
  comm as unknown as Skill,
  pub as unknown as Skill,
  sales as unknown as Skill,
  neg as unknown as Skill,
  ent as unknown as Skill,
  strat as unknown as Skill,
  crit as unknown as Skill,
  prob as unknown as Skill,
  dec as unknown as Skill,
  lead as unknown as Skill,
  chess as unknown as Skill,
  mem as unknown as Skill,
  learn as unknown as Skill,
  creat as unknown as Skill,
  disc as unknown as Skill,
];

export function getSkillById(id: string): Skill | undefined {
  return ALL_SKILLS.find(s => s.id === id);
}

export function getAllDimensions() {
  return ALL_SKILLS.flatMap(s => s.dimensions);
}

export function getDimensionById(dimensionId: string) {
  for (const s of ALL_SKILLS) {
    const d = s.dimensions.find(dim => dim.id === dimensionId);
    if (d) return { skill: s, dimension: d };
  }
  return undefined;
}
