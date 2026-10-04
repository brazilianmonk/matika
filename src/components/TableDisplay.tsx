import React, { useState } from 'react';
import { GocchakaItem, DukaItem, PadaItem, DukamuttakaItem } from '../types/matika';
import { Search, Info, Eye, EyeOff, BookOpen, Layers } from 'lucide-react';

interface TableDisplayProps {
  gocchaka: GocchakaItem;
  onSelectPada?: (pada: PadaItem | DukamuttakaItem, dukaName: string) => void;
}

export const TableDisplay: React.FC<TableDisplayProps> = ({ gocchaka, onSelectPada }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTranslations, setShowTranslations] = useState(false);
  const [showBreakdowns, setShowBreakdowns] = useState(false);

  // Filter dukas and padas based on search
  const filteredDukas = gocchaka.dukas.filter(duka => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const dukaMatch = duka.name.toLowerCase().includes(term) || duka.paliName.toLowerCase().includes(term);
    const padaMatch = duka.padas.some(
      p => p.pada.toLowerCase().includes(term) || 
           p.dabbattha.toLowerCase().includes(term) ||
           p.paliTranslation.toLowerCase().includes(term)
    );
    const muttakaMatch = duka.dukamuttaka?.dabbattha.toLowerCase().includes(term) ||
                         duka.dukamuttaka?.fullDabbattha.toLowerCase().includes(term);
    return dukaMatch || padaMatch || muttakaMatch;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Table Title and Subtitle as in the original study document */}
      <div className="text-center pt-2 pb-1">
        <h1 className="text-2xl md:text-3xl font-bold text-sky-950 font-serif tracking-tight">
          Ultimate Representation of Duka Mātikā
        </h1>
        <h2 className="text-lg md:text-xl font-bold text-sky-900 mt-1 font-serif">
          {gocchaka.number}. {gocchaka.name}
        </h2>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl mx-auto">
          {gocchaka.description}
        </p>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pada, citta, moha, etc..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-sky-500 focus:bg-white text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs self-stretch sm:self-auto justify-end">
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors ${
              showTranslations 
                ? 'bg-sky-50 border-sky-200 text-sky-800 font-medium' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showTranslations ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Translations</span>
          </button>

          <button
            onClick={() => setShowBreakdowns(!showBreakdowns)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors ${
              showBreakdowns 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Realities Breakdown</span>
          </button>
        </div>
      </div>

      {/* Main Table Matching the Original Document */}
      <div className="overflow-x-auto border-2 border-slate-900 rounded-xs shadow-sm bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-slate-300 border-b-2 border-slate-900 text-slate-950 font-bold text-center">
              <th className="py-2.5 px-4 border-r-2 border-slate-900 w-1/4 font-semibold text-base">
                Duka
              </th>
              <th className="py-2.5 px-4 border-r-2 border-slate-900 w-1/3 font-semibold text-base">
                Pada
              </th>
              <th className="py-2.5 px-4 w-5/12 font-semibold text-base">
                Dabbattha
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDukas.map((duka) => {
              const rowSpanCount = duka.padas.length + (duka.dukamuttaka ? 1 : 0);
              
              return (
                <React.Fragment key={duka.id}>
                  {duka.padas.map((pada, idx) => {
                    const isFirstRow = idx === 0;

                    return (
                      <tr 
                        key={pada.id}
                        className="border-b border-slate-900 hover:brightness-95 transition-all group cursor-pointer"
                        onClick={() => onSelectPada?.(pada, duka.name)}
                        title="Click to view detailed analysis"
                      >
                        {/* Duka column (Rendered only on first row of this duka) */}
                        {isFirstRow && (
                          <td
                            rowSpan={rowSpanCount}
                            className="align-top py-3.5 px-4 bg-slate-200/90 text-slate-900 font-medium border-r-2 border-slate-900 text-sm md:text-base leading-snug"
                          >
                            <div className="font-semibold text-slate-950">{duka.name}</div>
                            <div className="text-xs text-slate-600 italic mt-0.5">{duka.paliName}</div>
                            <div className="text-xs text-slate-500 mt-2 font-normal hidden lg:block">
                              {duka.description}
                            </div>
                          </td>
                        )}

                        {/* Pada column with light green background matching original image */}
                        <td className="py-3 px-4 bg-[#86efac] border-r-2 border-slate-900 text-slate-950 border-b border-slate-800">
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold italic text-slate-950 text-sm md:text-[15px] tracking-wide">
                              {pada.pada}
                            </span>
                            <Info className="w-3.5 h-3.5 text-emerald-800 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                          </div>
                          {showTranslations && (
                            <div className="text-xs text-emerald-950 font-normal mt-1 opacity-90 not-italic">
                              {pada.paliTranslation}
                            </div>
                          )}
                        </td>

                        {/* Dabbattha column with light green background matching original image */}
                        <td className="py-3 px-4 bg-[#86efac] text-slate-950 text-sm md:text-[14px] leading-relaxed border-b border-slate-800">
                          <div className="font-medium text-slate-950">
                            {pada.dabbattha}
                          </div>

                          {showBreakdowns && (
                            <div className="mt-2 pt-2 border-t border-emerald-400/60 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                              <div className="bg-emerald-100/70 px-2 py-1 rounded-sm">
                                <span className="font-semibold text-emerald-900">Cittas:</span>{' '}
                                <span className="text-emerald-950">{pada.cittas}</span>
                              </div>
                              <div className="bg-emerald-100/70 px-2 py-1 rounded-sm col-span-2 sm:col-span-1">
                                <span className="font-semibold text-emerald-900">Cetasikas:</span>{' '}
                                <span className="text-emerald-950">{pada.cetasikas}</span>
                              </div>
                              <div className="bg-emerald-100/70 px-2 py-1 rounded-sm">
                                <span className="font-semibold text-emerald-900">Rūpa:</span>{' '}
                                <span className="text-emerald-950">{pada.rupa}</span>
                              </div>
                              <div className="bg-emerald-100/70 px-2 py-1 rounded-sm">
                                <span className="font-semibold text-emerald-900">Nibbāna:</span>{' '}
                                <span className="text-emerald-950">{pada.nibbana}</span>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Dukamuttakā row if exists */}
                  {duka.dukamuttaka && (
                    <tr
                      key={`${duka.id}-dukamuttaka`}
                      className="border-b-2 border-slate-900 hover:brightness-95 transition-all group cursor-pointer"
                      onClick={() => onSelectPada?.(duka.dukamuttaka!, duka.name)}
                      title="Click to view detailed analysis"
                    >
                      <td className="py-3 px-4 bg-[#86efac] border-r-2 border-slate-900 text-slate-950 border-b-2 border-slate-900">
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold italic text-slate-950 text-sm md:text-[15px]">
                            {duka.dukamuttaka.pada}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-900 bg-emerald-200/80 px-1.5 py-0.5 rounded-sm">
                            Exempt
                          </span>
                        </div>
                        {showTranslations && (
                          <div className="text-xs text-emerald-950 font-normal mt-1 opacity-90 not-italic">
                            {duka.dukamuttaka.paliTranslation}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 bg-[#86efac] text-slate-950 text-sm md:text-[14px] leading-relaxed border-b-2 border-slate-900">
                        <div className="font-semibold text-slate-950">
                          {duka.dukamuttaka.dabbattha}
                        </div>
                        {duka.dukamuttaka.fullDabbattha && (
                          <div className="text-xs text-emerald-950 mt-1 font-normal opacity-90">
                            {duka.dukamuttaka.fullDabbattha}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredDukas.length === 0 && (
        <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm">
          No matching Dukas or Padas found for &quot;{searchTerm}&quot;.
        </div>
      )}

      {/* Explanatory Study Notes */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-amber-950 text-sm">
          <BookOpen className="w-4 h-4 text-amber-800" />
          <span>Key Abhidhamma Study Principles for Hetu Gocchaka</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 leading-relaxed text-amber-950/90">
          <li>
            <strong>Hetu (6 roots):</strong> Lobha, dosa, moha (akusala roots) and alobha, adosa, amoha (sobhana roots).
          </li>
          <li>
            <strong>Sahetuka vs Ahetuka:</strong> Consciousness is classified as Sahetuka (71 cittas) when accompanied by at least one root, and Ahetuka (18 cittas) when rootless.
          </li>
          <li>
            <strong>The Moha Exception:</strong> In the 2 mohamūla cittas (vicikicchā- and uddhacca-sampayutta), moha is the sole root (ekahetuka). Since a root cannot be accompanied by itself without a co-arising root, it is counted as <em>Ahetuka</em> in the Sahetu/Hetusampayutta dukas.
          </li>
          <li>
            <strong>Dukamuttakā dhammā:</strong> In dyads 4, 5, and 6, certain phenomena fall outside both padas (e.g., Ahetukā dhammā in Hetu-sahetuka duka, and Hetu dhammā in Na hetu sahetuka duka).
          </li>
        </ul>
      </div>
    </div>
  );
};
