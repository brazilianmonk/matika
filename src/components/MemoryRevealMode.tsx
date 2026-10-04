import React, { useState, useEffect, useRef } from 'react';
import { GocchakaItem } from '../types/matika';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  X, 
  Sliders,
  Palette
} from 'lucide-react';

interface MemoryRevealModeProps {
  gocchaka: GocchakaItem;
}

interface FlattenedRow {
  rowId: string;
  dukaIndex: number;
  dukaName: string;
  dukaPali: string;
  dukaRowSpan: number;
  isFirstOfDuka: boolean;
  pada: string;
  paliTranslation: string;
  dabbattha: string;
  isDukamuttaka: boolean;
}

export const MemoryRevealMode: React.FC<MemoryRevealModeProps> = ({ gocchaka }) => {
  // Theme: 'dark_green' (matches user's second image) or 'light_green' (matches user's first image)
  const [theme, setTheme] = useState<'dark_green' | 'light_green'>('dark_green');

  // Reveal Granularity: 'row' (one row at a time) or 'duka' (whole duka / all its rows at once)
  const [revealGranularity, setRevealGranularity] = useState<'row' | 'duka'>('row');

  // Reveal interval in seconds
  const [revealDelay, setRevealDelay] = useState<number>(4);

  // Auto-play state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(revealDelay);

  // Set of revealed row IDs
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Self-test score tracking
  const [rememberedIds, setRememberedIds] = useState<Set<string>>(new Set());
  const [missedIds, setMissedIds] = useState<Set<string>>(new Set());

  // Flatten rows from Gocchaka
  const rows: FlattenedRow[] = React.useMemo(() => {
    const list: FlattenedRow[] = [];
    gocchaka.dukas.forEach((duka, dukaIdx) => {
      const totalRows = duka.padas.length + (duka.dukamuttaka ? 1 : 0);

      duka.padas.forEach((p, pIdx) => {
        list.push({
          rowId: p.id,
          dukaIndex: dukaIdx,
          dukaName: duka.name,
          dukaPali: duka.paliName,
          dukaRowSpan: totalRows,
          isFirstOfDuka: pIdx === 0,
          pada: p.pada,
          paliTranslation: p.paliTranslation,
          dabbattha: p.dabbattha,
          isDukamuttaka: false
        });
      });

      if (duka.dukamuttaka) {
        list.push({
          rowId: `mut-${duka.id}`,
          dukaIndex: dukaIdx,
          dukaName: duka.name,
          dukaPali: duka.paliName,
          dukaRowSpan: totalRows,
          isFirstOfDuka: false,
          pada: duka.dukamuttaka.pada,
          paliTranslation: duka.dukamuttaka.paliTranslation,
          dabbattha: duka.dukamuttaka.dabbattha,
          isDukamuttaka: true
        });
      }
    });
    return list;
  }, [gocchaka]);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset all
  const handleReset = () => {
    setIsPlaying(false);
    setActiveRowIndex(0);
    setCountdown(revealDelay);
    setRevealedIds(new Set());
    setRememberedIds(new Set());
    setMissedIds(new Set());
  };

  // Reveal All
  const handleRevealAll = () => {
    setIsPlaying(false);
    setRevealedIds(new Set(rows.map(r => r.rowId)));
  };

  // Hide All
  const handleHideAll = () => {
    setIsPlaying(false);
    setRevealedIds(new Set());
    setActiveRowIndex(0);
  };

  // Toggle individual row reveal
  const toggleRowReveal = (rowId: string) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  // Reveal current active row or duka and advance
  const revealCurrentAndAdvance = () => {
    if (activeRowIndex >= rows.length) {
      setIsPlaying(false);
      return;
    }

    const currentRow = rows[activeRowIndex];

    if (revealGranularity === 'duka') {
      // Reveal all rows of this duka
      const dukaRowIds = rows
        .filter(r => r.dukaIndex === currentRow.dukaIndex)
        .map(r => r.rowId);

      setRevealedIds(prev => {
        const next = new Set(prev);
        dukaRowIds.forEach(id => next.add(id));
        return next;
      });

      // Find first row of next duka
      const nextIndex = rows.findIndex((r, idx) => idx > activeRowIndex && r.dukaIndex !== currentRow.dukaIndex);
      if (nextIndex !== -1) {
        setActiveRowIndex(nextIndex);
        setCountdown(revealDelay);
      } else {
        setIsPlaying(false);
        setActiveRowIndex(rows.length);
      }
    } else {
      // Row by row
      setRevealedIds(prev => new Set(prev).add(currentRow.rowId));

      if (activeRowIndex + 1 < rows.length) {
        setActiveRowIndex(prev => prev + 1);
        setCountdown(revealDelay);
      } else {
        setIsPlaying(false);
        setActiveRowIndex(rows.length);
      }
    }
  };

  // Step back
  const handlePrevStep = () => {
    if (activeRowIndex > 0) {
      const newIdx = activeRowIndex - 1;
      setActiveRowIndex(newIdx);
      setCountdown(revealDelay);
    }
  };

  // Step forward manually
  const handleNextStep = () => {
    revealCurrentAndAdvance();
  };

  // Auto-play interval effect
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (activeRowIndex >= rows.length) {
      setIsPlaying(false);
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          revealCurrentAndAdvance();
          return revealDelay;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeRowIndex, revealDelay, revealGranularity, rows]);

  // Keyboard shortcut listener: Space to toggle play/pause or next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRowIndex, revealGranularity, isPlaying]);

  // Evaluation markings
  const markRemembered = (rowId: string) => {
    setRememberedIds(prev => new Set(prev).add(rowId));
    setMissedIds(prev => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  };

  const markMissed = (rowId: string) => {
    setMissedIds(prev => new Set(prev).add(rowId));
    setRememberedIds(prev => {
      const next = new Set(prev);
      next.delete(rowId);
      return next;
    });
  };

  // Theme styling definitions
  const isDarkGreen = theme === 'dark_green';

  const tableBgClass = isDarkGreen ? 'bg-[#0f2e1a] text-white' : 'bg-white text-slate-900';
  const tableBorderClass = isDarkGreen ? 'border-white/90' : 'border-slate-900';
  const headerBgClass = isDarkGreen ? 'bg-[#2a4d33] text-white border-white/90' : 'bg-slate-300 text-slate-950 border-slate-900';
  const dukaColBgClass = isDarkGreen ? 'bg-[#1b3d24] text-white border-white/90' : 'bg-slate-200 text-slate-900 border-slate-900';
  const padaColBgClass = isDarkGreen ? 'bg-[#124b28] text-white border-white/80' : 'bg-[#86efac] text-slate-950 border-slate-900';
  const dabbatthaColBgClass = isDarkGreen ? 'bg-[#124b28] text-white' : 'bg-[#86efac] text-slate-950';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* Title */}
      <div className="text-center pt-2">
        <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-slate-950">
          Ultimate Representation of Duka Mātikā
        </h1>
        <h2 className="text-lg md:text-xl font-bold font-serif text-sky-900 mt-1">
          {gocchaka.number}. {gocchaka.name} — Memory Recall Mode
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
          The table is shown in full with Dabbattha hidden. Let it reveal row-by-row or duka-by-duka to test and strengthen your recall!
        </p>
      </div>

      {/* Control Console */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Play / Step controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause Drill' : 'Start Auto-Reveal'}</span>
            </button>

            <button
              onClick={handlePrevStep}
              disabled={activeRowIndex === 0}
              className="p-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Row"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextStep}
              disabled={activeRowIndex >= rows.length}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Row / Reveal (Spacebar or Right Arrow)"
            >
              <span>Next Row</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
              title="Reset Drill to Top"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Granularity & Speed & Theme options */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Granularity toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setRevealGranularity('row')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  revealGranularity === 'row' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Row by Row
              </button>
              <button
                type="button"
                onClick={() => setRevealGranularity('duka')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  revealGranularity === 'duka' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
                title="Reveals all rows of each Duka simultaneously"
              >
                Whole Duka
              </button>
            </div>

            {/* Delay selector */}
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] text-slate-500">Delay:</span>
              <select
                value={revealDelay}
                onChange={e => {
                  const val = Number(e.target.value);
                  setRevealDelay(val);
                  setCountdown(val);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value={2}>2s (Fast)</option>
                <option value={3}>3s</option>
                <option value={4}>4s (Standard)</option>
                <option value={6}>6s (Thoughtful)</option>
                <option value={8}>8s (Slow)</option>
              </select>
            </div>

            {/* Theme switcher */}
            <button
              onClick={() => setTheme(t => t === 'dark_green' ? 'light_green' : 'dark_green')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
              title="Toggle between Deep Green and Light Green themes"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isDarkGreen ? 'Deep Green' : 'Light Green'}</span>
            </button>

            {/* Quick bulk visibility */}
            <button
              onClick={revealedIds.size === rows.length ? handleHideAll : handleRevealAll}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              {revealedIds.size === rows.length ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hide All</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reveal All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live progress and active indicator banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              Progress: {revealedIds.size} / {rows.length} Revealed
            </span>
            {isPlaying && (
              <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Revealing in {countdown}s...
              </span>
            )}
          </div>

          {/* Self-check stats */}
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 font-medium">
              ✓ Remembered: {rememberedIds.size}
            </span>
            <span className="text-rose-600 font-medium">
              ✗ Missed: {missedIds.size}
            </span>
          </div>
        </div>
      </div>

      {/* The Master Table in Full Display */}
      <div className={`overflow-x-auto border-2 ${tableBorderClass} rounded-xs shadow-md ${tableBgClass} transition-colors`}>
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className={`${headerBgClass} border-b-2 font-bold text-center`}>
              <th className={`py-2 sm:py-2.5 px-2.5 sm:px-4 border-r-2 ${tableBorderClass} w-1/4 font-semibold text-sm sm:text-base`}>
                Duka
              </th>
              <th className={`py-2 sm:py-2.5 px-2.5 sm:px-4 border-r-2 ${tableBorderClass} w-1/3 font-semibold text-sm sm:text-base`}>
                Pada
              </th>
              <th className="py-2 sm:py-2.5 px-2.5 sm:px-4 w-5/12 font-semibold text-sm sm:text-base">
                Dabbattha
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isRevealed = revealedIds.has(row.rowId);
              const isActive = activeRowIndex === idx;
              const isRemembered = rememberedIds.has(row.rowId);
              const isMissed = missedIds.has(row.rowId);

              // Row border styling
              const rowBorder = idx === rows.length - 1 ? '' : `border-b ${isDarkGreen ? 'border-white/60' : 'border-slate-800'}`;

              return (
                <tr
                  key={row.rowId}
                  className={`transition-all ${rowBorder} ${
                    isActive ? 'ring-2 ring-amber-400 z-10 relative' : ''
                  }`}
                >
                  {/* Duka cell with rowSpan */}
                  {row.isFirstOfDuka && (
                    <td
                      rowSpan={row.dukaRowSpan}
                      className={`align-top py-3 px-2.5 sm:px-4 ${dukaColBgClass} border-r-2 ${tableBorderClass} font-medium text-sm md:text-base leading-snug`}
                    >
                      <div className="font-semibold">{row.dukaName}</div>
                      <div className={`text-xs italic mt-0.5 ${isDarkGreen ? 'text-emerald-200' : 'text-slate-600'}`}>
                        {row.dukaPali}
                      </div>
                    </td>
                  )}

                  {/* Pada cell */}
                  <td className={`py-2.5 px-2.5 sm:px-4 ${padaColBgClass} border-r-2 ${tableBorderClass}`}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold italic text-sm md:text-[15px] tracking-wide">
                        {row.pada}
                      </span>
                      {row.isDukamuttaka && (
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm ${
                          isDarkGreen ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          Exempt
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Dabbattha cell (Hidden or Revealed) */}
                  <td
                    className={`py-2.5 px-2.5 sm:px-4 ${dabbatthaColBgClass} text-sm md:text-[14px] leading-relaxed relative select-none cursor-pointer transition-all ${
                      isActive && !isRevealed ? 'bg-emerald-900/40 ring-1 ring-amber-400' : ''
                    }`}
                    onClick={() => toggleRowReveal(row.rowId)}
                    title={isRevealed ? 'Click to hide' : 'Click to reveal'}
                  >
                    {isRevealed ? (
                      <div className="flex items-start justify-between gap-2 animate-fadeIn">
                        <div className="font-medium flex-1">
                          {row.dabbattha}
                        </div>

                        {/* Self-check buttons on revealed row */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => markRemembered(row.rowId)}
                            className={`p-1 rounded-sm transition-all ${
                              isRemembered
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : isDarkGreen
                                ? 'text-white/60 hover:text-white hover:bg-white/10'
                                : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title="I remembered this correctly!"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => markMissed(row.rowId)}
                            className={`p-1 rounded-sm transition-all ${
                              isMissed
                                ? 'bg-rose-500 text-white shadow-xs'
                                : isDarkGreen
                                ? 'text-white/60 hover:text-white hover:bg-white/10'
                                : 'text-slate-500 hover:text-rose-700 hover:bg-rose-100'
                            }`}
                            title="I forgot or missed this"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${isActive ? 'bg-amber-400 animate-ping' : 'bg-emerald-400/40'}`} />
                          <span className={`text-xs italic tracking-wider ${isDarkGreen ? 'text-emerald-300/70' : 'text-emerald-900/60'}`}>
                            {isActive ? 'Recall in your mind... (revealing next)' : 'Hidden (click or auto-reveal)'}
                          </span>
                        </div>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-sm ${
                          isDarkGreen ? 'bg-white/10 text-white/70' : 'bg-emerald-200/60 text-emerald-950'
                        }`}>
                          Reveal
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Helpful keyboard navigation instructions */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded-sm text-[10px] font-mono">Space</kbd> Play/Pause
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded-sm text-[10px] font-mono">→</kbd> Next Step
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-200 border border-slate-300 rounded-sm text-[10px] font-mono">←</kbd> Prev Step
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Tip: Say the Dabbattha aloud or in your mind before it reveals!</span>
        </div>
      </div>
    </div>
  );
};
