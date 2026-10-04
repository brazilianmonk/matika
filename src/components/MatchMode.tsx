import React, { useState, useEffect } from 'react';
import { GocchakaItem } from '../types/matika';
import { CheckCircle2, RotateCcw, Zap, Sparkles } from 'lucide-react';

interface MatchModeProps {
  gocchakas: GocchakaItem[];
}

interface MatchPair {
  id: string;
  dukaName: string;
  pada: string;
  dabbattha: string;
}

export const MatchMode: React.FC<MatchModeProps> = ({ gocchakas }) => {
  const [roundPairs, setRoundPairs] = useState<MatchPair[]>([]);
  const [shuffledDabbattha, setShuffledDabbattha] = useState<{ id: string; text: string }[]>([]);
  const [selectedPadaId, setSelectedPadaId] = useState<string | null>(null);
  const [selectedDabbatthaId, setSelectedDabbatthaId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongAttempt, setWrongAttempt] = useState<{ padaId: string; dabbatthaId: string } | null>(null);
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);

  // Initialize a round with 5-6 random pairs from Hetu Gocchaka (or all)
  const initRound = () => {
    const allPairs: MatchPair[] = [];
    gocchakas.forEach(g => {
      g.dukas.forEach(d => {
        d.padas.forEach(p => {
          allPairs.push({
            id: p.id,
            dukaName: d.name,
            pada: p.pada,
            dabbattha: p.dabbattha
          });
        });
        if (d.dukamuttaka) {
          allPairs.push({
            id: `mut-${d.id}`,
            dukaName: d.name,
            pada: `${d.dukamuttaka.pada} (${d.name})`,
            dabbattha: d.dukamuttaka.dabbattha
          });
        }
      });
    });

    // Pick 5 unique pairs
    const chosen = [...allPairs].sort(() => 0.5 - Math.random()).slice(0, 5);
    setRoundPairs(chosen);

    // Shuffle Dabbattha
    const shuffled = chosen
      .map(c => ({ id: c.id, text: c.dabbattha }))
      .sort(() => 0.5 - Math.random());
    setShuffledDabbattha(shuffled);

    setSelectedPadaId(null);
    setSelectedDabbatthaId(null);
    setMatchedIds(new Set());
    setWrongAttempt(null);
    setRoundCompleted(false);
  };

  useEffect(() => {
    initRound();
  }, [gocchakas]);

  const handleSelectPada = (id: string) => {
    if (matchedIds.has(id)) return;
    setSelectedPadaId(id);
    setWrongAttempt(null);

    // If Dabbattha is already selected, check match immediately
    if (selectedDabbatthaId) {
      checkMatch(id, selectedDabbatthaId);
    }
  };

  const handleSelectDabbattha = (id: string) => {
    if (matchedIds.has(id)) return;
    setSelectedDabbatthaId(id);
    setWrongAttempt(null);

    // If Pada is already selected, check match immediately
    if (selectedPadaId) {
      checkMatch(selectedPadaId, id);
    }
  };

  const checkMatch = (padaId: string, dabbatthaId: string) => {
    setAttempts(prev => prev + 1);

    if (padaId === dabbatthaId) {
      // Correct match!
      setMatchedIds(prev => {
        const next = new Set(prev).add(padaId);
        if (next.size === roundPairs.length) {
          setRoundCompleted(true);
        }
        return next;
      });
      setScore(prev => prev + 1);
      setSelectedPadaId(null);
      setSelectedDabbatthaId(null);
    } else {
      // Wrong match
      setWrongAttempt({ padaId, dabbatthaId });
      setTimeout(() => {
        setSelectedPadaId(null);
        setSelectedDabbatthaId(null);
        setWrongAttempt(null);
      }, 700);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 tracking-tight">
            Pada & Dabbattha Matching Drill
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click a Pali Pada on the left, then connect it to its corresponding Dabbattha on the right.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Matched: {matchedIds.size} / {roundPairs.length}</span>
          </div>

          <button
            onClick={initRound}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Round</span>
          </button>
        </div>
      </div>

      {roundCompleted ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs space-y-4">
          <div className="inline-flex p-3 bg-emerald-100 text-emerald-800 rounded-full">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-serif text-slate-900">Round Completed!</h3>
            <p className="text-slate-600 text-sm mt-1">
              You matched all {roundPairs.length} pairs with{' '}
              <strong className="text-slate-900">{attempts}</strong> attempts.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={initRound}
              className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Play Next Round</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Padas */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Pali Pada</span>
              <span className="text-[11px] text-slate-400 font-normal">Select Pada</span>
            </div>

            <div className="space-y-2.5">
              {roundPairs.map(item => {
                const isMatched = matchedIds.has(item.id);
                const isSelected = selectedPadaId === item.id;
                const isError = wrongAttempt?.padaId === item.id;

                let cardStyle = 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900';

                if (isMatched) {
                  cardStyle = 'bg-emerald-50/70 border-emerald-300 text-emerald-950 opacity-70 cursor-default';
                } else if (isError) {
                  cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 animate-shake';
                } else if (isSelected) {
                  cardStyle = 'bg-sky-50 border-sky-600 ring-2 ring-sky-500 text-sky-950 shadow-xs';
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPada(item.id)}
                    disabled={isMatched}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${cardStyle} cursor-pointer`}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                        {item.dukaName}
                      </span>
                      <span className="font-serif italic font-bold text-base text-slate-950">
                        {item.pada}
                      </span>
                    </div>

                    {isMatched && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dabbattha */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Dabbattha (Ultimate Reality)</span>
              <span className="text-[11px] text-slate-400 font-normal">Select Match</span>
            </div>

            <div className="space-y-2.5">
              {shuffledDabbattha.map(item => {
                const isMatched = matchedIds.has(item.id);
                const isSelected = selectedDabbatthaId === item.id;
                const isError = wrongAttempt?.dabbatthaId === item.id;

                let cardStyle = 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900';

                if (isMatched) {
                  cardStyle = 'bg-emerald-50/70 border-emerald-300 text-emerald-950 opacity-70 cursor-default';
                } else if (isError) {
                  cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 animate-shake';
                } else if (isSelected) {
                  cardStyle = 'bg-sky-50 border-sky-600 ring-2 ring-sky-500 text-sky-950 shadow-xs';
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectDabbattha(item.id)}
                    disabled={isMatched}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm leading-relaxed transition-all flex items-start justify-between gap-3 ${cardStyle} cursor-pointer`}
                  >
                    <span className="flex-1 font-medium">{item.text}</span>
                    {isMatched && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
