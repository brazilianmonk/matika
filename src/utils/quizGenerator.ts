import { GocchakaItem, QuizQuestion, Flashcard } from '../types/matika';

export function generateQuizQuestions(gocchakas: GocchakaItem[], count = 10): QuizQuestion[] {
  const allQuestions: QuizQuestion[] = [];

  gocchakas.forEach(gocchaka => {
    gocchaka.dukas.forEach(duka => {
      // 1. Pada to Dabbattha questions
      duka.padas.forEach(pada => {
        // Collect wrong options from other padas across gocchakas
        const otherPadas = gocchakas
          .flatMap(g => g.dukas.flatMap(d => d.padas))
          .filter(p => p.id !== pada.id && p.dabbattha !== pada.dabbattha);
        
        // Shuffle other padas
        const shuffledOthers = [...otherPadas].sort(() => 0.5 - Math.random());
        const wrongAnswers = Array.from(new Set(shuffledOthers.map(p => p.dabbattha))).slice(0, 3);

        const options = [pada.dabbattha, ...wrongAnswers];
        // Shuffle options
        const shuffledOptions = [...options].sort(() => 0.5 - Math.random());
        const correctIndex = shuffledOptions.indexOf(pada.dabbattha);

        allQuestions.push({
          id: `q-p2d-${pada.id}`,
          dukaId: duka.id,
          dukaName: duka.name,
          questionType: 'pada_to_dabbattha',
          prompt: `What is the Dabbattha (Ultimate Reality) of:`,
          subPrompt: pada.pada,
          padaText: pada.pada,
          options: shuffledOptions,
          correctIndex,
          explanation: pada.explanation || `${pada.pada} represents: ${pada.dabbattha}.`
        });

        // 2. Dabbattha to Pada reverse questions
        const wrongPadaNames = gocchakas
          .flatMap(g => g.dukas.flatMap(d => d.padas))
          .filter(p => p.id !== pada.id && p.pada !== pada.pada)
          .map(p => p.pada);
        
        const wrongPadaOptions = Array.from(new Set(wrongPadaNames)).sort(() => 0.5 - Math.random()).slice(0, 3);
        const padaOptions = [pada.pada, ...wrongPadaOptions].sort(() => 0.5 - Math.random());
        const correctPadaIndex = padaOptions.indexOf(pada.pada);

        allQuestions.push({
          id: `q-d2p-${pada.id}`,
          dukaId: duka.id,
          dukaName: duka.name,
          questionType: 'dabbattha_to_pada',
          prompt: `Which Pada corresponds to this Dabbattha?`,
          subPrompt: pada.dabbattha,
          padaText: pada.pada,
          options: padaOptions,
          correctIndex: correctPadaIndex,
          explanation: `In ${duka.name}, the Dabbattha "${pada.dabbattha}" belongs to the pada "${pada.pada}".`
        });
      });

      // 3. Dukamuttaka question if present
      if (duka.dukamuttaka) {
        const wrongDukamuttakaOptions = [
          'No Dukamuttakā dhammā (all dhammas are covered in the two padas)',
          '18 ahetuka cittas, 28 rūpa only',
          '89 cittas and 52 cetasikas',
          'Hetu dhammā',
          'Ahetukā dhammā',
          'Hetuvippayuttā dhammā'
        ].filter(opt => opt !== duka.dukamuttaka?.dabbattha && opt !== duka.dukamuttaka?.fullDabbattha);

        const chosenWrong = wrongDukamuttakaOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [duka.dukamuttaka.dabbattha, ...chosenWrong].sort(() => 0.5 - Math.random());

        allQuestions.push({
          id: `q-duka-mut-${duka.id}`,
          dukaId: duka.id,
          dukaName: duka.name,
          questionType: 'dukamuttaka_check',
          prompt: `What are the Dukamuttakā dhammā (exempt / excluded states) for:`,
          subPrompt: duka.name,
          padaText: duka.dukamuttaka.pada,
          options,
          correctIndex: options.indexOf(duka.dukamuttaka.dabbattha),
          explanation: duka.dukamuttaka.explanation || `For ${duka.name}, the exempt states are: ${duka.dukamuttaka.dabbattha} (${duka.dukamuttaka.fullDabbattha}).`
        });
      }
    });
  });

  // Dedicated conceptual Abhidhamma test questions
  allQuestions.push(
    {
      id: 'q-concept-moha-mohamula',
      dukaId: 'sahetu-duka',
      dukaName: 'Sahetu duka',
      questionType: 'exception_reasoning',
      prompt: 'Why is moha in the 2 mohamūla cittas excluded from Sahetukā dhammā?',
      subPrompt: 'Sahetuka Classification Rule',
      options: [
        'Because moha is the sole solitary root in those cittas, and a root cannot accompany itself without a co-arising root',
        'Because moha is an unwholesome cetasika and only wholesome roots can be sahetuka',
        'Because the 2 mohamūla cittas are classified strictly as ahetuka cittas in all treatises',
        'Because moha ceases before the other cetasikas can arise'
      ],
      correctIndex: 0,
      explanation: 'In the two mohamūla cittas (vicikicchā- and uddhacca-sampayutta), moha is solitary (ekahetuka). "Sahetuka" means accompanied by a root. Since a single root cannot accompany itself, it is excluded from Sahetukā and grouped into Ahetukā.'
    },
    {
      id: 'q-concept-46-cetasika',
      dukaId: 'hetu-duka',
      dukaName: 'Hetu duka',
      questionType: 'exception_reasoning',
      prompt: 'In "Na hetū dhammā", why are there exactly 46 cetasikas?',
      subPrompt: 'Cetasika Arithmetic Calculation',
      options: [
        '52 total cetasikas minus the 6 hetu cetasikas = 46 cetasikas',
        '52 total cetasikas minus 6 sobhana roots = 46 cetasikas',
        '13 aññasamānas + 14 akusalas + 19 sobhana-sādhāraṇa = 46',
        '46 wholesome cittas multiplied by their roots'
      ],
      correctIndex: 0,
      explanation: 'There are 52 total cetasikas in Abhidhamma. Since the 6 roots (lobha, dosa, moha, alobha, adosa, amoha) are "Hetū dhammā", the remaining 52 - 6 = 46 non-root cetasikas fall under "Na hetū dhammā".'
    },
    {
      id: 'q-concept-na-hetu-ahetuka-moha',
      dukaId: 'na-hetu-sahetuka-duka',
      dukaName: 'Na hetu sahetuka duka',
      questionType: 'exception_reasoning',
      prompt: 'In "Na hetū kho pana dhammā ahetukāpi", why is solitary moha NOT included?',
      subPrompt: 'Dyad Negative Condition Rule',
      options: [
        'Because moha is a hetu (root), so it violates the "Na hetū" (non-root) specification',
        'Because moha only arises in sahetuka cittas',
        'Because moha is rūpa, not a cetasika',
        'Because moha is already included in Nibbāna'
      ],
      correctIndex: 0,
      explanation: 'The pada explicitly specifies "Na hetū" (phenomena that are NOT roots). Even though solitary moha in 2 mohamūla cittas is ahetuka in condition, it IS a hetu! Therefore, it cannot be grouped under "Na hetū" and is instead placed in Dukamuttakā (Hetu dhammā).'
    }
  );

  // Return shuffled subset of questions
  return allQuestions.sort(() => 0.5 - Math.random()).slice(0, count);
}

export function generateFlashcards(gocchakas: GocchakaItem[]): Flashcard[] {
  const cards: Flashcard[] = [];

  gocchakas.forEach(gocchaka => {
    gocchaka.dukas.forEach(duka => {
      duka.padas.forEach(pada => {
        cards.push({
          id: `card-${pada.id}`,
          dukaName: duka.name,
          pada: pada.pada,
          paliTranslation: pada.paliTranslation,
          isDukamuttaka: false,
          dabbattha: pada.dabbattha,
          cittas: pada.cittas,
          cetasikas: pada.cetasikas,
          rupa: pada.rupa,
          nibbana: pada.nibbana,
          explanation: pada.explanation
        });
      });

      if (duka.dukamuttaka) {
        cards.push({
          id: `card-mut-${duka.id}`,
          dukaName: duka.name,
          pada: duka.dukamuttaka.pada,
          paliTranslation: duka.dukamuttaka.paliTranslation,
          isDukamuttaka: true,
          dabbattha: duka.dukamuttaka.dabbattha,
          cetasikas: duka.dukamuttaka.fullDabbattha,
          explanation: duka.dukamuttaka.explanation
        });
      }
    });
  });

  return cards;
}
