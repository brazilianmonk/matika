export interface PadaItem {
  id: string;
  pada: string;
  paliTranslation: string;
  type: 'pada_1' | 'pada_2';
  dabbattha: string;
  cittas: string;
  cetasikas: string;
  rupa: string;
  nibbana: string;
  explanation: string;
}

export interface DukamuttakaItem {
  pada: string;
  paliTranslation: string;
  dabbattha: string;
  fullDabbattha: string;
  explanation: string;
}

export interface DukaItem {
  id: string;
  number: number;
  name: string;
  paliName: string;
  description: string;
  padas: PadaItem[];
  dukamuttaka: DukamuttakaItem | null;
}

export interface GocchakaItem {
  id: string;
  number: number;
  name: string;
  paliName: string;
  description: string;
  dukas: DukaItem[];
}

export interface MatikaData {
  title: string;
  subtitle: string;
  gocchakas: GocchakaItem[];
}

export type StudyMode = 'table' | 'reveal' | 'quiz' | 'flashcard' | 'match' | 'json';

export interface QuizQuestion {
  id: string;
  dukaId: string;
  dukaName: string;
  questionType: 'pada_to_dabbattha' | 'dabbattha_to_pada' | 'dukamuttaka_check' | 'exception_reasoning';
  prompt: string;
  subPrompt?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  padaText?: string;
}

export interface Flashcard {
  id: string;
  dukaName: string;
  pada: string;
  paliTranslation: string;
  isDukamuttaka?: boolean;
  dabbattha: string;
  cittas?: string;
  cetasikas?: string;
  rupa?: string;
  nibbana?: string;
  explanation: string;
}
