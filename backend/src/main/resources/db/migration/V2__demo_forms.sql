-- Formes de demonstration : l'app est explorable des le premier `docker compose up`.

INSERT INTO forms (id, title, description, slug, status, ink, fields, created_at, updated_at) VALUES
('0b6a3c1e-5f2d-4c8e-9a71-2d4f6e8a1b01',
 'Stage de linogravure',
 'Deux jours d''atelier pour graver, encrer et tirer vos premières estampes. Places limitées à douze personnes.',
 'stage-de-linogravure-demo', 'PUBLISHED', 'VERMILLON',
 '[
   {"id":"s-vous","type":"section","name":"section_vous","label":"Vous","required":false},
   {"id":"f-prenom","type":"text","name":"prenom","label":"Prénom","placeholder":"Claude","required":true,"width":"half","rules":{"maxLength":60}},
   {"id":"f-nom","type":"text","name":"nom","label":"Nom","placeholder":"Garamond","required":true,"width":"half","rules":{"maxLength":60}},
   {"id":"f-email","type":"email","name":"email","label":"Adresse e-mail","placeholder":"claude@atelier.fr","help":"Pour vous envoyer la liste du matériel.","required":true},
   {"id":"s-stage","type":"section","name":"section_stage","label":"Le stage","required":false},
   {"id":"f-niveau","type":"select","name":"niveau","label":"Votre niveau","required":true,"options":[{"label":"Jamais gravé","value":"debutant"},{"label":"Quelques essais","value":"intermediaire"},{"label":"Graveur confirmé","value":"confirme"}]},
   {"id":"f-sessions","type":"checkboxes","name":"sessions","label":"Sessions souhaitées","required":true,"options":[{"label":"Samedi matin","value":"samedi_matin"},{"label":"Samedi après-midi","value":"samedi_aprem"},{"label":"Dimanche","value":"dimanche"}]},
   {"id":"f-places","type":"number","name":"places","label":"Nombre de places","required":true,"width":"half","rules":{"min":1,"max":4}},
   {"id":"f-arrivee","type":"date","name":"arrivee","label":"Date d''arrivée","required":false,"width":"half"},
   {"id":"f-code","type":"text","name":"code_adherent","label":"Code adhérent","placeholder":"AB-1234","help":"Facultatif : deux lettres, un tiret, quatre chiffres.","required":false,"rules":{"pattern":"[A-Z]{2}-[0-9]{4}","patternMessage":"Format attendu : AB-1234."}},
   {"id":"f-remarques","type":"textarea","name":"remarques","label":"Remarques","placeholder":"Allergies, accessibilité, envies...","required":false,"rules":{"maxLength":500}},
   {"id":"f-rgpd","type":"consent","name":"consentement","label":"J''accepte que l''atelier conserve ces informations le temps du stage.","required":true}
 ]'::jsonb,
 now() - interval '9 days', now() - interval '2 hours'),

('0b6a3c1e-5f2d-4c8e-9a71-2d4f6e8a1b02',
 'Avis de lecture',
 'Un livre vous a marqué ? Laissez une trace pour les prochains lecteurs du club.',
 'avis-de-lecture-demo', 'PUBLISHED', 'OUTREMER',
 '[
   {"id":"f-livre","type":"text","name":"livre","label":"Titre du livre","required":true,"rules":{"maxLength":120}},
   {"id":"f-auteur","type":"text","name":"auteur","label":"Auteur·rice","required":false,"width":"half"},
   {"id":"f-lu-le","type":"date","name":"lu_le","label":"Terminé le","required":false,"width":"half"},
   {"id":"f-note","type":"rating","name":"note","label":"Votre note","required":true,"rules":{"max":5}},
   {"id":"f-reco","type":"radio","name":"recommande","label":"Le recommanderiez-vous ?","required":true,"options":[{"label":"Sans hésiter","value":"oui"},{"label":"Selon les goûts","value":"peut_etre"},{"label":"Pas vraiment","value":"non"}]},
   {"id":"f-avis","type":"textarea","name":"avis","label":"Votre avis","help":"Sans divulgâcher la fin !","required":true,"rules":{"minLength":20,"maxLength":800}}
 ]'::jsonb,
 now() - interval '21 days', now() - interval '3 days'),

('0b6a3c1e-5f2d-4c8e-9a71-2d4f6e8a1b03',
 'Commande d''affiches',
 'Brouillon : bon de commande pour les tirages sérigraphiés de la saison.',
 'commande-d-affiches-demo', 'DRAFT', 'SAPIN',
 '[
   {"id":"f-structure","type":"text","name":"structure","label":"Structure","required":true},
   {"id":"f-contact","type":"email","name":"contact","label":"E-mail de contact","required":true,"width":"half"},
   {"id":"f-format","type":"select","name":"format","label":"Format","required":true,"width":"half","options":[{"label":"A3","value":"a3"},{"label":"A2","value":"a2"},{"label":"40 × 60","value":"40x60"}]},
   {"id":"f-quantite","type":"number","name":"quantite","label":"Quantité","required":true,"rules":{"min":10,"max":500}}
 ]'::jsonb,
 now() - interval '1 day', now() - interval '40 minutes');

INSERT INTO submissions (id, form_id, data, submitted_at) VALUES
('7d1e0000-0000-4000-8000-000000000001', '0b6a3c1e-5f2d-4c8e-9a71-2d4f6e8a1b01',
 '{"prenom":"Aline","nom":"Didot","email":"aline.didot@exemple.fr","niveau":"debutant","sessions":["samedi_matin","dimanche"],"places":2,"arrivee":"2026-10-17","consentement":true}'::jsonb,
 now() - interval '6 days'),
('7d1e0000-0000-4000-8000-000000000002', '0b6a3c1e-5f2d-4c8e-9a71-2d4f6e8a1b01',
 '{"prenom":"Jules","nom":"Bodoni","email":"jules@exemple.fr","niveau":"confirme","sessions":["samedi_aprem"],"places":1,"code_adherent":"JB-0042","remarques":"J''apporte mes gouges.","consentement":true}'::jsonb,
 now() - interval '4 days'),
('7d1e0000-0000-4000-8000-000000000003', '0b6a3c1e-5f2d-4c8e-9a71-2d4f6e8a1b01',
 '{"prenom":"Nour","nom":"Fournier","email":"nour.f@exemple.fr","niveau":"intermediaire","sessions":["samedi_matin","samedi_aprem","dimanche"],"places":3,"consentement":true}'::jsonb,
 now() - interval '1 day'),
('7d1e0000-0000-4000-8000-000000000004', '0b6a3c1e-5f2d-4c8e-9a71-2d4f6e8a1b02',
 '{"livre":"Les Choses","auteur":"Georges Perec","lu_le":"2026-09-02","note":5,"recommande":"oui","avis":"Un inventaire vertigineux, drôle et mélancolique à la fois."}'::jsonb,
 now() - interval '10 days'),
('7d1e0000-0000-4000-8000-000000000005', '0b6a3c1e-5f2d-4c8e-9a71-2d4f6e8a1b02',
 '{"livre":"L''Écume des jours","auteur":"Boris Vian","note":3,"recommande":"peut_etre","avis":"Magnifique au début, plus difficile à suivre ensuite."}'::jsonb,
 now() - interval '2 days');
