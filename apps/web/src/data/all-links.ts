export interface EcosystemLink {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  badge: 'Pages' | 'Worker';
  icon: 'FolderKanban' | 'Boxes' | 'Rocket' | 'Compass' | 'Code' | 'FileText' | 'Brain' | 'Wrench' | 'Zap';
  gradient: string;
  isCurrentProject?: boolean;
}

/**
 * All 9 ecosystem platforms.
 * 'mentor-api' is marked as isCurrentProject=true and will be excluded from the popup modal.
 */
export const ALL_ECOSYSTEM_LINKS: EcosystemLink[] = [
  {
    id: 'project-manage',
    name: 'Project Manager',
    url: 'https://project-manage-z6u.pages.dev/',
    description: 'Kanban boards, milestone tracking, and 817-task launch orchestration suite.',
    category: 'Management',
    badge: 'Pages',
    icon: 'FolderKanban',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'reusable',
    name: 'Reusable Components',
    url: 'https://reusable-dpy.pages.dev/',
    description: 'Battle-tested UI library, design tokens, and modular enterprise building blocks.',
    category: 'UI Library',
    badge: 'Pages',
    icon: 'Boxes',
    gradient: 'from-fuchsia-600 to-pink-600',
  },
  {
    id: 'launchpilot',
    name: 'LaunchPilot',
    url: 'https://launchpilot.foundershivanand.workers.dev/',
    description: 'Automated release pipeline, deployment validation, and product launch marketing.',
    category: 'DevOps',
    badge: 'Worker',
    icon: 'Rocket',
    gradient: 'from-orange-600 to-amber-600',
  },
  {
    id: 'finder',
    name: 'Finder',
    url: 'https://finder-d17.pages.dev/',
    description: 'Startup opportunity discovery, query engine, and asset crawler.',
    category: 'Discovery',
    badge: 'Pages',
    icon: 'Compass',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'skillforge',
    name: 'SkillForge',
    url: 'https://skillforge-i9b.pages.dev/',
    description: 'Interactive technical training, coding challenges, and dynamic skill trees.',
    category: 'Learning',
    badge: 'Pages',
    icon: 'Code',
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    id: 'content-os',
    name: 'Content OS',
    url: 'https://content-os.foundershivanand.workers.dev/',
    description: 'Viral content studio, script ideation, and multi-channel publishing pipeline.',
    category: 'Content OS',
    badge: 'Worker',
    icon: 'FileText',
    gradient: 'from-indigo-600 to-blue-600',
  },
  {
    id: 'second-brain',
    name: 'Second Brain',
    url: 'https://second-brain-web-d8x.pages.dev/',
    description: 'Knowledge capture, personal wiki, and cognitive thoughts vault.',
    category: 'Productivity',
    badge: 'Pages',
    icon: 'Brain',
    gradient: 'from-rose-600 to-pink-600',
  },
  {
    id: 'setup-factory',
    name: 'Setup Factory',
    url: 'https://setup-factory.pages.dev/',
    description: 'Project scaffolding, boilerplate generators, and toolchain setup.',
    category: 'Dev Tools',
    badge: 'Pages',
    icon: 'Wrench',
    gradient: 'from-amber-600 to-yellow-600',
  },
  {
    id: 'mentor-api',
    name: 'AI Mentor OS',
    url: 'https://mentor-api.foundershivanand.workers.dev/',
    description: 'Adversarial practice arena, 15-skill mastery taxonomy, vocal sparring, and reality operations.',
    category: 'AI Services',
    badge: 'Worker',
    icon: 'Zap',
    gradient: 'from-amber-500 to-yellow-500',
    isCurrentProject: true,
  },
];

/**
 * Returns all links except the current project (AI Mentor OS / mentor-api)
 */
export function getPopupLinks(): EcosystemLink[] {
  return ALL_ECOSYSTEM_LINKS.filter(
    (link) => !link.isCurrentProject && !link.url.includes('mentor-api')
  );
}
