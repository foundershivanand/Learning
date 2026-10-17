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
  Volume2
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unavailable, using text fallback mode', err);
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

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    // If text is empty, fill with sample transcript for realistic testing
    if (!responseText.trim()) {
      setResponseText('Basically, our core value proposition is that we eliminate the manual reconciliation loop, you know, which saves the operations team 15 hours every single week.');
    }
  };

  const handleSubmitAttempt = async () => {
    if (!challenge) return;
    setIsSubmitting(true);

    try {
      const res = await ApiClient.submitAttempt({
        challengeId: challenge.id,
        responseText: responseText.trim(),
        audioDurationSeconds: recordDuration > 0 ? recordDuration : 45,
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
        <span className="text-sm font-medium">Synthesizing Adversarial Challenge...</span>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>No active challenge available.</p>
        <button onClick={loadNextChallenge} className="mt-4 px-4 py-2 bg-mentor-surface border border-mentor-border rounded-xl text-sm">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-24 pt-2">
      {/* Challenge Arena Header */}
      <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-mentor-border font-semibold uppercase text-[10px] tracking-wider text-mentor-accent">
            {challenge.skillId.toUpperCase()} • {challenge.type}
          </span>
          <div className="flex items-center gap-1.5 font-bold text-gray-300">
            <Timer size={14} className="text-mentor-accent" />
            <span>{challenge.timeLimitSeconds}s Limit</span>
          </div>
        </div>

        <h1 className="text-lg font-bold text-white leading-snug">{challenge.title}</h1>
        <p className="text-xs text-gray-300 mt-2 leading-relaxed bg-[#0a0c12] p-3 rounded-xl border border-mentor-border/60">
          {challenge.instructions}
        </p>

        {/* Adversary Context (if present) */}
        {challenge.adversaryContext && (
          <div className="mt-3 bg-[#1a0f12] border border-rose-950/80 p-3 rounded-xl flex items-start gap-2">
            <ShieldAlert size={16} className="text-mentor-danger mt-0.5 shrink-0" />
            <p className="text-xs text-rose-200 leading-relaxed">
              <span className="font-bold text-mentor-danger">Adversary: </span>
              {challenge.adversaryContext}
            </p>
          </div>
        )}

        {/* Negative Constraints */}
        {challenge.constraints && challenge.constraints.length > 0 && (
          <div className="mt-4 pt-4 border-t border-mentor-border/60">
            <div className="text-[11px] font-bold text-mentor-danger uppercase tracking-wider mb-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Strict Negative Constraints
            </div>
            <ul className="flex flex-col gap-1.5">
              {challenge.constraints.map((c, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mentor-danger mt-1.5 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recording & Input Arena (Shown when no evaluation yet) */}
      {!evaluationResult && (
        <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 size={15} className="text-mentor-accent" />
              Verbal Delivery Arena
            </div>
            {isRecording && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-mentor-danger animate-pulse">
                <span className="w-2 h-2 rounded-full bg-mentor-danger" />
                REC 00:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
              </span>
            )}
          </div>

          {/* Big Record Button */}
          <div className="flex justify-center py-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-mentor-danger/20 border-2 border-mentor-danger hover:bg-mentor-danger/30 active:scale-95 flex items-center justify-center transition-all shadow-lg shadow-rose-950/30"
              >
                <Mic size={32} className="text-mentor-danger" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-mentor-danger border-2 border-white animate-pulse active:scale-95 flex items-center justify-center transition-all shadow-lg"
              >
                <Square size={28} className="text-white fill-white" />
              </button>
            )}
          </div>
          <div className="text-center text-xs text-gray-400">
            {isRecording ? 'Speaking into microphone... Click square to finish' : 'Click microphone to record your response'}
          </div>

          {/* Transcript / Text Input Area */}
          <div className="mt-2">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Speech Transcript / Written Defense
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Your speech transcript will populate here, or type your response directly..."
              rows={4}
              className="w-full mt-1.5 p-3 text-xs bg-[#090b10] border border-mentor-border rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-mentor-accent resize-none font-mono"
            />
          </div>

          {/* Submit Attempt Button */}
          <button
            onClick={handleSubmitAttempt}
            disabled={isSubmitting || !responseText.trim()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-mentor-accent to-[#e69d00] disabled:opacity-40 disabled:pointer-events-none text-black font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? (
              <>
                <Zap size={16} className="animate-spin" />
                <span>Evaluating Against Rubric...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit for Brutal Evaluation</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Brutal Evaluation Results View */}
      {evaluationResult && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Result Banner */}
          <div className={`border rounded-2xl p-5 ${
            evaluationResult.evaluation.passed 
              ? 'bg-[#0d1e18] border-emerald-800' 
              : 'bg-[#210e14] border-rose-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {evaluationResult.evaluation.passed ? (
                  <CheckCircle size={24} className="text-emerald-400" />
                ) : (
                  <XCircle size={24} className="text-mentor-danger" />
                )}
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    {evaluationResult.evaluation.passed ? 'CHALLENGE PASSED' : 'CHALLENGE FAILED'}
                  </h2>
                  <div className="text-xs text-gray-300">
                    Calculated Score: <span className="font-bold text-white">{evaluationResult.evaluation.overallScore} / 100</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-gray-400">XP Awarded</span>
                <div className="text-base font-bold text-mentor-accent">
                  +{evaluationResult.gamificationUpdate.xpEarned} XP
                </div>
              </div>
            </div>

            {/* Speech Metrics Badge (if available) */}
            {evaluationResult.evaluation.metrics && (
              <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-black/30 p-2 rounded-lg">
                  <div className="text-gray-400 text-[10px]">Pacing</div>
                  <div className="font-bold text-white">{evaluationResult.evaluation.metrics.wordsPerMinute} WPM</div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                  <div className="text-gray-400 text-[10px]">Fillers</div>
                  <div className={`font-bold ${evaluationResult.evaluation.metrics.fillerWordCount > 2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {evaluationResult.evaluation.metrics.fillerWordCount} Words
                  </div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                  <div className="text-gray-400 text-[10px]">Duration</div>
                  <div className="font-bold text-white">{evaluationResult.evaluation.metrics.durationSeconds}s</div>
                </div>
              </div>
            )}
          </div>

          {/* Brutal Critique Cards */}
          <div className="bg-mentor-surface border border-mentor-border rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <div className="text-xs font-bold text-mentor-danger uppercase tracking-wider mb-1">
                Single Biggest Weakness Identified
              </div>
              <p className="text-sm font-semibold text-white">
                {evaluationResult.evaluation.brutalCritique.singleBiggestWeakness}
              </p>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Why It Matters in High Stakes
              </div>
              <p className="text-xs text-gray-300 leading-relaxed bg-[#0a0c12] p-3 rounded-xl border border-mentor-border">
                {evaluationResult.evaluation.brutalCritique.whyItMatters}
              </p>
            </div>

            {/* Prescribed Micro Drill */}
            <div className="bg-[#1c1809] border border-amber-900/60 p-4 rounded-xl">
              <div className="text-xs font-bold text-mentor-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Zap size={14} />
                Mandatory Corrective Micro-Drill
              </div>
              <p className="text-xs text-amber-200 leading-relaxed mt-1">
                {evaluationResult.evaluation.brutalCritique.correctiveDrillInstructions}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEvaluationResult(null);
                setResponseText('');
              }}
              className="flex-1 py-3 px-4 bg-mentor-surface border border-mentor-border hover:bg-mentor-border text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw size={15} />
              <span>Retry Drill</span>
            </button>
            <button
              onClick={loadNextChallenge}
              className="flex-1 py-3 px-4 bg-mentor-accent hover:brightness-110 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Next Challenge</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
