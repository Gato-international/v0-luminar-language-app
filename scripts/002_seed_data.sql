-- Insert default grammatical cases (Dutch naamvallen)
INSERT INTO public.grammatical_cases (name, abbreviation, color, description) VALUES
  ('Nominatief', 'NOM', '#3b82f6', 'Het onderwerp van de zin'),
  ('Genitief', 'GEN', '#8b5cf6', 'Bezit of relatie'),
  ('Datief', 'DAT', '#10b981', 'Meewerkend voorwerp'),
  ('Accusatief', 'ACC', '#f59e0b', 'Lijdend voorwerp')
ON CONFLICT (abbreviation) DO NOTHING;

-- Insert sample chapters
INSERT INTO public.chapters (title, description, order_index) VALUES
  ('Hoofdstuk 1: Basis Naamvallen', 'Introductie tot de vier naamvallen', 1),
  ('Hoofdstuk 2: Nominatief', 'Diepgaande studie van de nominatief', 2),
  ('Hoofdstuk 3: Accusatief', 'Leren werken met de accusatief', 3),
  ('Hoofdstuk 4: Datief', 'Begrijpen van de datief', 4),
  ('Hoofdstuk 5: Genitief', 'Meester worden in de genitief', 5)
ON CONFLICT DO NOTHING;

-- Get chapter and case IDs for sentences
DO $$
DECLARE
  chapter1_id UUID;
  chapter2_id UUID;
  nom_id UUID;
  acc_id UUID;
  dat_id UUID;
  gen_id UUID;
  sentence1_id UUID;
  sentence2_id UUID;
  sentence3_id UUID;
BEGIN
  -- Get IDs
  SELECT id INTO chapter1_id FROM public.chapters WHERE order_index = 1;
  SELECT id INTO chapter2_id FROM public.chapters WHERE order_index = 2;
  SELECT id INTO nom_id FROM public.grammatical_cases WHERE abbreviation = 'NOM';
  SELECT id INTO acc_id FROM public.grammatical_cases WHERE abbreviation = 'ACC';
  SELECT id INTO dat_id FROM public.grammatical_cases WHERE abbreviation = 'DAT';
  SELECT id INTO gen_id FROM public.grammatical_cases WHERE abbreviation = 'GEN';

  -- Insert sample sentences for Chapter 1
  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'De kat ziet de muis.', 'easy')
  RETURNING id INTO sentence1_id;

  -- Annotations for sentence 1
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id, explanation) VALUES
    (sentence1_id, 0, 'De', nom_id, 'Lidwoord bij onderwerp'),
    (sentence1_id, 1, 'kat', nom_id, 'Onderwerp van de zin'),
    (sentence1_id, 3, 'de', acc_id, 'Lidwoord bij lijdend voorwerp'),
    (sentence1_id, 4, 'muis', acc_id, 'Lijdend voorwerp');

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter1_id, 'De man geeft de vrouw een boek.', 'medium')
  RETURNING id INTO sentence2_id;

  -- Annotations for sentence 2
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id, explanation) VALUES
    (sentence2_id, 0, 'De', nom_id, 'Lidwoord bij onderwerp'),
    (sentence2_id, 1, 'man', nom_id, 'Onderwerp van de zin'),
    (sentence2_id, 3, 'de', dat_id, 'Lidwoord bij meewerkend voorwerp'),
    (sentence2_id, 4, 'vrouw', dat_id, 'Meewerkend voorwerp'),
    (sentence2_id, 6, 'boek', acc_id, 'Lijdend voorwerp');

  INSERT INTO public.sentences (chapter_id, text, difficulty)
  VALUES (chapter2_id, 'Het huis van de buurman is groot.', 'medium')
  RETURNING id INTO sentence3_id;

  -- Annotations for sentence 3
  INSERT INTO public.word_annotations (sentence_id, word_index, word_text, grammatical_case_id, explanation) VALUES
    (sentence3_id, 0, 'Het', nom_id, 'Lidwoord bij onderwerp'),
    (sentence3_id, 1, 'huis', nom_id, 'Onderwerp van de zin'),
    (sentence3_id, 3, 'de', gen_id, 'Lidwoord bij bezit'),
    (sentence3_id, 4, 'buurman', gen_id, 'Genitief - bezit');
END $$;
