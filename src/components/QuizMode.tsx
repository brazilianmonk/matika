import React, { useState, useMemo } from 'react';
import { GocchakaItem, QuizQuestion } from '../types/matika';
import { generateQuizQuestions } from '../utils/quizGenerator';
import { CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, Sparkles } from 'lucide-react';

interface QuizModeProps {
  gocchakas: GocchakaItem[];
}

export const QuizMode: React.FC<QuizModeProps> = ({ gocchakas }) => {
  const [selectedGocchakaId, setSelectedGocchakaId] = useState<string>('hetu-gocchaka');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ question: QuizQuestion; selected: number; isCorrect: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Filter gocchakas for generating questions
  const activeGocchakas = useMemo(() => {
    if (selectedGocchakaId === 'all') return gocchakas;
    return gocchakas.filter(g => g.id === selectedGocchakaId);
  }, [gocchakas, selectedGocchakaId]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const startQuiz = (customQuestions?: QuizQuestion[]) => {
    const generated = customQuestions || generateQuizQuestions(activeGocchakas, questionCount);
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setHasSubmitted(false);
    setScore(0);
    setUserAnswers([]);
    setIsFinished(false);
    setIsStarted(true);
  };

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || hasSubmitted) return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQ.correctIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setUserAnswers(prev => [
      ...prev,
      {
        question: currentQ,
        selected: selectedAnswer,
        isCorrect
      }
    ]);

    setHasSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetestMissed = () => {
    const missed = userAnswers.filter(a => !a.isCorrect).map(a => a.question);
    if (missed.length > 0) {
      startQuiz(missed);
    }
  };

  if (!isStarted) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 py-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Abhidhamma Mātikā Mastery Quiz
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Test your knowledge of the Padas, Dabbattha classifications, and exceptions across the Mātika dyads.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select Study Gocchaka (Cluster)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedGocchakaId('hetu-gocchaka')}
                className={`p-3 text-left border rounded-lg transition-all ${
                  selectedGocchakaId === 'hetu-gocchaka'
                    ? 'border-sky-600 bg-sky-50/70 ring-1 ring-sky-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900">1. Hetu Gocchaka</div>
                <div className="text-xs text-slate-500 mt-0.5">6 Dukas (Roots & Non-roots)</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGocchakaId('all')}
                className={`p-3 text-left border rounded-lg transition-all ${
                  selectedGocchakaId === 'all'
                    ? 'border-sky-600 bg-sky-50/70 ring-1 ring-sky-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900">All Available Gocchakas</div>
                <div className="text-xs text-slate-500 mt-0.5">Hetu, Āsava, Kilesa & more</div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Number of Questions
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                    questionCount === cnt
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => startQuiz()}
              className="w-full sm:w-auto px-6 py-2.5 bg-sky-700 text-white font-medium text-sm rounded-lg hover:bg-sky-800 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Begin Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Finished Screen
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const missedQuestions = userAnswers.filter(a => !a.isCorrect);

    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 py-4">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs space-y-4">
          <div className="inline-flex p-3 bg-sky-100 text-sky-800 rounded-full">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">Quiz Completed!</h2>
            <p className="text-slate-600 text-sm mt-1">
              You scored <span className="font-bold text-slate-900">{score}</span> out of{' '}
              <span className="font-bold text-slate-900">{questions.length}</span> ({percentage}%)
            </p>
          </div>

          {/* Feedback badge */}
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {percentage === 100
              ? '🌟 Sādhu! Flawless knowledge of Abhidhamma Mātika!'
              : percentage >= 80
              ? '✨ Excellent comprehension of Dabbattha analysis!'
              : percentage >= 60
              ? '👍 Good progress! Review the exclusions and exceptions.'
              : '📖 Regular practice with the table will build strong retention.'}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
            {missedQuestions.length > 0 && (
              <button
                onClick={handleRetestMissed}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Retest {missedQuestions.length} Missed Question{missedQuestions.length > 1 ? 's' : ''}
              </button>
            )}
            <button
              onClick={() => startQuiz()}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Random Test</span>
            </button>
            <button
              onClick={() => setIsStarted(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Change Settings
            </button>
          </div>
        </div>

        {/* Breakdown of answers */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Review Answers</h3>
          <div className="space-y-2">
            {userAnswers.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border text-xs space-y-1.5 transition-colors ${
                  item.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-slate-900 text-sm">
                    {idx + 1}. {item.question.prompt} {item.question.subPrompt && <span className="font-serif italic text-sky-950">&quot;{item.question.subPrompt}&quot;</span>}
                  </div>
                  {item.isCorrect ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-700 font-semibold shrink-0">
                      <XCircle className="w-4 h-4" /> Incorrect
                    </span>
                  )}
                </div>

                {!item.isCorrect && (
                  <div className="text-rose-900">
                    <span className="font-medium">Your answer:</span> {item.question.options[item.selected]}
                  </div>
                )}
                <div>
                  <span className="font-medium text-emerald-900">Correct answer:</span>{' '}
                  <span className="text-slate-900 font-medium">{item.question.options[item.question.correctIndex]}</span>
                </div>
                <div className="pt-1 text-slate-600 border-t border-slate-200/50">
                  <span className="font-medium">Explanation:</span> {item.question.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View
  const currentQ = questions[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-4">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
        <div className="font-medium text-slate-800">
          Question <span className="text-slate-900 font-bold">{currentIndex + 1}</span> of{' '}
          <span className="text-slate-900 font-bold">{questions.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-500 font-mono">Score: {score}</span>
          <button
            onClick={() => setIsStarted(false)}
            className="text-slate-400 hover:text-slate-600 underline"
          >
            Quit Quiz
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-sky-700 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded-sm">
            {currentQ.dukaName}
          </span>
          <h3 className="text-base sm:text-lg font-medium text-slate-900 mt-2">
            {currentQ.prompt}
          </h3>
          {currentQ.subPrompt && (
            <div className="mt-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-md">
              <span className="font-serif italic font-bold text-base sm:text-lg text-emerald-950">
                {currentQ.subPrompt}
              </span>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let buttonClass = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';

            if (isSelected && !hasSubmitted) {
              buttonClass = 'border-sky-600 bg-sky-50/70 ring-1 ring-sky-600 text-sky-950 font-medium';
            }

            if (hasSubmitted) {
              if (isCorrect) {
                buttonClass = 'border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500 text-emerald-950 font-medium';
              } else if (isSelected && !isCorrect) {
                buttonClass = 'border-rose-400 bg-rose-50/80 ring-1 ring-rose-400 text-rose-950';
              } else {
                buttonClass = 'border-slate-200 opacity-60 text-slate-600';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={hasSubmitted}
                className={`w-full p-3.5 text-left text-xs sm:text-sm rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${buttonClass}`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0 mt-0.5 font-semibold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-snug flex-1">{option}</span>
                {hasSubmitted && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {hasSubmitted && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Post-submit explanation */}
        {hasSubmitted && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Abhidhamma Explanation</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {!hasSubmitted ? 'Choose one answer then confirm' : 'Click next to proceed'}
          </div>

          {!hasSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedAnswer !== null
                  ? 'bg-sky-700 text-white hover:bg-sky-800 cursor-pointer shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Confirm Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{currentIndex + 1 === questions.length ? 'View Results' : 'Next Question'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
