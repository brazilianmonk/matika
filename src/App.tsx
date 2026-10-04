/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import initialMatikaData from './data/duka_matika.json';
import { MatikaData, StudyMode, PadaItem, DukamuttakaItem } from './types/matika';
import { TableDisplay } from './components/TableDisplay';
import { MemoryRevealMode } from './components/MemoryRevealMode';
import { QuizMode } from './components/QuizMode';
import { FlashcardMode } from './components/FlashcardMode';
import { MatchMode } from './components/MatchMode';
import { JsonViewer } from './components/JsonViewer';
import { DabbatthaDetailModal } from './components/DabbatthaDetailModal';
import { Table, Sparkles, CheckSquare, Layers, Puzzle, Code2, BookOpen } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<MatikaData>(initialMatikaData as unknown as MatikaData);
  const [activeMode, setActiveMode] = useState<StudyMode>('table');
  const [selectedGocchakaId, setSelectedGocchakaId] = useState<string>('hetu-gocchaka');
  const [inspectItem, setInspectItem] = useState<{ item: PadaItem | DukamuttakaItem; dukaName: string } | null>(null);

  const currentGocchaka = data.gocchakas.find(g => g.id === selectedGocchakaId) || data.gocchakas[0];

  const handleResetData = () => {
    setData(initialMatikaData as unknown as MatikaData);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Bar following Top Bar Contract: Brand — 4-6 Nav Items — 1 Primary Action */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-x-3 lg:gap-x-4 py-2 lg:py-0 lg:h-14">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 order-1">
            <button
              onClick={() => setActiveMode('table')}
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2 text-left cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Duka Mātikā</span>
            </button>
            <span className="hidden sm:inline text-xs text-slate-400">/</span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">Abhidhamma Tester</span>
          </div>

          {/* Zone 2: 4-6 clean text navigation links (full-width scrollable row below lg) */}
          <nav className="order-3 lg:order-2 w-full lg:w-auto flex items-center gap-1 sm:gap-2 text-xs font-medium overflow-x-auto lg:overflow-visible scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 pt-1 lg:pt-0">
            <button
              onClick={() => setActiveMode('table')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeMode === 'table'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Table View</span>
            </button>

            <button
              onClick={() => setActiveMode('reveal')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeMode === 'reveal'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 font-semibold'
              }`}
              title="Reveal table slowly from top to bottom to test memory"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="lg:hidden">Memory</span>
              <span className="hidden lg:inline">Memory Recall Drill</span>
            </button>

            <button
              onClick={() => setActiveMode('quiz')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeMode === 'quiz'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Quiz</span>
            </button>

            <button
              onClick={() => setActiveMode('flashcard')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeMode === 'flashcard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Flashcards</span>
            </button>

            <button
              onClick={() => setActiveMode('match')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeMode === 'match'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span className="lg:hidden">Match</span>
              <span className="hidden lg:inline">Matching Drill</span>
            </button>

            <button
              onClick={() => setActiveMode('json')}
              className={`shrink-0 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeMode === 'json'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="lg:hidden">JSON</span>
              <span className="hidden lg:inline">JSON Data</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 order-2 lg:order-3">
            <select
              value={selectedGocchakaId}
              onChange={e => setSelectedGocchakaId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 font-medium cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-sky-500 max-w-[130px] xs:max-w-[170px] lg:max-w-none truncate"
            >
              {data.gocchakas.map(g => (
                <option key={g.id} value={g.id}>
                  {g.number}. {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeMode === 'table' && (
          <TableDisplay
            gocchaka={currentGocchaka}
            onSelectPada={(item, dukaName) => setInspectItem({ item, dukaName })}
          />
        )}

        {activeMode === 'reveal' && (
          <MemoryRevealMode
            gocchaka={currentGocchaka}
          />
        )}

        {activeMode === 'quiz' && (
          <QuizMode gocchakas={data.gocchakas} />
        )}

        {activeMode === 'flashcard' && (
          <FlashcardMode gocchakas={data.gocchakas} />
        )}

        {activeMode === 'match' && (
          <MatchMode gocchakas={data.gocchakas} />
        )}

        {activeMode === 'json' && (
          <JsonViewer
            data={data}
            onUpdateData={newData => setData(newData)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Modal for In-depth Breakdown */}
      {inspectItem && (
        <DabbatthaDetailModal
          item={inspectItem.item}
          dukaName={inspectItem.dukaName}
          onClose={() => setInspectItem(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-700">Dhammasaṅgaṇī Mātikā</span>
            <span>·</span>
            <span>Hetu Gocchaka Dabbattha Reference</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by dynamic JSON dataset</span>
            <span>·</span>
            <span>Abhidhammattha Saṅgaha Taxonomy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
