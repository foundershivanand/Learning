export function renderDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Mentor Operating System</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚔️</text></svg>">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            mentor: {
              bg: '#090a0f',
              surface: '#10131d',
              border: '#1f2433',
              accent: '#e69d00',
              danger: '#ff4d4f',
              muted: '#8c9ba5',
            }
          }
        }
      }
    };
  </script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body {
      background-color: #090a0f;
      color: #ededed;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      overflow-x: hidden;
      user-select: none;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #090a0f; }
    ::-webkit-scrollbar-thumb { background: #1f2433; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #2a3145; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    function Icon({ name, size = 18, className = "" }) {
      const ref = useRef(null);
      useEffect(() => {
        if (window.lucide && ref.current) {
          window.lucide.createIcons();
        }
      }, [name]);
      return <i ref={ref} data-lucide={name} style={{ width: size, height: size }} className={className + " inline-flex items-center justify-center"} />;
    }

    function App() {
      const [currentTab, setCurrentTab] = useState('home');
      const [trainSkillId, setTrainSkillId] = useState('');
      const [data, setData] = useState(null);
      const [realityMission, setRealityMission] = useState(null);
      const [showRealityModal, setShowRealityModal] = useState(false);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        loadDashboard();
      }, []);

      const loadDashboard = async () => {
        try {
          const res = await fetch('/api/today');
          if (res.ok) {
            const json = await res.json();
            setData(json);
          }
          const misRes = await fetch('/api/reality/mission', { method: 'POST' });
          if (misRes.ok) {
            const mis = await misRes.json();
            setRealityMission(mis);
          }
        } catch (e) {
          console.error('Error loading dashboard:', e);
        } finally {
          setLoading(false);
        }
      };

      if (loading || !data) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-mentor-bg text-mentor-muted gap-3">
            <div className="animate-spin text-mentor-accent text-3xl font-black">⚡</div>
            <span className="text-xs uppercase tracking-widest font-bold">Synchronizing AI Mentor Brain with Turso...</span>
          </div>
        );
      }

      const skills = data.skillsOverview || [];
      const avgLevel = skills.length > 0
        ? (skills.reduce((acc, s) => acc + s.overallLevel + s.overallSublevel / 10, 0) / skills.length).toFixed(1)
        : '1.1';

      return (
        <div className="min-h-screen bg-mentor-bg text-gray-100 flex flex-col md:flex-row">
          {/* Desktop Left Sidebar */}
          <aside className="hidden md:flex flex-col w-64 lg:w-72 fixed inset-y-0 left-0 bg-mentor-surface border-r border-mentor-border z-40 p-5 select-none">
            <div className="flex items-center gap-3 pb-5 border-b border-mentor-border/80">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mentor-accent to-[#b87c00] flex items-center justify-center text-black font-black shadow-lg">
                <Icon name="zap" size={22} className="text-black" />
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-wider text-white uppercase flex items-center gap-1.5">
                  AI MENTOR
                  <span className="text-[9px] bg-mentor-danger/20 text-mentor-danger px-1.5 py-0.5 rounded font-black border border-mentor-danger/40">
                    RUTHLESS
                  </span>
                </div>
                <div className="text-[11px] text-mentor-muted">Turso & Cloudflare Edge</div>
              </div>
            </div>

            {/* Performance Card */}
            <div className="my-5 bg-[#090b10] border border-mentor-border/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white">{data.profile.name}</div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-mentor-accent bg-[#1c1407] px-2 py-0.5 rounded-full border border-amber-900/50">
                  <span>🔥 {data.gamification.currentStreakDays}D</span>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-[11px] text-gray-400">Current Level</span>
                <span className="text-lg font-black text-mentor-accent tracking-tight">Level {avgLevel}</span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                <span>Tier</span>
                <span className="text-gray-200 font-semibold">Level 1 — Basic</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-mentor-border/60 text-center">
                <div className="bg-mentor-surface p-1.5 rounded-lg">
                  <div className="text-[9px] text-gray-400 uppercase">XP</div>
                  <div className="text-xs font-bold text-white">{data.gamification.totalXp}</div>
                </div>
                <div className="bg-mentor-surface p-1.5 rounded-lg">
                  <div className="text-[9px] text-gray-400 uppercase">Debt</div>
                  <div className={"text-xs font-bold " + (data.trainingDebt.totalActiveDebtPoints > 0 ? "text-mentor-danger" : "text-emerald-400")}>
                    {data.trainingDebt.totalActiveDebtPoints} PTS
                  </div>
                </div>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 flex flex-col gap-1.5">
              {[
                { id: 'home', label: 'Overview', icon: 'home', desc: "Today's Briefing" },
                { id: 'train', label: 'Practice Arena', icon: 'zap', desc: 'Deliberate Drills', badge: data.trainingDebt.totalActiveDebtPoints > 0 ? data.trainingDebt.totalActiveDebtPoints : null },
                { id: 'skills', label: '16 Skills Matrix', icon: 'layers', desc: 'Mastery Breakdown' },
                { id: 'progress', label: 'Progress & Debt', icon: 'bar-chart-3', desc: 'Remediation Ledger' },
                { id: 'mentor', label: 'Mentor Sparring', icon: 'message-square', desc: 'Socratic Debrief' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={"w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all " +
                    (currentTab === item.id
                      ? "bg-mentor-accent text-black font-bold shadow-md shadow-amber-950/20"
                      : "text-gray-300 hover:bg-white/[0.04] hover:text-white")}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={item.icon} size={18} />
                    <div>
                      <div className="text-xs font-bold leading-tight">{item.label}</div>
                      <div className={"text-[10px] " + (currentTab === item.id ? "text-black/70" : "text-gray-400")}>{item.desc}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-mentor-danger text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setCurrentTab('train')}
              className="mt-auto w-full py-3 px-4 rounded-xl bg-gradient-to-r from-mentor-accent to-[#d48e00] text-black font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>⚔️ LAUNCH DRILL</span>
            </button>
          </aside>

          {/* Main Layout Area */}
          <main className="md:pl-64 lg:pl-72 flex-1 w-full min-h-screen bg-mentor-bg flex flex-col">
            {/* Top Desktop Bar */}
            <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-mentor-border/60 bg-mentor-surface/40 backdrop-blur-sm sticky top-0 z-30">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-mentor-muted">Active Operating View</div>
                <h1 className="text-lg font-black text-white capitalize">
                  {currentTab === 'home' && "Today's Briefing & Performance Matrix"}
                  {currentTab === 'train' && 'Adversarial Practice Arena'}
                  {currentTab === 'skills' && '16 Skills Mastery Taxonomy'}
                  {currentTab === 'progress' && 'Performance & Remediation Trajectory'}
                  {currentTab === 'mentor' && 'Socratic Sparring & Accountability Console'}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mentor-surface border border-mentor-border text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-gray-300 font-semibold">Turso Database: Connected</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1407] border border-amber-900/60 text-mentor-accent text-xs font-bold">
                  <span>🔥 {data.gamification.currentStreakDays}D Streak</span>
                </div>
              </div>
            </header>

            {/* Container */}
            <div className="flex-1 w-full px-4 sm:px-6 md:px-8 py-4 md:py-6 pb-24 md:pb-8">
              {currentTab === 'home' && (
                <HomeView
                  data={data}
                  avgLevel={avgLevel}
                  realityMission={realityMission}
                  onStartTraining={() => setCurrentTab('train')}
                  onOpenSkills={() => setCurrentTab('skills')}
                  onOpenReality={() => setShowRealityModal(true)}
                />
              )}

              {currentTab === 'train' && (
                <TrainView
                  initialSkillId={trainSkillId}
                  onChallengeComplete={() => loadDashboard()}
                />
              )}

              {currentTab === 'skills' && (
                <SkillsView 
                  skills={skills} 
                  onSelectSkillToTrain={(skillId) => {
                    setTrainSkillId(skillId);
                    setCurrentTab('train');
                  }}
                />
              )}

              {currentTab === 'progress' && (
                <ProgressView
                  data={data}
                />
              )}

              {currentTab === 'mentor' && (
                <MentorView data={data} />
              )}
            </div>

            {/* Reality Mission Modal */}
            {showRealityModal && realityMission && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-mentor-surface border border-mentor-border rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
                  <button
                    onClick={() => setShowRealityModal(false)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-white text-lg font-bold"
                  >
                    ✕
                  </button>
                  <div className="text-[10px] uppercase font-black text-cyan-400 tracking-wider mb-2">
                    Field Operation • Physical Reality
                  </div>
                  <h3 className="text-lg font-black text-white">{realityMission.title}</h3>
                  <div className="mt-4 p-4 rounded-xl bg-mentor-bg border border-mentor-border text-xs leading-relaxed text-gray-200">
                    <div className="font-bold text-gray-400 mb-1">Scenario:</div>
                    {realityMission.realWorldScenario}
                  </div>
                  <div className="mt-3 p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs leading-relaxed text-amber-200">
                    <div className="font-bold text-mentor-accent mb-1">Objective:</div>
                    {realityMission.concreteObjective}
                  </div>
                  <div className="mt-3 p-4 rounded-xl bg-rose-950/20 border border-rose-950 text-xs leading-relaxed text-rose-300">
                    <div className="font-bold text-mentor-danger mb-1">Anti-Goal (Do NOT do this):</div>
                    {realityMission.antiGoal}
                  </div>
                  <button
                    onClick={() => setShowRealityModal(false)}
                    className="mt-6 w-full py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:brightness-110 text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    I ACCEPT THIS MISSION
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <nav className="md:hidden fixed bottom-0 inset-x-0 bg-mentor-surface border-t border-mentor-border z-40 flex items-center justify-around py-2.5 px-1 backdrop-blur-lg">
            {[
              { id: 'home', label: 'Briefing', icon: 'home' },
              { id: 'train', label: 'Practice', icon: 'zap' },
              { id: 'skills', label: '16 Skills', icon: 'layers' },
              { id: 'progress', label: 'Debt', icon: 'bar-chart-3' },
              { id: 'mentor', label: 'Mentor', icon: 'message-square' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={"flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold transition-all " +
                  (currentTab === item.id ? "text-mentor-accent" : "text-gray-400")}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      );
    }

    function HomeView({ data, avgLevel, realityMission, onStartTraining, onOpenSkills, onOpenReality }) {
      return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
          {/* Top 3 Stat Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-mentor-muted">Current Ability Level</span>
                <div className="text-2xl font-black text-mentor-accent mt-0.5">Level {avgLevel}</div>
                <div className="text-xs text-gray-400 mt-1">Tier: Level 1 — Basic (Sublevel 1/10)</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-mentor-accent/10 border border-mentor-accent/30 flex items-center justify-center text-mentor-accent font-black text-xl">
                ★
              </div>
            </div>

            <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-mentor-muted">Operating Rhythm</span>
                <div className="text-2xl font-black text-white mt-0.5 flex items-center gap-1.5">
                  <span>🔥 {data.gamification.currentStreakDays} Days</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">Daily Target: {data.dailyPlan.targetMinutes} Mins Practice</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#1c1308] border border-amber-900/50 flex items-center justify-center text-mentor-accent font-black text-xl">
                ⏱️
              </div>
            </div>

            <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-mentor-muted">Training Debt</span>
                <div className={"text-2xl font-black mt-0.5 " + (data.trainingDebt.totalActiveDebtPoints > 0 ? "text-mentor-danger" : "text-emerald-400")}>
                  {data.trainingDebt.totalActiveDebtPoints} PTS
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {data.trainingDebt.totalActiveDebtPoints > 0 ? data.trainingDebt.mandatoryDrillsCount + " Remediation Drills Required" : "Clean Baseline • Zero Penalty"}
                </div>
              </div>
              <div className={"w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl " + (data.trainingDebt.totalActiveDebtPoints > 0 ? "bg-mentor-danger/20 border border-mentor-danger text-mentor-danger" : "bg-emerald-950 border border-emerald-800 text-emerald-400")}>
                ⚠️
              </div>
            </div>
          </div>

          {/* 12-Column Desktop Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Action Workout Hero Card */}
              <div className="bg-gradient-to-br from-mentor-surface via-[#141824] to-mentor-surface border border-mentor-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="px-3 py-1 rounded-full bg-mentor-accent/20 border border-mentor-accent/40 text-mentor-accent font-extrabold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    ⚡ Today's Action Workout
                  </span>
                  <span className="text-gray-400 font-semibold">{data.dailyPlan.targetMinutes} Mins Session</span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white leading-tight mt-2">
                  Adversarial Practice & Boundary Stress Testing
                </h2>
                <p className="text-xs md:text-sm text-gray-300 mt-3 leading-relaxed">
                  The mentor generates your challenges based on your active weaknesses and Turso performance boundary. Zero passive articles. Your speech, structure, and tactical logic will be evaluated against ruthless standards.
                </p>

                <button
                  onClick={onStartTraining}
                  className="mt-6 w-full py-4 px-6 bg-gradient-to-r from-mentor-accent to-[#d48e00] hover:brightness-110 active:scale-[0.99] text-black font-black text-sm md:text-base rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all"
                >
                  <span>⚔️ START ADVERSARIAL CHALLENGE</span>
                </button>
              </div>

              {/* Reality Mission */}
              {realityMission && (
                <div className="bg-[#0b0e17] border border-cyan-950 rounded-3xl p-6 shadow-md">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-cyan-400 font-extrabold uppercase text-[10px] tracking-wider">
                      🌍 Reality Mode Field Assignment
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                      High Leverage
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{realityMission.title}</h3>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">{realityMission.concreteObjective}</p>
                  <button
                    onClick={onOpenReality}
                    className="mt-4 w-full py-3 bg-[#111827] hover:bg-[#1f293d] border border-cyan-900/60 rounded-xl text-xs font-bold text-cyan-300 transition-all"
                  >
                    View Field Protocol & Mission Rules →
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Diagnosis & Skills Overview */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Active Weakness Card */}
              <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-mentor-accent">
                    🛡️ Active Diagnosis
                  </span>
                  <span className="text-[10px] text-gray-400">Turso Real-time</span>
                </div>

                {data.primaryWeakness ? (
                  <div className="bg-[#1a0e12] border border-rose-950 p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-300 uppercase">{data.primaryWeakness.dimensionName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-mentor-danger/20 text-mentor-danger">
                        {data.primaryWeakness.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">{data.primaryWeakness.description}</p>
                  </div>
                ) : (
                  <div className="bg-[#090b10] border border-mentor-border/60 p-4 rounded-2xl text-center">
                    <div className="text-xs font-bold text-emerald-400">Clean Performance Horizon</div>
                    <div className="text-[11px] text-gray-400 mt-1">No chronic flaws detected yet. Complete drills to stress-test your baseline.</div>
                  </div>
                )}
              </div>

              {/* Skills Bar */}
              <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">16 Skills Mastery Matrix</span>
                  <button onClick={onOpenSkills} className="text-mentor-accent hover:underline text-xs font-semibold">View All 16 →</button>
                </div>
                <div className="flex flex-col gap-2.5">
                  {data.skillsOverview.slice(0, 5).map(s => (
                    <div key={s.skill.id} className="bg-[#090b10] p-3 rounded-xl border border-mentor-border flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{s.skill.name}</span>
                      <span className="font-extrabold text-mentor-accent">Level {s.overallLevel}.{s.overallSublevel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const SKILL_OPTIONS = [
      { id: '', label: '🎯 Auto-Target: Weakest Boundary & Active Debt' },
      { id: 'communication', label: '🗣️ 1. Communication (Executive Pitch & High Signal)' },
      { id: 'public_speaking', label: '🎙️ 2. Public Speaking (Town Hall Crisis Defense)' },
      { id: 'sales', label: '💼 3. Sales (Enterprise IT Discovery Under Friction)' },
      { id: 'negotiation', label: '🤝 4. Negotiation (Chris Voss Tactical Empathy)' },
      { id: 'entrepreneurship', label: '🚀 5. Entrepreneurship (Kill-Switch Default-Alive Triage)' },
      { id: 'business_strategy', label: '♟️ 6. Business Strategy (Moat & Counter-Positioning)' },
      { id: 'critical_thinking', label: '🔬 7. Critical Thinking (First-Principles Deconstruction)' },
      { id: 'problem_solving', label: '💡 8. Problem Solving (5-Whys Root Cause Deduction)' },
      { id: 'decision_making', label: '⚖️ 9. Decision Making (Asymmetric Hedging & 1-Way Doors)' },
      { id: 'leadership', label: '🧑‍💼 10. Leadership (Terminating Toxic High-Performer)' },
      { id: 'chess', label: '♟️ 11. Chess (Grandmaster 4-Ply Candidate Calculation)' },
      { id: 'memory_visualization', label: '🧠 12. Memory & Visualization (Blindfold Geometry)' },
      { id: 'learning_ability', label: '📚 13. Fast Learning (Feynman 10-Year-Old Reduction)' },
      { id: 'creativity', label: '🎨 14. Creativity (TRIZ Problem Inversion)' },
      { id: 'discipline_execution', label: '⚡ 15. Discipline & Execution (Anti-Avoidance Protocol)' },
      { id: 'spanish', label: '🇪🇸 16. Spanish (Spontaneous Fluency & Conjugation)' },
    ];

    function TrainView({ onChallengeComplete, initialSkillId = '' }) {
      const [selectedSkill, setSelectedSkill] = useState(initialSkillId);
      const [challenge, setChallenge] = useState(null);
      const [loadingChallenge, setLoadingChallenge] = useState(true);
      const [responseText, setResponseText] = useState('');
      const [isRecording, setIsRecording] = useState(false);
      const [recordDuration, setRecordDuration] = useState(0);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [evaluationResult, setEvaluationResult] = useState(null);
      const [error, setError] = useState(null);

      const timerRef = useRef(null);
      const recognitionRef = useRef(null);

      useEffect(() => {
        loadNextChallenge(selectedSkill);
      }, []);

      const loadNextChallenge = async (skillToLoad = selectedSkill) => {
        setLoadingChallenge(true);
        setEvaluationResult(null);
        setResponseText('');
        setRecordDuration(0);
        setError(null);
        try {
          const url = skillToLoad ? ('/api/challenge/next?skill=' + encodeURIComponent(skillToLoad)) : '/api/challenge/next';
          const res = await fetch(url);
          if (res.ok) {
            const ch = await res.json();
            setChallenge(ch);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingChallenge(false);
        }
      };

      const handleSkillChange = (newSkill) => {
        setSelectedSkill(newSkill);
        loadNextChallenge(newSkill);
      };

      const startRecording = () => {
        setError(null);
        setIsRecording(true);
        setRecordDuration(0);

        timerRef.current = setInterval(() => {
          setRecordDuration(p => p + 1);
        }, 1000);

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const rec = new SpeechRec();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';
            rec.onresult = (event) => {
              let text = '';
              for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript + ' ';
              }
              if (text.trim()) setResponseText(text.trim());
            };
            rec.start();
            recognitionRef.current = rec;
          } catch (e) {
            console.warn(e);
          }
        }
      };

      const stopRecording = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }
        setIsRecording(false);
      };

      const handleSubmit = async () => {
        if (!challenge) return;
        if (!responseText.trim()) {
          setError('You must record your voice or type your defense before submitting.');
          return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
          const wordCount = responseText.trim().split(/\s+/).length;
          const computedDuration = recordDuration > 0 ? recordDuration : Math.max(15, Math.round(wordCount / 2.3));

          const res = await fetch('/api/challenge/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId: challenge.id,
              responseText: responseText.trim(),
              audioDurationSeconds: computedDuration,
            }),
          });

          if (res.ok) {
            const result = await res.json();
            setEvaluationResult(result);
            if (onChallengeComplete) onChallengeComplete(result);
          } else {
            setError('Evaluation failed. Please retry.');
          }
        } catch (e) {
          setError('Failed to evaluate attempt.');
        } finally {
          setIsSubmitting(false);
        }
      };

      const wordCount = responseText.trim() ? responseText.trim().split(/\s+/).length : 0;
      const estSpeechSeconds = Math.round(wordCount / 2.3);

      return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
          {/* Top Skill Focus & Arena Control Bar */}
          <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-black uppercase tracking-wider text-mentor-accent shrink-0">
                ⚡ Focus Skill:
              </span>
              <div className="relative flex-1 md:w-80">
                <select
                  value={selectedSkill}
                  onChange={(e) => handleSkillChange(e.target.value)}
                  className="w-full bg-[#090b10] border border-mentor-border text-white text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-mentor-accent transition-all cursor-pointer appearance-none pr-8"
                >
                  {SKILL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-mentor-surface text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() => loadNextChallenge(selectedSkill)}
                disabled={loadingChallenge || isSubmitting}
                className="py-2.5 px-4 rounded-xl bg-mentor-surface border border-mentor-border hover:border-mentor-accent text-xs font-bold text-gray-200 hover:text-white transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span>🔄 REROLL SCENARIO</span>
              </button>
            </div>
          </div>

          {loadingChallenge ? (
            <div className="flex flex-col items-center justify-center min-h-[45vh] gap-3 text-mentor-muted">
              <div className="animate-spin text-mentor-accent text-3xl font-black">⚡</div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                Synthesizing Masterclass Challenge via Groq AI & Turso...
              </span>
            </div>
          ) : !challenge ? (
            <div className="p-8 text-center text-gray-400">
              <p>No challenge generated. Please choose a skill above or click Reroll.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Challenge Brief & Constraints */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                  {/* Challenge Header Badges */}
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-mentor-border/60">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-mentor-accent/20 border border-mentor-accent/40 text-mentor-accent text-[10px] font-black uppercase">
                        {challenge.type}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Skill: {challenge.skillId.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-bold text-xs bg-[#090b10] px-2.5 py-1 rounded-lg border border-mentor-border">
                        ⏱️ {challenge.timeLimitSeconds}s Limit
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-mentor-danger/20 text-mentor-danger text-[10px] font-black">
                        DIFF {challenge.difficulty}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-lg md:text-xl font-black text-white leading-tight">
                    {challenge.title}
                  </h2>

                  {/* Scenario Description */}
                  <div className="p-4 rounded-2xl bg-[#090b10] border border-mentor-border text-xs leading-relaxed text-gray-200">
                    <div className="text-[10px] uppercase font-bold text-mentor-accent tracking-wider mb-1.5 flex items-center gap-1.5">
                      <span>🎯 Operational Scenario:</span>
                    </div>
                    <div className="text-gray-200 font-medium whitespace-pre-line">
                      {challenge.instructions}
                    </div>
                  </div>

                  {/* Adversary Context Pushback */}
                  {challenge.adversaryContext && (
                    <div className="p-4 rounded-2xl bg-[#1c0f14] border border-rose-950/80 text-xs">
                      <div className="text-[10px] uppercase font-black text-mentor-danger tracking-wider mb-1 flex items-center gap-1.5">
                        <span>🛡️ Adversarial Resistance & Mindset:</span>
                      </div>
                      <div className="text-rose-200 font-medium">
                        {challenge.adversaryContext}
                      </div>
                    </div>
                  )}

                  {/* Strict Non-Negotiable Constraints */}
                  {challenge.constraints && challenge.constraints.length > 0 && (
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-mentor-danger mb-2.5 flex items-center gap-1.5">
                        <span>⚠️ Non-Negotiable Constraints (Fail Criteria):</span>
                      </div>
                      <ul className="flex flex-col gap-2 text-xs text-gray-200">
                        {challenge.constraints.map((c, i) => (
                          <li key={i} className="flex items-start gap-2.5 bg-[#140e12] border border-rose-950/50 p-3 rounded-xl">
                            <span className="text-mentor-danger font-black leading-none mt-0.5">•</span>
                            <span className="leading-relaxed">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pedagogical Standard Banner */}
                  <div className="p-3.5 rounded-2xl bg-amber-950/15 border border-amber-900/30 text-[11px] text-amber-200/90 leading-relaxed">
                    <div className="font-black text-mentor-accent uppercase text-[10px] tracking-wider mb-0.5">
                      Masterclass Grading Protocol:
                    </div>
                    No hand-waving or theoretical filler. You are graded strictly on structural cohesion, tactical accuracy, absence of banned crutches, and execution cadence.
                  </div>
                </div>
              </div>

              {/* Right Column: Execution Arena */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-mentor-border/60">
                    <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <span>Your Defense Execution</span>
                      <span className="text-[10px] text-mentor-muted font-normal">
                        (Speech or Written Argument)
                      </span>
                    </div>
                    {isRecording ? (
                      <div className="flex items-center gap-2 text-mentor-danger text-xs font-black animate-pulse bg-mentor-danger/10 px-2.5 py-1 rounded-full border border-mentor-danger/30">
                        <span className="w-2.5 h-2.5 rounded-full bg-mentor-danger" />
                        <span>LIVE RECORDING: {recordDuration}s</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 font-semibold">
                        Words: {wordCount} {wordCount > 0 ? (" (~" + estSpeechSeconds + "s speech)") : ""}
                      </div>
                    )}
                  </div>

                  {/* Recorder Control Bar */}
                  <div className="flex items-center gap-3">
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex-1 py-3.5 px-4 rounded-xl bg-mentor-danger hover:brightness-110 active:scale-[0.98] text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                      >
                        <span>🎙️ START LIVE VOICE RECORDING (BROWSER SPEECH ENGINE)</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex-1 py-3.5 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:scale-[0.98] text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                      >
                        <span>⏹️ STOP RECORDING (LOCK TRANSCRIPT)</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Speak using the recording button above, or type your defense directly here. Your structural cohesion, banned words, and tactical logic will be ruthlessly graded..."
                      rows={7}
                      className="w-full bg-[#090b10] border border-mentor-border rounded-2xl p-4 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mentor-accent transition-colors resize-none leading-relaxed"
                    />
                    {wordCount > 0 && (
                      <div className="absolute right-4 bottom-4 text-[10px] font-bold text-gray-500">
                        {wordCount} words
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-mentor-danger text-xs text-rose-300 font-bold">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !responseText.trim()}
                    className="w-full py-4 bg-gradient-to-r from-mentor-accent to-[#d48e00] hover:brightness-110 active:scale-[0.99] text-black font-black text-sm rounded-2xl shadow-xl disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin text-base">⚙️</span>
                        <span>GROQ AI RUNNING BRUTAL DEFENSE EVALUATION...</span>
                      </span>
                    ) : (
                      <span>⚔️ SUBMIT DEFENSE FOR BRUTAL CRITIQUE & DEBT RESOLUTION</span>
                    )}
                  </button>
                </div>

                {/* Evaluation Result Breakdown */}
                {evaluationResult && (
                  <div className="bg-[#090b10] border border-mentor-border rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-4 border-b border-mentor-border">
                      <div className="flex items-center gap-4">
                        <div className={"text-4xl font-black " + (evaluationResult.evaluation.passed ? "text-emerald-400" : "text-mentor-danger")}>
                          {evaluationResult.evaluation.overallScore}
                          <span className="text-lg text-gray-500 font-bold">/100</span>
                        </div>
                        <div>
                          <div className={"text-xs font-black uppercase tracking-wider " + (evaluationResult.evaluation.passed ? "text-emerald-400" : "text-mentor-danger")}>
                            {evaluationResult.evaluation.passed ? "✓ PASSED MASTERCLASS STANDARD" : "✗ FAILED CRITERIA — PENALTY APPLIED"}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Deterministic Rubric & Groq AI Synthesis
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => loadNextChallenge(selectedSkill)}
                        className="px-4 py-2.5 bg-mentor-accent text-black font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
                      >
                        <span>NEXT CHALLENGE →</span>
                      </button>
                    </div>

                    {/* Single Biggest Flaw */}
                    <div className="p-4 rounded-2xl bg-[#1c0f14] border border-rose-950">
                      <div className="text-[10px] uppercase font-black text-mentor-danger tracking-wider mb-1 flex items-center gap-1.5">
                        <span>💥 Single Biggest Identified Flaw:</span>
                      </div>
                      <div className="text-xs font-bold text-rose-200 leading-snug">
                        {evaluationResult.evaluation.brutalCritique.singleBiggestWeakness}
                      </div>
                      <div className="text-[11px] text-gray-300 mt-2 leading-relaxed">
                        <span className="font-bold text-gray-400">Why It Matters: </span>
                        {evaluationResult.evaluation.brutalCritique.whyItMatters}
                      </div>
                    </div>

                    {/* Corrective Micro-Drill */}
                    <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-900/50">
                      <div className="text-[10px] uppercase font-black text-mentor-accent tracking-wider mb-1 flex items-center gap-1.5">
                        <span>⚡ Mandatory Corrective Micro-Drill:</span>
                      </div>
                      <div className="text-xs text-amber-200 leading-relaxed font-medium">
                        {evaluationResult.evaluation.brutalCritique.correctiveDrillInstructions}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    function SkillsView({ skills, onSelectSkillToTrain }) {
      const [category, setCategory] = useState('all');
      const filtered = category === 'all' ? skills : skills.filter(s => s.skill.category === category);

      return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mentor-accent">16-Skill Mastery Matrix</h2>
            <p className="text-xs text-gray-400 mt-1">Progression requires 3 consecutive clean passes under adversarial conditions.</p>
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
              {['all', 'communication', 'business', 'cognition', 'tactics', 'execution'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={"px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all " +
                    (category === cat ? "bg-mentor-accent text-black" : "bg-mentor-border/60 text-gray-400 hover:text-white")}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <div key={s.skill.id} className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <h3 className="font-black text-white text-sm">{s.skill.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-mentor-border text-gray-300 uppercase">
                      {s.skill.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{s.skill.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-mentor-border/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-mentor-accent text-sm">Level {s.overallLevel}.{s.overallSublevel}</span>
                    <span className="text-gray-400 font-semibold">Score: {s.overallScore}/100</span>
                  </div>
                  <button
                    onClick={() => onSelectSkillToTrain && onSelectSkillToTrain(s.skill.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-mentor-accent/15 border border-mentor-accent/30 hover:bg-mentor-accent hover:text-black text-mentor-accent font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>⚔️ TRAIN THIS SKILL →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    function ProgressView({ data }) {
      const recentAttempts = data?.recentAttempts || [];

      return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debt Ledger */}
            <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="font-black text-mentor-danger uppercase tracking-wider text-xs">
                  ⚠️ Training Debt Ledger
                </span>
                <span className="font-bold text-white text-xs">{data.trainingDebt.totalActiveDebtPoints} Points Active</span>
              </div>

              {data.trainingDebt.unresolvedDebts.length === 0 ? (
                <div className="text-xs text-gray-400 py-6 text-center bg-[#090b10] rounded-2xl border border-mentor-border/60">
                  Zero active debt. All corrective drills cleared.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.trainingDebt.unresolvedDebts.map(d => (
                    <div key={d.id} className="bg-[#1a0e12] border border-rose-950 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-rose-200">{d.description}</div>
                        <div className="text-[10px] text-gray-400 mt-1">{d.reason}</div>
                      </div>
                      <div className="px-3 py-1 rounded bg-mentor-danger/20 text-mentor-danger font-black text-xs">
                        +{d.points} PTS
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Flaws */}
            <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="font-black text-mentor-accent uppercase tracking-wider text-xs">
                  🛡️ Active Flaws Under Remediation
                </span>
                <span className="text-xs text-gray-400">{(data.weaknesses || []).length} Flagged</span>
              </div>

              {(!data.weaknesses || data.weaknesses.length === 0) ? (
                <div className="text-xs text-gray-400 py-6 text-center bg-[#090b10] rounded-2xl border border-mentor-border/60">
                  No active chronic flaws flagged. Operating cleanly.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.weaknesses.map(w => (
                    <div key={w.id} className="bg-[#090b10] border border-mentor-border p-4 rounded-2xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{w.dimensionName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-mentor-danger/20 text-mentor-danger uppercase">
                          {w.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-2">{w.description}</p>
                      <div className="mt-3 pt-2 border-t border-mentor-border/60 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Occurrences: {w.occurrenceCount}</span>
                        <span className="text-mentor-accent font-bold">{w.consecutivePasses} / 3 Clean Passes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Drill Performance & History */}
          <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-4 pb-3 border-b border-mentor-border/60">
              <span className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2">
                <span>⚔️</span>
                <span>Drill Performance & Evaluation History</span>
              </span>
              <span className="text-xs text-mentor-accent font-bold bg-[#090b10] px-3 py-1 rounded-full border border-mentor-border">
                {recentAttempts.length} Logged in Turso
              </span>
            </div>

            {recentAttempts.length === 0 ? (
              <div className="text-xs text-gray-400 py-8 text-center bg-[#090b10] rounded-2xl border border-mentor-border/60">
                Zero drills completed yet. Jump into the Practice Arena to establish your baseline.
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {recentAttempts.map((att, i) => (
                  <div key={att.id} className="bg-[#090b10] border border-mentor-border p-4 rounded-2xl flex flex-col gap-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-xs">
                          {att.challenge ? att.challenge.title : ("Challenge " + att.challengeId)}
                        </span>
                        {att.challenge && att.challenge.skillId && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-mentor-surface border border-mentor-border text-gray-300 font-semibold uppercase">
                            {att.challenge.skillId.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={"text-xs font-black px-2.5 py-0.5 rounded " + (att.evaluation && att.evaluation.passed ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-mentor-danger/20 text-mentor-danger border border-mentor-danger/40")}>
                          {att.evaluation ? (att.evaluation.overallScore + "/100") : "N/A"} {att.evaluation && att.evaluation.passed ? "✓ PASSED" : "✗ FAILED"}
                        </span>
                      </div>
                    </div>

                    {att.responseText && (
                      <div className="p-3 rounded-xl bg-mentor-surface/60 border border-mentor-border/40 text-[11px] text-gray-300 italic leading-relaxed">
                        "{att.responseText}"
                      </div>
                    )}

                    {att.evaluation && att.evaluation.brutalCritique && (
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

    function MentorView({ data }) {
      const recentAttempts = data ? (data.recentAttempts || []) : [];
      const latestAttempt = recentAttempts[0];

      const initialGreeting = latestAttempt
        ? ("I have full access to your historical drill logs in Turso. Your latest drill was '" + (latestAttempt.challenge ? latestAttempt.challenge.title : "Practice Drill") + "' (" + (latestAttempt.challenge ? latestAttempt.challenge.skillId : "Skill") + ") where you scored " + (latestAttempt.evaluation ? latestAttempt.evaluation.overallScore : 0) + "/100. State your excuse or ask for an audit of your execution.")
        : "I am not here to validate your feelings. I am here to ensure you do not fool yourself. State your current performance bottleneck, or ask for an excuse audit.";

      const [messages, setMessages] = useState([
        {
          id: '1',
          sender: 'mentor',
          text: initialGreeting,
          time: '06:00 AM'
        }
      ]);
      const [input, setInput] = useState('');
      const [loading, setLoading] = useState(false);

      const sendPrompt = (text) => {
        handleSendCustom(text);
      };

      const handleSendCustom = async (textToSend) => {
        const text = (textToSend || input).trim();
        if (!text || loading) return;

        const userMsg = {
          id: String(Date.now()),
          sender: 'user',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const history = [...messages, userMsg];
        setMessages(history);
        setInput('');
        setLoading(true);

        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: history.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              }))
            })
          });

          if (res.ok) {
            const json = await res.json();
            setMessages(prev => [
              ...prev,
              {
                id: String(Date.now()),
                sender: 'mentor',
                text: json.response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };

      const handleSend = () => handleSendCustom(input);

      return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto w-full">
          <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-4 shadow-sm flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-mentor-danger/20 border border-mentor-danger/50 flex items-center justify-center text-mentor-danger font-black">
                ⚔️
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Adversarial Socratic Mentor</h2>
                <div className="text-[11px] text-mentor-muted">Zero Empty Praise • Extreme Accountability</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Turso: {recentAttempts.length} Drills Synced
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-mentor-danger/20 text-mentor-danger uppercase">
                Ruthless
              </span>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2">
            {[
              "What drills have I taken so far and what were my scores?",
              "Why did I fail my latest drill?",
              "What is my single biggest recurring speech flaw?",
              "How do I clear my active training debt?"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => sendPrompt(chip)}
                className="px-3 py-1.5 rounded-full bg-mentor-surface border border-mentor-border text-[11px] text-gray-300 hover:text-mentor-accent hover:border-mentor-accent whitespace-nowrap transition-all active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-2">
            {messages.map(m => (
              <div key={m.id} className={"flex items-start gap-3 max-w-[85%] " + (m.sender === 'user' ? 'ml-auto flex-row-reverse' : '')}>
                <div className={"w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold " + (m.sender === 'user' ? 'bg-mentor-accent text-black' : 'bg-mentor-border text-mentor-danger')}>
                  {m.sender === 'user' ? 'U' : '⚔️'}
                </div>
                <div className={"p-3.5 rounded-2xl text-xs leading-relaxed " + (m.sender === 'user' ? 'bg-gradient-to-r from-mentor-accent to-[#d48e00] text-black font-semibold rounded-tr-none' : 'bg-mentor-surface border border-mentor-border text-gray-200 rounded-tl-none')}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div className={"text-[9px] mt-1 text-right " + (m.sender === 'user' ? 'text-black/60' : 'text-gray-500')}>{m.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-mentor-muted ml-10">
                <span className="animate-spin text-mentor-danger">⚡</span>
                <span>Mentor analyzing weaknesses & drill records...</span>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 bg-mentor-surface border border-mentor-border p-2 rounded-2xl mt-3 shadow-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="State your defense or bottleneck directly..."
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-2.5 rounded-xl bg-mentor-accent text-black font-bold text-xs disabled:opacity-30 transition-all hover:brightness-110 active:scale-95"
            >
              SEND
            </button>
          </form>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;
}
