import React from 'react';
import { PadaItem, DukamuttakaItem } from '../types/matika';
import { X, Sparkles, BookOpen } from 'lucide-react';

interface DabbatthaDetailModalProps {
  item: PadaItem | DukamuttakaItem | null;
  dukaName: string;
  onClose: () => void;
}

export const DabbatthaDetailModal: React.FC<DabbatthaDetailModalProps> = ({ item, dukaName, onClose }) => {
  if (!item) return null;

  const isDukamuttaka = 'fullDabbattha' in item;
  const pada = item as PadaItem;
  const muttaka = item as DukamuttakaItem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-800">
              {dukaName}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="font-serif italic font-bold text-xl text-slate-950">
                {item.pada}
              </h3>
              {isDukamuttaka && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800">
                  Dukamuttakā
                </span>
              )}
            </div>
            {item.paliTranslation && (
              <p className="text-xs text-slate-500 mt-0.5">
                &quot;{item.paliTranslation}&quot;
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Main Dabbattha Banner */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider">
              Ultimate Reality (Dabbattha)
            </span>
            <div className="text-base font-semibold text-emerald-950 leading-relaxed">
              {item.dabbattha}
            </div>
            {isDukamuttaka && muttaka.fullDabbattha && (
              <div className="text-xs text-emerald-900 mt-2 pt-2 border-t border-emerald-200 font-normal">
                <strong>Constituents:</strong> {muttaka.fullDabbattha}
              </div>
            )}
          </div>

          {/* 4 Paramattha Dhammas Breakdown */}
          {!isDukamuttaka && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                The Four Ultimate Realities (Paramattha Dhammā)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 font-medium block">1. Citta (Consciousness)</span>
                  <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{pada.cittas}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 font-medium block">2. Cetasika (Mental Factors)</span>
                  <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{pada.cetasikas}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 font-medium block">3. Rūpa (Matter)</span>
                  <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{pada.rupa}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 font-medium block">4. Nibbāna (Unconditioned)</span>
                  <span className="font-semibold text-slate-900 text-sm mt-0.5 block">{pada.nibbana}</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Abhidhamma Analysis */}
          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-sky-950">
              <Sparkles className="w-4 h-4 text-sky-700" />
              <span>Abhidhamma Analysis & Why Exclusions Occur</span>
            </div>
            <p>{item.explanation}</p>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg flex items-start gap-2 text-xs text-amber-900">
            <BookOpen className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              In Abhidhamma analysis, every phenomenon in the universe must resolve cleanly into one of the four Paramattha Dhammas without remainder or ambiguity.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
