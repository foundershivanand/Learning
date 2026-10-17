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
                { id: 'skills', label: '15 Skills Matrix', icon: 'layers', desc: 'Mastery Breakdown' },
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
                  {currentTab === 'skills' && '15 Skills Mastery Taxonomy'}
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
                  onChallengeComplete={() => loadDashboard()}
                />
              )}

              {currentTab === 'skills' && (
                <SkillsView skills={skills} />
              )}

              {currentTab === 'progress' && (
                <ProgressView
                  data={data}
                />
              )}

              {currentTab === 'mentor' && (
                <MentorView />
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
              { id: 'skills', label: '15 Skills', icon: 'layers' },
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
                  <span className="text-xs font-bold uppercase tracking-wider text-white">15 Skills Mastery Matrix</span>
                  <button onClick={onOpenSkills} className="text-mentor-accent hover:underline text-xs font-semibold">View All 15 →</button>
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

    function TrainView({ onChallengeComplete }) {
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
        loadNextChallenge();
      }, []);

      const loadNextChallenge = async () => {
        setLoadingChallenge(true);
        setEvaluationResult(null);
        setResponseText('');
        setRecordDuration(0);
        setError(null);
        try {
          const res = await fetch('/api/challenge/next');
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
          const res = await fetch('/api/challenge/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challengeId: challenge.id,
              responseText: responseText.trim(),
              audioDurationSeconds: recordDuration > 0 ? recordDuration : 30,
            }),
          });

          if (res.ok) {
            const result = await res.json();
            setEvaluationResult(result);
            if (onChallengeComplete) onChallengeComplete(result);
          }
        } catch (e) {
          setError('Failed to evaluate attempt.');
        } finally {
          setIsSubmitting(false);
        }
      };

      if (loadingChallenge) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-mentor-muted">
            <div className="animate-spin text-mentor-accent text-3xl">⚡</div>
            <span className="text-sm font-medium">Synthesizing High-Friction Challenge from Turso...</span>
          </div>
        );
      }

      if (!challenge) return null;

      return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Challenge Brief & Constraints */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="px-2.5 py-1 rounded bg-mentor-accent/20 border border-mentor-accent/40 text-mentor-accent text-[10px] font-black uppercase">
                    {challenge.type} • DIFF {challenge.difficulty}
                  </span>
                  <span className="text-gray-400 font-bold text-xs">⏱️ {challenge.timeLimitSeconds}s Limit</span>
                </div>

                <h2 className="text-lg md:text-xl font-black text-white leading-tight mt-2">{challenge.title}</h2>
                <div className="mt-4 p-4 rounded-2xl bg-[#090b10] border border-mentor-border text-xs leading-relaxed text-gray-200">
                  <div className="font-bold text-gray-400 mb-1">Instruction:</div>
                  {challenge.instructions}
                </div>

                {challenge.constraints && challenge.constraints.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-mentor-danger mb-2">
                      ⚠️ Strict Non-Negotiable Constraints:
                    </div>
                    <ul className="flex flex-col gap-1.5 text-xs text-gray-300">
                      {challenge.constraints.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 bg-[#1a0e12] border border-rose-950/60 p-2.5 rounded-xl">
                          <span className="text-mentor-danger font-black">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Execution Arena */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="bg-mentor-surface border border-mentor-border rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Your Defense Execution</span>
                  {isRecording && (
                    <div className="flex items-center gap-2 text-mentor-danger text-xs font-bold animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-mentor-danger" />
                      <span>RECORDING: {recordDuration}s</span>
                    </div>
                  )}
                </div>

                {/* Recorder Control Bar */}
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-mentor-danger hover:brightness-110 active:scale-95 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <span>🎙️ START RECORDING (LIVE TRANSCRIPT)</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:scale-95 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <span>⏹️ STOP RECORDING</span>
                    </button>
                  )}
                </div>

                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Record your speech or type your defense here. Your cadence, filler words, and structure will be ruthlessly graded..."
                  rows={6}
                  className="w-full bg-[#090b10] border border-mentor-border rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-mentor-accent transition-colors resize-none leading-relaxed"
                />

                {error && <div className="text-xs text-mentor-danger font-bold">{error}</div>}

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !responseText.trim()}
                    className="flex-1 py-4 bg-gradient-to-r from-mentor-accent to-[#d48e00] hover:brightness-110 active:scale-[0.99] text-black font-black text-sm rounded-2xl shadow-xl disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>⚙️ GROQ AI EVALUATION IN PROGRESS...</span>
                    ) : (
                      <span>SUBMIT DEFENSE FOR BRUTAL CRITIQUE</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Evaluation Result Breakdown */}
              {evaluationResult && (
                <div className="bg-[#090b10] border border-mentor-border rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-mentor-border">
                    <div className="flex items-center gap-3">
                      <div className={"text-3xl font-black " + (evaluationResult.evaluation.passed ? "text-emerald-400" : "text-mentor-danger")}>
                        {evaluationResult.evaluation.overallScore}/100
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase text-white">
                          {evaluationResult.evaluation.passed ? "PASSED STANDARD" : "FAILED STANDARD"}
                        </div>
                        <div className="text-[11px] text-gray-400">Turso Math & Groq Evaluation</div>
                      </div>
                    </div>
                    <button
                      onClick={loadNextChallenge}
                      className="px-4 py-2 bg-mentor-accent text-black font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 transition-all"
                    >
                      NEXT CHALLENGE →
                    </button>
                  </div>

                  {/* Single Biggest Weakness */}
                  <div className="p-4 rounded-2xl bg-[#1a0e12] border border-rose-950">
                    <div className="text-[10px] uppercase font-black text-mentor-danger tracking-wider mb-1">
                      Single Biggest Identified Flaw:
                    </div>
                    <div className="text-xs font-bold text-rose-200">
                      {evaluationResult.evaluation.brutalCritique.singleBiggestWeakness}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                      {evaluationResult.evaluation.brutalCritique.whyItMatters}
                    </div>
                  </div>

                  {/* Corrective Drill */}
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40">
                    <div className="text-[10px] uppercase font-black text-mentor-accent tracking-wider mb-1">
                      Mandatory Corrective Micro-Drill:
                    </div>
                    <div className="text-xs text-amber-200 leading-relaxed">
                      {evaluationResult.evaluation.brutalCritique.correctiveDrillInstructions}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    function SkillsView({ skills }) {
      const [category, setCategory] = useState('all');
      const filtered = category === 'all' ? skills : skills.filter(s => s.skill.category === category);

      return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
          <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-mentor-accent">15-Skill Mastery Matrix</h2>
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
                <div className="mt-4 pt-4 border-t border-mentor-border/60 flex items-center justify-between text-xs">
                  <span className="font-black text-mentor-accent text-sm">Level {s.overallLevel}.{s.overallSublevel}</span>
                  <span className="text-gray-400">Score: {s.overallScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    function ProgressView({ data }) {
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
        </div>
      );
    }

    function MentorView() {
      const [messages, setMessages] = useState([
        {
          id: '1',
          sender: 'mentor',
          text: 'I am not here to validate your feelings. I am here to ensure you do not fool yourself. State your current performance bottleneck, or ask for an excuse audit.',
          time: '06:00 AM'
        }
      ]);
      const [input, setInput] = useState('');
      const [loading, setLoading] = useState(false);

      const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = {
          id: String(Date.now()),
          sender: 'user',
          text: input.trim(),
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

      return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto w-full">
          <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-4 shadow-sm flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-mentor-danger/20 border border-mentor-danger/50 flex items-center justify-center text-mentor-danger font-black">
                ⚔️
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Adversarial Socratic Mentor</h2>
                <div className="text-[11px] text-mentor-muted">Zero Empty Praise • Extreme Accountability</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-mentor-danger/20 text-mentor-danger uppercase">
              Ruthless Mode
            </span>
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
                <span>Mentor analyzing weaknesses...</span>
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
              className="px-5 py-2.5 rounded-xl bg-mentor-accent text-black font-bold text-xs disabled:opacity-30 transition-all hover:brightness-110"
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
