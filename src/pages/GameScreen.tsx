import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLevelById } from '../engine/levels';
import { parseCFGText, validateCFG } from '../engine/cfgParser';
import { solveString, replayToStep, generateSamples } from '../engine/simulator';
import type { SimAction, GameMode, CFGGrammar } from '../engine/types';

import InputTape from '../components/InputTape';
import StackDisplay from '../components/StackDisplay';
import ParseTree from '../components/ParseTree';
import PDADiagram from '../components/PDADiagram';
import RuleCards from '../components/RuleCards';
import StepExplainer from '../components/StepExplainer';
import PlaybackControls from '../components/PlaybackControls';
import ResultOverlay from '../components/ResultOverlay';

export default function GameScreen() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const level = getLevelById(levelId || '');

  // Grammar state
  const [grammarText, setGrammarText] = useState(level?.grammar || 'S -> a S b | e');
  const [cfg, setCfg] = useState<CFGGrammar>(() => parseCFGText(level?.grammar || 'S -> a S b | e'));
  
  const defaultInput = level?.id === 'custom' ? 'aabb' : (level?.examples[1] || level?.examples[0] || '');
  const [inputString, setInputString] = useState(defaultInput);
  const [inputDraft, setInputDraft] = useState(defaultInput);
  const [samples, setSamples] = useState<string[]>([]);
  const [hasEditedInput, setHasEditedInput] = useState(false);
  const [grammarError, setGrammarError] = useState<string | null>(null);

  // Simulation state
  const [path, setPath] = useState<SimAction[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [mode, setMode] = useState<GameMode>('auto');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [mistakes, setMistakes] = useState(0);
  const [result, setResult] = useState<'accepted' | 'rejected' | null>(null);
  const [shaking, setShaking] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isAmbiguous, setIsAmbiguous] = useState(false);

  const timerRef = useRef<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Derived step state
  const stepState = path && loaded
    ? replayToStep(path, currentStep, inputString)
    : { stack: [], treeRoot: null, inputIdx: 0 };

  const currentAction = path && loaded ? path[currentStep] : null;

  // PDA active state
  const pdaState = (() => {
    if (!currentAction) return null;
    if (currentAction.type === 'setup') return 'q1';
    if (currentAction.type === 'accept') return 'qaccept';
    if (currentAction.type === 'match' && currentAction.sym === '$') return 'qaccept';
    return 'q1';
  })() as 'q0' | 'q1' | 'qaccept' | null;

  // Active expand node id
  const activeNodeId = currentAction?.type === 'expand' ? currentAction.targetId : undefined;

  // Top of stack variable (for manual mode rule picking)
  const topOfStack = (() => {
    const s = stepState.stack;
    if (!s.length) return null;
    const top = s[s.length - 1];
    const sym = typeof top === 'string' ? top : top.sym;
    return cfg.variables.has(sym) ? sym : null;
  })();

  // Correct rule for this step (for manual mode validation)
  const correctRule = (() => {
    if (!path || !loaded) return null;
    const nextAction = path[currentStep + 1];
    if (nextAction?.type === 'expand') return nextAction.rule;
    return null;
  })();

  // Load / solve
  const load = useCallback((str: string, grammar: CFGGrammar) => {
    stopTimer();
    setIsPlaying(false);
    setResult(null);
    setMistakes(0);
    const { path: p, isAmbiguous: ambig } = solveString(grammar, str);
    setPath(p);
    setIsAmbiguous(ambig);
    setCurrentStep(0);
    setLoaded(true);
    if (!p) setResult('rejected');
  }, []);

  useEffect(() => {
    try {
      const trimmed = grammarText.trim();
      if (!trimmed) throw new Error("Grammar cannot be empty.");

      const newCfg = parseCFGText(grammarText);
      
      if (newCfg.variables.size === 0) {
        throw new Error("No valid rules found. Use format: S -> a S b | e");
      }
      if (!newCfg.rules[newCfg.startSymbol]) {
        throw new Error(`Start symbol '${newCfg.startSymbol}' has no derivations.`);
      }

      const validationError = validateCFG(newCfg);
      if (validationError) throw new Error(validationError);

      setCfg(newCfg);
      setGrammarError(null);
      const newSamples = generateSamples(newCfg);
      setSamples(newSamples);
      
      let stringToRun = inputDraft;
      // Auto-update the "draft" input string when they are editing the custom grammar
      if (level?.id === 'custom' && !hasEditedInput && newSamples.length > 0) {
        // Find a non-empty string as a good default example
        stringToRun = newSamples.find((s) => s.length > 0) || newSamples[0] || '';
        setInputDraft(stringToRun);
      }
      
      setInputString(stringToRun);
      load(stringToRun, newCfg);
    } catch (err: any) {
      setGrammarError(err.message);
      setSamples([]);
    }
  }, [grammarText, level?.id, hasEditedInput]);

  useEffect(() => {
    if (level) load(inputString, cfg);
  }, []); // Only on mount

  // Timer
  function stopTimer() {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  const goToStep = useCallback((idx: number) => {
    if (!path) return;
    if (idx < 0 || idx >= path.length) return;
    setCurrentStep(idx);
    if (path[idx].type === 'accept') {
      setResult('accepted');
      stopTimer();
      setIsPlaying(false);
    }
  }, [path]);

  const handlePlay = useCallback(() => {
    if (!path) return;
    if (isPlaying) {
      stopTimer();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      timerRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (!path || next >= path.length) {
            stopTimer();
            setIsPlaying(false);
            return prev;
          }
          if (path[next]?.type === 'accept') {
            setResult('accepted');
            stopTimer();
            setIsPlaying(false);
          }
          return next;
        });
      }, speed);
    }
  }, [isPlaying, path, speed]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' ||
          (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goToStep(currentStep + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goToStep(currentStep - 1); }
      if (e.key === ' ')          { e.preventDefault(); handlePlay(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentStep, goToStep, handlePlay]);

  // Manual mode: rule pick
  const handleRulePick = (rule: string[], isCorrect: boolean) => {
    if (isCorrect) {
      goToStep(currentStep + 1);
    } else {
      setMistakes((m) => m + 1);
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
    }
  };

  const handleReset = () => {
    stopTimer();
    setIsPlaying(false);
    setResult(null);
    setMistakes(0);
    setCurrentStep(0);
    setLoaded(false);
    setTimeout(() => setLoaded(true), 10);
  };

  const handleLoad = () => {
    const cleaned = inputDraft.replace(/\s+/g, '');
    setInputString(cleaned);
    load(cleaned, cfg);
  };

  if (!level) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Level not found.</p>
        <button onClick={() => navigate('/')}>← Back</button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 20px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer',
            fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)',
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '5px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 600,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        >
          ← Back
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

        <span style={{ fontSize: '20px' }}>{level.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', lineHeight: 1.2 }}>{level.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{level.subtitle}</div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {mistakes > 0 && (
            <span style={{
              fontSize: '12px', padding: '4px 12px',
              borderRadius: '100px',
              background: 'var(--amber-light)',
              border: '1px solid var(--amber-border)',
              color: 'var(--amber)',
              fontWeight: 700,
            }}>
              ⚡ {mistakes} mistake{mistakes !== 1 ? 's' : ''}
            </span>
          )}
          {loaded && path && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--text-subtle)', padding: '4px 12px',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '100px',
            }}>
              {currentStep + 1} / {path.length}
            </span>
          )}
        </div>
      </div>

      {/* Custom Grammar Panel */}
      {level.id === 'custom' && (
        <div style={{
          padding: '10px 20px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0,
        }}>
          <textarea
            value={grammarText}
            onChange={(e) => setGrammarText(e.target.value)}
            rows={2}
            style={{
              width: '100%', resize: 'none', padding: '7px 10px', fontSize: '12px',
              borderRadius: 'var(--radius-sm)', border: `1px solid ${grammarError ? 'var(--red)' : 'var(--border)'}`,
              outline: 'none', fontFamily: 'var(--font-mono)', color: 'var(--text)',
              background: 'var(--surface-2)',
            }}
            placeholder="S -> a S b | e"
          />
          {grammarError && (
            <div style={{ color: 'var(--red)', fontSize: '11px', fontWeight: 600 }}>
              ⚠️ {grammarError}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px 16px', gap: '10px' }}>

        {/* Input row */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <InputTape input={inputString} currentIdx={stepState.inputIdx} />
          </div>
        </div>

        {/* Input string controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <input
            type="text"
            value={inputDraft}
            onChange={(e) => {
              setInputDraft(e.target.value);
              setHasEditedInput(true);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLoad(); }}
            placeholder="Enter input string..."
            style={{
              flex: 1, padding: '7px 12px', fontSize: '13px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              outline: 'none', fontFamily: 'var(--font-mono)', color: 'var(--text)',
              background: 'var(--surface)',
            }}
          />
          <button
            onClick={handleLoad}
            disabled={!!grammarError}
            style={{
              padding: '7px 18px', borderRadius: 'var(--radius-sm)',
              background: grammarError ? 'var(--surface-3)' : 'var(--accent)', 
              border: 'none', color: grammarError ? 'var(--text-subtle)' : 'white',
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '13px', 
              cursor: grammarError ? 'not-allowed' : 'pointer',
              boxShadow: grammarError ? 'none' : 'var(--accent-glow)',
              transition: 'all 0.2s ease',
            }}
          >
            Run
          </button>
          {/* Sample chips */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(level.id !== 'custom' ? level.examples : samples).slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => { 
                  setInputDraft(s); 
                  setInputString(s); 
                  setHasEditedInput(true);
                  load(s, cfg); 
                }}
                style={{
                  padding: '4px 10px', fontSize: '12px',
                  fontFamily: 'var(--font-mono)', fontWeight: 500,
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                {s || 'ε'}
              </button>
            ))}
          </div>
        </div>

        {/* Ambiguity Warning */}
        {isAmbiguous && loaded && path && (
          <div style={{ 
            marginTop: '4px',
            padding: '10px 16px', 
            background: '#fffbeb', 
            border: '1px solid #fcd34d', 
            borderRadius: 'var(--radius-sm)', 
            color: '#92400e', 
            fontSize: '13px', 
            lineHeight: 1.5,
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <div style={{ fontSize: '16px', marginTop: '2px' }}>⚠️</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>AMBIGUOUS — This grammar accepts multiple derivations!</div>
              <div><strong>Fix:</strong> Add precedence rules or restructure grammar to enforce a single parse tree for each string.</div>
            </div>
          </div>
        )}

        {/* Center arena */}
        <div
          ref={boardRef}
          className={shaking ? 'shake' : ''}
          style={{ flex: 1, display: 'flex', gap: '10px', minHeight: 0 }}
        >
          {/* Left: Stack */}
          <div style={{ width: '100px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <StackDisplay stack={stepState.stack} variables={cfg.variables} />
          </div>

          {/* Center: Parse Tree */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
            <ParseTree treeRoot={stepState.treeRoot} grammar={cfg} activeId={activeNodeId} />
          </div>

          {/* Right: PDA + Step explainer */}
          <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <PDADiagram activeState={pdaState} startSymbol={cfg.startSymbol} currentAction={currentAction} />
            {currentAction && (
              <StepExplainer
                action={currentAction}
                stepNum={currentStep + 1}
                totalSteps={path?.length || 0}
              />
            )}
          </div>
        </div>

        {/* Manual mode rule cards */}
        {mode === 'manual' && loaded && path && (
          <RuleCards
            grammar={cfg}
            topOfStack={topOfStack}
            correctRule={correctRule}
            mode={mode}
            onRulePick={handleRulePick}
            disabled={isPlaying || !!result}
          />
        )}

        {/* Playback controls */}
        <PlaybackControls
          mode={mode}
          onModeChange={(m) => { setMode(m); stopTimer(); setIsPlaying(false); }}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPrev={() => goToStep(currentStep - 1)}
          onNext={() => goToStep(currentStep + 1)}
          onReset={handleReset}
          speed={speed}
          onSpeedChange={(v) => { setSpeed(v); if (isPlaying) { stopTimer(); setIsPlaying(false); } }}
          canPrev={currentStep > 0}
          canNext={!!path && currentStep < path.length - 1}
          hasPath={!!path && loaded}
        />
      </div>

      {/* Result overlay */}
      <ResultOverlay
        result={result}
        inputString={inputString}
        stepCount={path?.length || 0}
        mistakes={mistakes}
        onReset={() => { setResult(null); handleReset(); }}
      />
    </div>
  );
}
