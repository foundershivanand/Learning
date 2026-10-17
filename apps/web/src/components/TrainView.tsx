'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Mic, 
  Square, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Zap, 
  ChevronRight,
  ShieldAlert,
  Volume2,
  FileText,
  Flame,
  Target,
  Sparkles
} from 'lucide-react';
import { Challenge, SubmitAttemptResponse } from '@personal-mentor/shared';
import { ApiClient } from '../lib/api-client';

interface TrainViewProps {
  initialChallenge?: Challenge | null;
  onChallengeComplete?: (res: SubmitAttemptResponse) => void;
}

export function TrainView({ initialChallenge, onChallengeComplete }: TrainViewProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(initialChallenge || null);
  const [loadingChallenge, setLoadingChallenge] = useState(!initialChallenge);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<SubmitAttemptResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!initialChallenge) {
      loadNextChallenge();
    }
  }, []);

  const loadNextChallenge = async () => {
    setLoadingChallenge(true);
    setEvaluationResult(null);
    setResponseText('');
    setRecordDuration(0);
    setValidationError(null);
    try {
      const next = await ApiClient.getNextChallenge();
      setChallenge(next);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChallenge(false);
    }
  };

  const startRecording = async () => {
    setValidationError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Initialize browser Web Speech Recognition for live transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let currentTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript + ' ';
            }
            if (currentTranscript.trim()) {
              setResponseText(currentTranscript.trim());
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition error:', e);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('SpeechRecognition init error:', e);
        }
      }

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unavailable, using manual typing mode', err);
      setIsRecording(true);
      setRecordDuration(0);
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
  };

  const handleSubmitAttempt = async () => {
    if (!challenge) return;
    if (!responseText.trim()) {
      setValidationError('You must record your voice or type your defense before submitting. The mentor requires concrete evidence to evaluate.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const res = await ApiClient.submitAttempt({
        challengeId: challenge.id,
        responseText: responseText.trim(),
        audioDurationSeconds: recordDuration > 0 ? recordDuration : Math.max(15, Math.round(responseText.trim().split(/\s+/).length / 2.2)),
      });

      setEvaluationResult(res);
      if (onChallengeComplete) onChallengeComplete(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingChallenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-mentor-muted">
        <Zap className="animate-spin text-mentor-accent" size={32} />
        <span className="text-sm font-medium">Synthesizing High-Friction Challenge...</span>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>No active challenge available.</p>
        <button onClick={loadNextChallenge} className="mt-4 px-5 py-2.5 bg-mentor-surface border border-mentor-border rounded-xl text-sm font-bold text-white hover:border-mentor-accent">
          Refresh Practice Arena
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24 pt-2 max-w-7xl mx-auto w-full">
      {/* Arena Top Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-mentor-surface border border-mentor-border rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-mentor-accent/20 border border-mentor-accent/40 rounded-xl text-mentor-accent font-black text-xs">
            {challenge.type}
          </div>
          <div>
            <div className="text-[10px] font-bold text-mentor-muted uppercase tracking-wider">
              Target Skill: {challenge.skillId.replace('_', ' ').toUpperCase()}
            </div>
            <h1 className="text-base md:text-lg font-bold text-white">{challenge.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mentor-border text-xs font-bold text-gray-200">
            <Timer size={14} className="text-mentor-accent" />
            <span>{challenge.timeLimitSeconds}s Ceiling</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-mentor-danger/20 border border-mentor-danger/40 text-xs font-bold text-mentor-danger">
            Target Diff: {challenge.difficulty}
          </div>
        </div>
      </div>

      {/* Main Two-Column Desktop / Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Challenge Briefing & Constraints */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Instructions Card */}
          <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-mentor-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target size={14} />
              Operational Objective
            </div>
            <p className="text-xs md:text-sm text-gray-200 leading-relaxed bg-[#0a0c12] p-4 rounded-xl border border-mentor-border/60">
              {challenge.instructions}
            </p>

            {/* Adversary Context (if present) */}
            {challenge.adversaryContext && (
              <div className="mt-4 bg-[#1a0f12] border border-rose-950 p-4 rounded-xl flex items-start gap-2.5">
                <ShieldAlert size={18} className="text-mentor-danger mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-mentor-danger uppercase tracking-wider">Adversarial Resistance</div>
                  <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                    {challenge.adversaryContext}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Strict Negative Constraints */}
          {challenge.constraints && challenge.constraints.length > 0 && (
            <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-mentor-danger uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertCircle size={15} />
                Non-Negotiable Constraints
              </div>
              <ul className="flex flex-col gap-2.5">
                {challenge.constraints.map((c, idx) => (
                  <li key={idx} className="text-xs text-gray-200 flex items-start gap-2.5 bg-[#090b10] p-3 rounded-xl border border-mentor-border/60">
                    <span className="w-2 h-2 rounded-full bg-mentor-danger mt-1.5 shrink-0" />
                    <span className="font-medium">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rubric Criteria Preview */}
          {challenge.rubric && challenge.rubric.length > 0 && (
            <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText size={15} />
                Evaluation Rubric Standards
              </div>
              <div className="flex flex-col gap-2">
                {challenge.rubric.map(r => (
                  <div key={r.dimensionId} className="bg-[#090b10] p-3 rounded-xl border border-mentor-border/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Threshold: {r.passThreshold}/100</div>
                    </div>
                    <span className="text-[11px] font-bold text-mentor-accent px-2 py-0.5 rounded bg-mentor-border">
                      {r.weight}x Weight
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Delivery Arena / Evaluation Results */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {!evaluationResult ? (
            <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-6 shadow-lg flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                  <Volume2 size={16} className="text-mentor-accent" />
                  Delivery & Practice Arena
                </div>
                {isRecording && (
                  <span className="flex items-center gap-2 text-xs font-bold text-mentor-danger bg-mentor-danger/10 border border-mentor-danger/40 px-3 py-1 rounded-full animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-mentor-danger" />
                    RECORDING 00:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
                  </span>
                )}
              </div>

              {/* Big Record Microphone Interface */}
              <div className="flex flex-col items-center justify-center py-6 bg-[#090b10] rounded-2xl border border-mentor-border/60">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-24 h-24 rounded-full bg-mentor-danger/20 border-2 border-mentor-danger hover:bg-mentor-danger/30 hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-xl shadow-rose-950/40 group"
                  >
                    <Mic size={38} className="text-mentor-danger group-hover:scale-110 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-24 h-24 rounded-full bg-mentor-danger border-2 border-white animate-pulse active:scale-95 flex items-center justify-center transition-all shadow-2xl shadow-rose-600/50"
                  >
                    <Square size={32} className="text-white fill-white" />
                  </button>
                )}
                <div className="text-center text-xs text-gray-300 mt-4 font-medium">
                  {isRecording ? 'Speaking into microphone... Click square to finish' : 'Click microphone to record your verbal response'}
                </div>
                <div className="text-[11px] text-mentor-muted mt-1">
                  Transcribes speech in real time or type your response below
                </div>
              </div>

              {/* Real Input Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Speech Transcript / Defense Submission
                  </label>
                  {responseText.trim() && (
                    <span className="text-[11px] text-gray-400">
                      {responseText.trim().split(/\s+/).length} words
                    </span>
                  )}
                </div>
                <textarea
                  value={responseText}
                  onChange={(e) => {
                    setResponseText(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Record your speech or type your comprehensive response here. Be surgical, follow constraints, and eliminate filler words..."
                  rows={6}
                  className="w-full p-4 text-xs md:text-sm bg-[#090b10] border border-mentor-border rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-mentor-accent resize-none font-mono leading-relaxed"
                />
              </div>

              {/* Validation Warning if empty submission */}
              {validationError && (
                <div className="bg-mentor-danger/10 border border-mentor-danger/50 p-3.5 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle size={16} className="text-mentor-danger shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitAttempt}
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-mentor-accent to-[#d48e00] hover:brightness-110 active:scale-[0.99] text-black font-extrabold text-sm rounded-xl shadow-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Zap size={18} className="animate-spin" />
                    <span>Evaluating Against Uncompromising Rubric...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>SUBMIT FOR BRUTAL EVALUATION</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Brutal Evaluation Results Panel */
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Result Banner */}
              <div className={`border rounded-2xl p-6 ${
                evaluationResult.evaluation.passed 
                  ? 'bg-gradient-to-br from-[#0c1f17] to-mentor-surface border-emerald-800' 
                  : 'bg-gradient-to-br from-[#240e14] to-mentor-surface border-rose-900'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {evaluationResult.evaluation.passed ? (
                      <CheckCircle size={32} className="text-emerald-400" />
                    ) : (
                      <XCircle size={32} className="text-mentor-danger" />
                    )}
                    <div>
                      <h2 className="text-lg md:text-xl font-black text-white">
                        {evaluationResult.evaluation.passed ? 'CHALLENGE PASSED' : 'CHALLENGE FAILED'}
                      </h2>
                      <div className="text-xs text-gray-300 mt-0.5">
                        Performance Score: <span className="font-extrabold text-white text-sm">{evaluationResult.evaluation.overallScore} / 100</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">XP Awarded</div>
                      <div className="text-lg font-black text-mentor-accent">
                        +{evaluationResult.gamificationUpdate.xpEarned} XP
                      </div>
                    </div>
                    {evaluationResult.debtUpdate.pointsDelta > 0 && (
                      <div className="text-right">
                        <div className="text-[10px] text-mentor-danger uppercase font-bold">Debt Added</div>
                        <div className="text-lg font-black text-mentor-danger">
                          +{evaluationResult.debtUpdate.pointsDelta} PTS
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Speech Metrics Strip */}
                {evaluationResult.evaluation.metrics && (
                  <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Speaking Pace</div>
                      <div className="text-sm font-black text-white mt-0.5">{evaluationResult.evaluation.metrics.wordsPerMinute} WPM</div>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Filler Crutches</div>
                      <div className={`text-sm font-black mt-0.5 ${evaluationResult.evaluation.metrics.fillerWordCount > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {evaluationResult.evaluation.metrics.fillerWordCount} Words
                      </div>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <div className="text-gray-400 text-[10px] uppercase font-semibold">Execution Time</div>
                      <div className="text-sm font-black text-white mt-0.5">{evaluationResult.evaluation.metrics.durationSeconds}s</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Granular Dimension Scores */}
              {evaluationResult.evaluation.dimensionScores && evaluationResult.evaluation.dimensionScores.length > 0 && (
                <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                    Sub-Dimension Score Breakdown
                  </div>
                  <div className="flex flex-col gap-3">
                    {evaluationResult.evaluation.dimensionScores.map(d => (
                      <div key={d.dimensionId} className="bg-[#090b10] p-3.5 rounded-xl border border-mentor-border/60">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-white">{d.name}</span>
                          <span className={`font-black ${d.passed ? 'text-emerald-400' : 'text-mentor-danger'}`}>
                            {d.score} / 100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-mentor-border rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${d.passed ? 'bg-emerald-500' : 'bg-mentor-danger'}`} 
                            style={{ width: `${d.score}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brutal Critique Cards */}
              <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <div className="text-xs font-bold text-mentor-danger uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    Single Biggest Weakness Identified
                  </div>
                  <p className="text-sm md:text-base font-bold text-white bg-[#140b0e] p-3.5 rounded-xl border border-rose-950">
                    {evaluationResult.evaluation.brutalCritique.singleBiggestWeakness}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Why It Matters in Real-World Stakes
                  </div>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed bg-[#0a0c12] p-4 rounded-xl border border-mentor-border">
                    {evaluationResult.evaluation.brutalCritique.whyItMatters}
                  </p>
                </div>

                {/* Prescribed Micro-Drill */}
                <div className="bg-[#1c1809] border border-amber-900/60 p-4 rounded-xl">
                  <div className="text-xs font-bold text-mentor-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Zap size={14} />
                    Mandatory Corrective Micro-Drill
                  </div>
                  <p className="text-xs md:text-sm text-amber-200 leading-relaxed mt-1">
                    {evaluationResult.evaluation.brutalCritique.correctiveDrillInstructions}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setEvaluationResult(null);
                    setResponseText('');
                    setRecordDuration(0);
                  }}
                  className="flex-1 py-3.5 px-4 bg-mentor-surface border border-mentor-border hover:bg-mentor-border text-white text-xs md:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw size={16} />
                  <span>Retry & Correct Flaw</span>
                </button>
                <button
                  onClick={loadNextChallenge}
                  className="flex-1 py-3.5 px-4 bg-mentor-accent hover:brightness-110 text-black text-xs md:text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <span>Next Challenge</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
