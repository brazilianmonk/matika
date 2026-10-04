import React, { useState, useMemo } from 'react';
import { GocchakaItem, Flashcard } from '../types/matika';
import { generateFlashcards } from '../utils/quizGenerator';
import { RotateCw, Check, AlertCircle, ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';

interface FlashcardModeProps {
  gocchakas: GocchakaItem[];
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({ gocchakas }) => {
  const [selectedGocchakaId, setSelectedGocchakaId] = useState<string>('hetu-gocchaka');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reverseMode, setReverseMode] = useState(false); // Front is Dabbattha, Back is Pada

  const activeGocchakas = useMemo(() => {
    if (selectedGocchakaId === 'all') return gocchakas;
    return gocchakas.filter(g => g.id === selectedGocchakaId);
  }, [gocchakas, selectedGocchakaId]);

  const [cards, setCards] = useState<Flashcard[]>(() => generateFlashcards(activeGocchakas));

  const handleGocchakaChange = (id: string) => {
    setSelectedGocchakaId(id);
    const targetGocchakas = id === 'all' ? gocchakas : gocchakas.filter(g => g.id === id);
    const newCards = generateFlashcards(targetGocchakas);
    setCards(newCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const currentCard = cards[currentIndex];

  const toggleMastered = (cardId: string) => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
    // Auto advance if marked mastered
    if (!masteredIds.has(cardId) && currentIndex < cards.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 250);
    }
  };

  if (!currentCard) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No flashcards available.
      </div>
    );
  }

  const isMastered = masteredIds.has(currentCard.id);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <select
            value={selectedGocchakaId}
            onChange={e => handleGocchakaChange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
          >
            <option value="hetu-gocchaka">1. Hetu Gocchaka (6 Dukas)</option>
            <option value="all">All Gocchakas</option>
          </select>

          <button
            onClick={() => setReverseMode(!reverseMode)}
            className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
              reverseMode
                ? 'bg-sky-50 border-sky-300 text-sky-800 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Swap front/back"
          >
            {reverseMode ? 'Front: Dabbattha' : 'Front: Pada'}
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded-md bg-white hover:bg-slate-50"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
          <span>
            Card <strong className="text-slate-900">{currentIndex + 1}</strong> of{' '}
            <strong className="text-slate-900">{cards.length}</strong>
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm font-semibold">
            {masteredIds.size} Mastered
          </span>
        </div>
      </div>

      {/* Flashcard container with 3D perspective */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[300px] cursor-pointer select-none group perspective-1000"
      >
        <div
          className={`w-full h-full min-h-[300px] rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between p-6 sm:p-8 shadow-sm ${
            isFlipped
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-50 border-emerald-300 text-slate-950 hover:border-emerald-400'
          }`}
        >
          {/* Card Top Banner */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
            <span className={`font-semibold uppercase tracking-wider ${isFlipped ? 'text-sky-300' : 'text-emerald-900'}`}>
              {currentCard.dukaName}
            </span>
            <div className="flex items-center gap-2">
              {currentCard.isDukamuttaka && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-600">
                  Dukamuttaka
                </span>
              )}
              <span className={`text-[11px] font-mono ${isFlipped ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFlipped ? 'Answer' : 'Prompt'}
                <span className="hidden xs:inline">{isFlipped ? ' (Click to flip back)' : ' (Click to reveal)'}</span>
              </span>
            </div>
          </div>

          {/* Card Main Body */}
          <div className="py-6 text-center my-auto">
            {!reverseMode ? (
              // Standard: Front = Pada, Back = Dabbattha
              !isFlipped ? (
                <div className="space-y-3">
                  <div className="font-serif italic font-bold text-2xl sm:text-3xl text-emerald-950">
                    {currentCard.pada}
                  </div>
                  {currentCard.paliTranslation && (
                    <div className="text-sm text-emerald-900/80 font-normal">
                      &quot;{currentCard.paliTranslation}&quot;
                    </div>
                  )}
                  <p className="text-xs text-slate-500 pt-3">
                    Can you recall its Dabbattha (cittas, cetasikas, rūpas, Nibbāna)?
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="text-xs uppercase font-mono text-slate-400 tracking-wider text-center">
                    Ultimate Reality (Dabbattha)
                  </div>
                  <div className="text-base sm:text-lg font-medium text-emerald-300 leading-relaxed text-center">
                    {currentCard.dabbattha}
                  </div>

                  {/* Reality components */}
                  {(currentCard.cittas || currentCard.cetasikas || currentCard.rupa || currentCard.nibbana) && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs border-t border-slate-800">
                      {currentCard.cittas && (
                        <div className="bg-slate-800/80 p-2 rounded-md">
                          <span className="text-slate-400 block text-[10px] uppercase">Cittas</span>
                          <span className="text-slate-100 font-semibold">{currentCard.cittas}</span>
                        </div>
                      )}
                      {currentCard.cetasikas && (
                        <div className="bg-slate-800/80 p-2 rounded-md col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block text-[10px] uppercase">Cetasikas</span>
                          <span className="text-slate-100 font-semibold">{currentCard.cetasikas}</span>
                        </div>
                      )}
                      {currentCard.rupa && (
                        <div className="bg-slate-800/80 p-2 rounded-md">
                          <span className="text-slate-400 block text-[10px] uppercase">Rūpa</span>
                          <span className="text-slate-100 font-semibold">{currentCard.rupa}</span>
                        </div>
                      )}
                      {currentCard.nibbana && (
                        <div className="bg-slate-800/80 p-2 rounded-md">
                          <span className="text-slate-400 block text-[10px] uppercase">Nibbāna</span>
                          <span className="text-slate-100 font-semibold">{currentCard.nibbana}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {currentCard.explanation && (
                    <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60">
                      <strong>Note:</strong> {currentCard.explanation}
                    </p>
                  )}
                </div>
              )
            ) : (
              // Reverse: Front = Dabbattha, Back = Pada
              !isFlipped ? (
                <div className="space-y-3">
                  <div className="text-xs uppercase font-mono text-emerald-900 tracking-wider">
                    Identify the Pada for this Dabbattha
                  </div>
                  <div className="text-lg sm:text-xl font-semibold text-emerald-950 leading-relaxed">
                    {currentCard.dabbattha}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="font-serif italic font-bold text-2xl sm:text-3xl text-emerald-300">
                    {currentCard.pada}
                  </div>
                  {currentCard.paliTranslation && (
                    <div className="text-sm text-slate-300">
                      &quot;{currentCard.paliTranslation}&quot;
                    </div>
                  )}
                  {currentCard.explanation && (
                    <p className="text-xs text-slate-400 pt-2 border-t border-slate-800 text-left">
                      {currentCard.explanation}
                    </p>
                  )}
                </div>
              )
            )}
          </div>

          {/* Card Bottom bar */}
          <div className="flex items-center justify-between text-xs pt-3 border-t border-current/10">
            <span className="flex items-center gap-1 opacity-70">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap to flip</span>
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMastered(currentCard.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                isMastered
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isFlipped
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {isMastered ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              <span>{isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
            currentIndex > 0
              ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 cursor-pointer shadow-xs'
              : 'border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-xs text-slate-500 font-mono">
          {currentIndex + 1} / {cards.length}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
            currentIndex < cards.length - 1
              ? 'bg-sky-700 border-sky-700 text-white hover:bg-sky-800 cursor-pointer shadow-xs'
              : 'border-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
