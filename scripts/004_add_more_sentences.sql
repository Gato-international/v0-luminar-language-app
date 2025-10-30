-- Add more sample sentences with annotations for better testing
DO $$
DECLARE
  chapter1_id UUID;
  chapter2_id UUID;
  chapter3_id UUID;
  nom_id UUID;
  acc_id UUID;
  dat_id UUID;
  gen_id UUID;
  sentence_id UUID;
BEGIN
  -- Get IDs
  SELECT id INTO chapter1_id FROM public.chapters WHERE order_index = 1;
  SELECT id INTO chapter2_id FROM public.chapters WHERE order_index = 2;
  SELECT id INTO chapter3_id FROM public.chapters WHERE order_index = 3;
  SELECT id INTO nom_id FROM public.grammatical_cases WHERE abbreviation = 'NOM';
  SELECT id INTO acc_id FROM public.grammatical_cases WHERE abbreviation = 'ACC';
  SELECT id INTO dat_id FROM public.grammatical_cases WHERE abbreviation = 'DAT';
  SELECT id INTO gen_id FROM public.grammatical_cases WHERE abbreviation = 'GEN';

  -- Chapter 1: Easy sentences
  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'De hond rent snel.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'hond', nom_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'Het kind speelt buiten.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'Het', nom_id),
    (sentence_id, 1, 'kind', nom_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'De leraar leest een boek.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'leraar', nom_id),
    (sentence_id, 4, 'boek', acc_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'De student schrijft een brief.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'student', nom_id),
    (sentence_id, 4, 'brief', acc_id);

  -- Chapter 1: Medium sentences
  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'De moeder geeft het kind een appel.', 'medium')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'moeder', nom_id),
    (sentence_id, 3, 'het', dat_id),
    (sentence_id, 4, 'kind', dat_id),
    (sentence_id, 6, 'appel', acc_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'De vader vertelt de kinderen een verhaal.', 'medium')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'vader', nom_id),
    (sentence_id, 3, 'de', dat_id),
    (sentence_id, 4, 'kinderen', dat_id),
    (sentence_id, 6, 'verhaal', acc_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'De oma bakt de kleinkinderen koekjes.', 'medium')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'oma', nom_id),
    (sentence_id, 3, 'de', dat_id),
    (sentence_id, 4, 'kleinkinderen', dat_id),
    (sentence_id, 5, 'koekjes', acc_id);

  -- Chapter 1: Hard sentences
  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'De auto van de buurman staat voor het huis.', 'hard')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'auto', nom_id),
    (sentence_id, 3, 'de', gen_id),
    (sentence_id, 4, 'buurman', gen_id),
    (sentence_id, 7, 'het', acc_id),
    (sentence_id, 8, 'huis', acc_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'Het boek van de leraar ligt op de tafel.', 'hard')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'Het', nom_id),
    (sentence_id, 1, 'boek', nom_id),
    (sentence_id, 3, 'de', gen_id),
    (sentence_id, 4, 'leraar', gen_id),
    (sentence_id, 7, 'de', acc_id),
    (sentence_id, 8, 'tafel', acc_id);

  -- Chapter 2: Nominatief focus
  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter2_id, 'De vogel zingt mooi.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'vogel', nom_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter2_id, 'Het meisje danst graag.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'Het', nom_id),
    (sentence_id, 1, 'meisje', nom_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter2_id, 'De jongen speelt voetbal.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'jongen', nom_id),
    (sentence_id, 3, 'voetbal', acc_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter2_id, 'De dokter helpt de patiënt.', 'medium')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'De', nom_id),
    (sentence_id, 1, 'dokter', nom_id),
    (sentence_id, 3, 'de', acc_id),
    (sentence_id, 4, 'patiënt', acc_id);

  -- Chapter 3: Accusatief focus
  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter3_id, 'Ik zie de zon.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'Ik', nom_id),
    (sentence_id, 2, 'de', acc_id),
    (sentence_id, 3, 'zon', acc_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter3_id, 'Zij leest een krant.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'Zij', nom_id),
    (sentence_id, 3, 'krant', acc_id);

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter3_id, 'Wij eten de pizza.', 'easy')
  RETURNING id INTO sentence_id;
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id) VALUES
    (sentence_id, 0, 'Wij', nom_id),
    (sentence_id, 2, 'de', acc_id),
    (sentence_id, 3, 'pizza', acc_id);

END $$;
