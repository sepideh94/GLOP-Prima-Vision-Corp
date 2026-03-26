BEGIN;

DELETE FROM notification;
DELETE FROM incident_impact_levels;
DELETE FROM incident;
DELETE FROM result;
DELETE FROM trial_participant;
DELETE FROM schedule_item;
DELETE FROM volonteer_assignments;
DELETE FROM participation;
DELETE FROM team_athletes;
DELETE FROM team;
DELETE FROM athlete_location;
DELETE FROM athlete;
DELETE FROM commissionner;
DELETE FROM volonteer;
DELETE FROM spectator;
DELETE FROM document;
DELETE FROM trial;
DELETE FROM round;
DELETE FROM competition;
DELETE FROM events;
DELETE FROM site;

DELETE FROM activation_token
WHERE user_id IN (
  SELECT id
  FROM user_account
  WHERE user_type IN ('ATHLETE', 'SPECTATOR', 'VOLONTEER', 'COMMISSIONNER')
);

DELETE FROM user_account
WHERE user_type IN ('ATHLETE', 'SPECTATOR', 'VOLONTEER', 'COMMISSIONNER');

INSERT INTO site (id, adress, latitude, longitude) VALUES
(1001, '261 Boulevard de Tournai, 59650 Villeneuve-d''Ascq', 50.6119, 3.1307),
(1002, 'Boulevard de Tournai, 59650 Villeneuve-d''Ascq', 50.6119, 3.1307),
(1003, '361 Avenue du Président Wilson, 93210 Saint-Denis', 48.9255, 2.3601),
(1004, '42 Rue de l''Abbé Lemire, 59000 Lille', 50.6292, 3.0573);

INSERT INTO events (id, description, end_date, name, start_date)
VALUES (
  2001,
  '<p>Championnats d''Europe de natation 2026 - démonstration OrgaEvLille / CiblOrgaSport</p>',
  '2026-04-30 20:00:00',
  'Championnats d''Europe de natation 2026',
  '2026-03-01 08:00:00'
);

INSERT INTO competition (id, description, end_date, name, start_date, id_event) VALUES
(3001, 'Compétition individuelle - sprint et demi-fond', '2026-03-20 19:00:00', 'Natation individuelle', '2026-03-05 09:00:00', 2001),
(3002, 'Compétition par équipes - relais mixtes', '2026-04-20 19:00:00', 'Natation par équipes', '2026-04-10 09:00:00', 2001);

INSERT INTO round (id, name) VALUES
(4001, 'QUALIFICATION_HEAT'),
(4002, 'FINALE');

INSERT INTO document (id, bucket_name, content_type, file_name, file_size, s3_key, uploaded_at) VALUES
(1001, 'ciblorgasport-documents', 'application/pdf', 'commissionner_amina_badji_accreditation.pdf', 102400, 'seed/commissionner_amina_badji_accreditation.pdf', NOW()),
(1002, 'ciblorgasport-documents', 'application/pdf', 'commissionner_thomas_mercier_accreditation.pdf', 102400, 'seed/commissionner_thomas_mercier_accreditation.pdf', NOW()),
(1101, 'ciblorgasport-documents', 'application/pdf', 'athlete_lina_haddad_passport.pdf', 102400, 'seed/athlete_lina_haddad_passport.pdf', NOW()),
(1102, 'ciblorgasport-documents', 'application/pdf', 'athlete_lina_haddad_medical.pdf', 102400, 'seed/athlete_lina_haddad_medical.pdf', NOW()),
(1103, 'ciblorgasport-documents', 'application/pdf', 'athlete_nora_azizi_passport.pdf', 102400, 'seed/athlete_nora_azizi_passport.pdf', NOW()),
(1104, 'ciblorgasport-documents', 'application/pdf', 'athlete_nora_azizi_medical.pdf', 102400, 'seed/athlete_nora_azizi_medical.pdf', NOW()),
(1105, 'ciblorgasport-documents', 'application/pdf', 'athlete_ines_benali_passport.pdf', 102400, 'seed/athlete_ines_benali_passport.pdf', NOW()),
(1106, 'ciblorgasport-documents', 'application/pdf', 'athlete_ines_benali_medical.pdf', 102400, 'seed/athlete_ines_benali_medical.pdf', NOW()),
(1107, 'ciblorgasport-documents', 'application/pdf', 'athlete_sarah_abbas_passport.pdf', 102400, 'seed/athlete_sarah_abbas_passport.pdf', NOW()),
(1108, 'ciblorgasport-documents', 'application/pdf', 'athlete_sarah_abbas_medical.pdf', 102400, 'seed/athlete_sarah_abbas_medical.pdf', NOW()),
(1109, 'ciblorgasport-documents', 'application/pdf', 'athlete_camille_moreau_passport.pdf', 102400, 'seed/athlete_camille_moreau_passport.pdf', NOW()),
(1110, 'ciblorgasport-documents', 'application/pdf', 'athlete_camille_moreau_medical.pdf', 102400, 'seed/athlete_camille_moreau_medical.pdf', NOW()),
(1111, 'ciblorgasport-documents', 'application/pdf', 'athlete_zoe_laurent_passport.pdf', 102400, 'seed/athlete_zoe_laurent_passport.pdf', NOW()),
(1112, 'ciblorgasport-documents', 'application/pdf', 'athlete_zoe_laurent_medical.pdf', 102400, 'seed/athlete_zoe_laurent_medical.pdf', NOW()),
(1113, 'ciblorgasport-documents', 'application/pdf', 'athlete_yanis_cherif_passport.pdf', 102400, 'seed/athlete_yanis_cherif_passport.pdf', NOW()),
(1114, 'ciblorgasport-documents', 'application/pdf', 'athlete_yanis_cherif_medical.pdf', 102400, 'seed/athlete_yanis_cherif_medical.pdf', NOW()),
(1115, 'ciblorgasport-documents', 'application/pdf', 'athlete_adam_rahimi_passport.pdf', 102400, 'seed/athlete_adam_rahimi_passport.pdf', NOW()),
(1116, 'ciblorgasport-documents', 'application/pdf', 'athlete_adam_rahimi_medical.pdf', 102400, 'seed/athlete_adam_rahimi_medical.pdf', NOW()),
(1117, 'ciblorgasport-documents', 'application/pdf', 'athlete_louis_perrin_passport.pdf', 102400, 'seed/athlete_louis_perrin_passport.pdf', NOW()),
(1118, 'ciblorgasport-documents', 'application/pdf', 'athlete_louis_perrin_medical.pdf', 102400, 'seed/athlete_louis_perrin_medical.pdf', NOW()),
(1119, 'ciblorgasport-documents', 'application/pdf', 'athlete_hugo_martin_passport.pdf', 102400, 'seed/athlete_hugo_martin_passport.pdf', NOW()),
(1120, 'ciblorgasport-documents', 'application/pdf', 'athlete_hugo_martin_medical.pdf', 102400, 'seed/athlete_hugo_martin_medical.pdf', NOW()),
(1121, 'ciblorgasport-documents', 'application/pdf', 'athlete_noa_diallo_passport.pdf', 102400, 'seed/athlete_noa_diallo_passport.pdf', NOW()),
(1122, 'ciblorgasport-documents', 'application/pdf', 'athlete_noa_diallo_medical.pdf', 102400, 'seed/athlete_noa_diallo_medical.pdf', NOW()),
(1123, 'ciblorgasport-documents', 'application/pdf', 'athlete_lena_rossi_passport.pdf', 102400, 'seed/athlete_lena_rossi_passport.pdf', NOW()),
(1124, 'ciblorgasport-documents', 'application/pdf', 'athlete_lena_rossi_medical.pdf', 102400, 'seed/athlete_lena_rossi_medical.pdf', NOW()),
(1125, 'ciblorgasport-documents', 'application/pdf', 'athlete_rayan_kaci_passport.pdf', 102400, 'seed/athlete_rayan_kaci_passport.pdf', NOW()),
(1126, 'ciblorgasport-documents', 'application/pdf', 'athlete_rayan_kaci_medical.pdf', 102400, 'seed/athlete_rayan_kaci_medical.pdf', NOW()),
(1127, 'ciblorgasport-documents', 'application/pdf', 'athlete_ines_boukari_passport.pdf', 102400, 'seed/athlete_ines_boukari_passport.pdf', NOW()),
(1128, 'ciblorgasport-documents', 'application/pdf', 'athlete_ines_boukari_medical.pdf', 102400, 'seed/athlete_ines_boukari_medical.pdf', NOW()),
(1201, 'ciblorgasport-documents', 'application/pdf', 'spectator_sophie_martin_ticket.pdf', 102400, 'seed/spectator_sophie_martin_ticket.pdf', NOW()),
(1202, 'ciblorgasport-documents', 'application/pdf', 'spectator_karim_haddou_ticket.pdf', 102400, 'seed/spectator_karim_haddou_ticket.pdf', NOW()),
(1203, 'ciblorgasport-documents', 'application/pdf', 'spectator_claire_dubois_ticket.pdf', 102400, 'seed/spectator_claire_dubois_ticket.pdf', NOW());

INSERT INTO user_account (id, user_type, created_at, email, first_name, is_active, last_name, password, updated_at) VALUES
(8001, 'COMMISSIONNER', NOW(), 'amina.badji@yopmail.com', 'Amina', true, 'Badji', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8002, 'COMMISSIONNER', NOW(), 'thomas.mercier@yopmail.com', 'Thomas', true, 'Mercier', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8101, 'VOLONTEER', NOW(), 'lea.bernard@yopmail.com', 'Léa', true, 'Bernard', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8102, 'VOLONTEER', NOW(), 'mehdi.fares@yopmail.com', 'Mehdi', true, 'Fares', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8103, 'VOLONTEER', NOW(), 'julie.petit@yopmail.com', 'Julie', true, 'Petit', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8201, 'ATHLETE', NOW(), 'lina.haddad@yopmail.com', 'Lina', true, 'Haddad', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8202, 'ATHLETE', NOW(), 'nora.azizi@yopmail.com', 'Nora', true, 'Azizi', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8203, 'ATHLETE', NOW(), 'ines.benali@yopmail.com', 'Inès', true, 'Benali', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8204, 'ATHLETE', NOW(), 'sarah.abbas@yopmail.com', 'Sarah', true, 'Abbas', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8205, 'ATHLETE', NOW(), 'camille.moreau@yopmail.com', 'Camille', true, 'Moreau', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8206, 'ATHLETE', NOW(), 'zoe.laurent@yopmail.com', 'Zoe', true, 'Laurent', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8207, 'ATHLETE', NOW(), 'yanis.cherif@yopmail.com', 'Yanis', true, 'Cherif', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8208, 'ATHLETE', NOW(), 'adam.rahimi@yopmail.com', 'Adam', true, 'Rahimi', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8209, 'ATHLETE', NOW(), 'louis.perrin@yopmail.com', 'Louis', true, 'Perrin', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8210, 'ATHLETE', NOW(), 'hugo.martin@yopmail.com', 'Hugo', true, 'Martin', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8211, 'ATHLETE', NOW(), 'noa.diallo@yopmail.com', 'Noa', true, 'Diallo', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8212, 'ATHLETE', NOW(), 'lena.rossi@yopmail.com', 'Léna', true, 'Rossi', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8213, 'ATHLETE', NOW(), 'rayan.kaci@yopmail.com', 'Rayan', true, 'Kaci', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8214, 'ATHLETE', NOW(), 'emma.fournier@yopmail.com', 'Emma', true, 'Fournier', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8301, 'SPECTATOR', NOW(), 'sophie.martin@yopmail.com', 'Sophie', true, 'Martin', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8302, 'SPECTATOR', NOW(), 'karim.haddou@yopmail.com', 'Karim', true, 'Haddou', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW()),
(8303, 'SPECTATOR', NOW(), 'claire.dubois@yopmail.com', 'Claire', true, 'Dubois', '$2a$10$gs9uxrba7BIMhn6GOPfFyeO/ma7Wen17Y2WQM0VAhEmwHMmUJQA8y', NOW());

INSERT INTO commissionner (id, accreditation_doc_id, is_accredited) VALUES
(8001, 1001, true),
(8002, 1002, true);

INSERT INTO volonteer (id) VALUES
(8101), (8102), (8103);

INSERT INTO athlete (
  id, birth_date, charter_accepted_at, has_accepted_charte, nationality,
  passport_number, passport_document_id, sexe, medical_certificate_id
) VALUES
(8201, '2002-05-14', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1101, 'F', 1102),
(8202, '2001-07-22', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1103, 'F', 1104),
(8203, '2000-03-11', NOW(), true, 'Algérie', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1105, 'F', 1106),
(8204, '2002-12-09', NOW(), true, 'Maroc', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1107, 'F', 1108),
(8205, '2001-08-30', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1109, 'F', 1110),
(8206, '2003-01-18', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1111, 'F', 1112),
(8207, '2000-10-04', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1113, NULL, 1114),
(8208, '1999-11-19', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1115, NULL, 1116),
(8209, '2001-02-27', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1117, NULL, 1118),
(8210, '2000-09-13', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1119, NULL, 1120),
(8211, '2002-04-06', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1121, 'F', 1122),
(8212, '2001-09-21', NOW(), true, 'Italie', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1123, 'F', 1124),
(8213, '2000-06-17', NOW(), true, 'Algérie', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1125, 'M', 1126),
(8214, '2002-11-02', NOW(), true, 'France', 'jhAVz0i+WO132Yz0wNs25Z4h8Jf5jg8a7V2jrENDY+g=', 1127, 'F', 1128);

INSERT INTO spectator (id, ticket_document_id) VALUES
(8301, 1201),
(8302, 1202),
(8303, 1203);

INSERT INTO team (id, name) VALUES
(8401, 'Relais Nord Bleu'),
(8402, 'Relais Nord Blanc'),
(8403, 'Relais Europe Aqua'),
(8404, 'Relais Lille Waves');

INSERT INTO team_athletes (team_id, athlete_id) VALUES
(8401, 8207), (8401, 8208),
(8402, 8209), (8402, 8210),
(8403, 8211), (8403, 8212),
(8404, 8213), (8404, 8214);

INSERT INTO trial (
  id, cancelled, cancelled_at, category_gender, description, end_date, end_hour, mode,
  name, round_number, rules, start_date, start_hour, trial_name, cancelled_by,
  id_competition, id_round, id_site
) VALUES
(7001, false, NULL, 'FEMALE', '50m nage libre dames - séries', '2026-03-05', '10:35:00', 'INDIVIDUAL',
 '50m nage libre femmes - qualification', 1, 'Règlement LEN', '2026-03-05', '10:00:00', 'FIFTY_M_FREESTYLE', NULL, 3001, 4001, 1003),
(7002, false, NULL, 'MALE', '100m nage libre messieurs - séries', '2026-03-06', '12:15:00', 'INDIVIDUAL',
 '100m nage libre hommes - qualification', 1, 'Règlement LEN', '2026-03-06', '11:30:00', 'HUNDRED_M_FREESTYLE', NULL, 3001, 4001, 1003),
(7003, false, NULL, 'FEMALE', '200m nage libre dames - finale', '2026-03-18', '17:00:00', 'INDIVIDUAL',
 '200m nage libre femmes - finale', 1, 'Règlement LEN', '2026-03-18', '16:15:00', 'TWO_HUNDRED_M_FREESTYLE', NULL, 3001, 4002, 1003),
(7004, false, NULL, 'MALE', '200m dos messieurs - finale', '2026-03-20', '18:00:00', 'INDIVIDUAL',
 '200m dos hommes - finale', 1, 'Règlement LEN', '2026-03-20', '17:15:00', 'TWO_HUNDRED_M_BACKSTROKE', NULL, 3001, 4002, 1003),
(7005, false, NULL, 'MIXTE', 'Relais mixte - qualification', '2026-04-12', '11:00:00', 'TEAM',
 'Relais mixte - qualification', 1, 'Règlement LEN', '2026-04-12', '10:15:00', 'RELAY_4X100M_FREESTYLE', NULL, 3002, 4001, 1002),
(7006, false, NULL, 'MIXTE', 'Relais mixte - finale', '2026-04-20', '18:00:00', 'TEAM',
 'Relais mixte - finale', 1, 'Règlement LEN', '2026-04-20', '17:15:00', 'RELAY_4X100M_MEDLEY', NULL, 3002, 4002, 1002);

INSERT INTO participation (
  id, charter_accepted, charter_accepted_at, competitor_id, competitor_type,
  created_at, status, updated_at, competition_id
) VALUES
(5001, true, NOW(), 8201, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3001),
(5002, true, NOW(), 8202, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3001),
(5003, true, NOW(), 8203, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3001),
(5004, true, NOW(), 8204, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3001),
(5005, true, NOW(), 8205, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3001),
(5006, true, NOW(), 8206, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3001),
(5011, true, NOW(), 8401, 'TEAM', NOW(), 'CONFIRMED', NOW(), 3002),
(5012, true, NOW(), 8402, 'TEAM', NOW(), 'CONFIRMED', NOW(), 3002),
(5013, true, NOW(), 8403, 'TEAM', NOW(), 'CONFIRMED', NOW(), 3002),
(5014, true, NOW(), 8404, 'TEAM', NOW(), 'CONFIRMED', NOW(), 3002),
(5015, true, NOW(), 8207, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3002),
(5016, true, NOW(), 8208, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3002),
(5017, true, NOW(), 8209, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3002),
(5018, true, NOW(), 8210, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3002),
(5019, true, NOW(), 8211, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3002),
(5020, true, NOW(), 8212, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3002),
(5021, true, NOW(), 8213, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3002),
(5022, true, NOW(), 8214, 'ATHLETE', NOW(), 'CONFIRMED', NOW(), 3002);

INSERT INTO trial_participant (id, competitor_id, competitor_type, created_at, status, trial_id, updated_at) VALUES
(9001, 8201, 'ATHLETE', NOW(), 'ACTIVE', 7001, NOW()),
(9002, 8202, 'ATHLETE', NOW(), 'ACTIVE', 7001, NOW()),
(9003, 8203, 'ATHLETE', NOW(), 'ACTIVE', 7001, NOW()),
(9004, 8204, 'ATHLETE', NOW(), 'ACTIVE', 7001, NOW()),
(9005, 8205, 'ATHLETE', NOW(), 'ACTIVE', 7001, NOW()),
(9011, 8201, 'ATHLETE', NOW(), 'ACTIVE', 7002, NOW()),
(9012, 8202, 'ATHLETE', NOW(), 'ACTIVE', 7002, NOW()),
(9013, 8203, 'ATHLETE', NOW(), 'ACTIVE', 7002, NOW()),
(9014, 8204, 'ATHLETE', NOW(), 'ACTIVE', 7002, NOW()),
(9021, 8201, 'ATHLETE', NOW(), 'ACTIVE', 7003, NOW()),
(9022, 8203, 'ATHLETE', NOW(), 'ACTIVE', 7003, NOW()),
(9023, 8205, 'ATHLETE', NOW(), 'ACTIVE', 7003, NOW()),
(9024, 8206, 'ATHLETE', NOW(), 'ACTIVE', 7003, NOW()),
(9031, 8202, 'ATHLETE', NOW(), 'ACTIVE', 7004, NOW()),
(9032, 8203, 'ATHLETE', NOW(), 'ACTIVE', 7004, NOW()),
(9033, 8204, 'ATHLETE', NOW(), 'ACTIVE', 7004, NOW()),
(9034, 8206, 'ATHLETE', NOW(), 'ACTIVE', 7004, NOW()),
(9041, 8401, 'TEAM', NOW(), 'ACTIVE', 7005, NOW()),
(9042, 8402, 'TEAM', NOW(), 'ACTIVE', 7005, NOW()),
(9043, 8403, 'TEAM', NOW(), 'ACTIVE', 7005, NOW()),
(9044, 8404, 'TEAM', NOW(), 'ACTIVE', 7005, NOW()),
(9051, 8401, 'TEAM', NOW(), 'ACTIVE', 7006, NOW()),
(9052, 8402, 'TEAM', NOW(), 'ACTIVE', 7006, NOW()),
(9053, 8403, 'TEAM', NOW(), 'ACTIVE', 7006, NOW()),
(9054, 8404, 'TEAM', NOW(), 'ACTIVE', 7006, NOW());

-- Lignes de disponibilité pour qu'ils apparaissent dans le formulaire de création
INSERT INTO volonteer_assignments
(id, end_time, start_time, status, title, competition_id, id_site, volonteer_id) VALUES
(9501, NULL, NULL, 'CONFIRMED', NULL, 3001, NULL, 8101),
(9502, NULL, NULL, 'CONFIRMED', NULL, 3001, NULL, 8102),
(9503, NULL, NULL, 'CONFIRMED', NULL, 3002, NULL, 8103);

-- Planning réellement affichable
INSERT INTO schedule_item
(id, description, end_time, start_time, status, title, type, id_assigned_user, id_competition, id_created_by, id_site) VALUES
(9601, NULL, '2026-03-05 13:00:00', '2026-03-05 09:00:00', 'IN_PROGRESS', 'Accueil compétition individuelle', 'VOLONTEER', 8101, 3001, 8001, 1003),
(9602, NULL, '2026-03-18 19:00:00', '2026-03-18 15:30:00', 'IN_PROGRESS', 'Support finales individuelles', 'VOLONTEER', 8102, 3001, 8001, 1003),
(9603, NULL, '2026-04-12 12:30:00', '2026-04-12 09:30:00', 'UPCOMING', 'Support relais mixtes', 'VOLONTEER', 8103, 3002, 8001, 1002);

-- Miroir dans volonteer_assignments avec horaires
INSERT INTO volonteer_assignments
(id, end_time, start_time, status, title, competition_id, id_site, volonteer_id) VALUES
(9504, '2026-03-05 13:00:00', '2026-03-05 09:00:00', 'CONFIRMED', 'Accueil compétition individuelle', 3001, 1003, 8101),
(9505, '2026-03-18 19:00:00', '2026-03-18 15:30:00', 'CONFIRMED', 'Support finales individuelles', 3001, 1003, 8102),
(9506, '2026-04-12 12:30:00', '2026-04-12 09:30:00', 'CONFIRMED', 'Support relais mixtes', 3002, 1002, 8103);


INSERT INTO result
  (id, performance_type, performance_value, rank, is_tie, updated_at, updated_by, trial_id, trial_participant_id)
VALUES
(10001, 'TIME', 25.41, 1, false, '2026-03-05 11:00:00', 'seed', 7001, 9001),
(10002, 'TIME', 25.88, 2, false, '2026-03-05 11:00:00', 'seed', 7001, 9002),
(10003, 'TIME', 26.14, 3, false, '2026-03-05 11:00:00', 'seed', 7001, 9003),
(10004, 'TIME', 26.42, 4, false, '2026-03-05 11:00:00', 'seed', 7001, 9004),
(10005, 'TIME', 26.73, 5, false, '2026-03-05 11:00:00', 'seed', 7001, 9005),
(10006, 'TIME', 49.82, 1, false, '2026-03-06 12:40:00', 'seed', 7002, 9011),
(10007, 'TIME', 50.11, 2, false, '2026-03-06 12:40:00', 'seed', 7002, 9012),
(10008, 'TIME', 50.57, 3, false, '2026-03-06 12:40:00', 'seed', 7002, 9013),
(10009, 'TIME', 51.03, 4, false, '2026-03-06 12:40:00', 'seed', 7002, 9014),
(10010, 'TIME', 121.35, 1, false, '2026-03-18 17:20:00', 'seed', 7003, 9021),
(10011, 'TIME', 122.04, 2, false, '2026-03-18 17:20:00', 'seed', 7003, 9022),
(10012, 'TIME', 122.90, 3, false, '2026-03-18 17:20:00', 'seed', 7003, 9023),
(10013, 'TIME', 123.44, 4, false, '2026-03-18 17:20:00', 'seed', 7003, 9024),
(10014, 'TIME', 118.73, 1, false, '2026-03-20 18:20:00', 'seed', 7004, 9031),
(10015, 'TIME', 119.25, 2, false, '2026-03-20 18:20:00', 'seed', 7004, 9032),
(10016, 'TIME', 120.02, 3, false, '2026-03-20 18:20:00', 'seed', 7004, 9033),
(10017, 'TIME', 120.61, 4, false, '2026-03-20 18:20:00', 'seed', 7004, 9034);

INSERT INTO incident
  (id, created_at, description, status, title, updated_at, competition_id, created_by, event_id, site_id, trial_id)
VALUES
(11001, '2026-03-18 16:40:00', 'Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', 'RESOLU', 'Sol glissant zone bassin', '2026-03-18 17:10:00', 3001, 8001, 2001, 1003, 7003),
(11002, '2026-04-12 10:20:00', 'Retard logistique sur la préparation des couloirs pour le relais mixte.', 'EN_COURS', 'Retard logistique sur relais', NULL, 3002, 8002, 2001, 1002, 7005),
(11003, '2026-04-22 08:15:00', 'Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', 'EN_COURS', 'Alerte circulation accès principal', NULL, NULL, 8001, 2001, NULL, NULL);

INSERT INTO incident_impact_levels
  (incident_id, impact_level)
VALUES
(11001, 'ATHLETE'),
(11002, 'TOUS'),
(11003, 'TOUS');

INSERT INTO notification
  (id, incident_status, is_read, link, message, sent_at, title, type, incident_id, recipient_id)
VALUES
(12001, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8201),
(12002, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8202),
(12003, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8203),
(12004, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8204),
(12005, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8205),
(12006, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8206),
(12007, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8207),
(12008, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8208),
(12009, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8209),
(12010, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8210),
(12011, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8211),
(12012, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8212),
(12013, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8213),
(12014, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 16:45:00', '[Incident] Sol glissant zone bassin', 'INCIDENT', 11001, 8214),
(12015, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8201),
(12016, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8202),
(12017, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8203),
(12018, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8204),
(12019, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8205),
(12020, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8206),
(12021, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8207),
(12022, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8208),
(12023, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8209),
(12024, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8210),
(12025, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8211),
(12026, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8212),
(12027, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8213),
(12028, 'RESOLU', false, 'http://localhost:3000/#/login?next=/notifications', 'Un incident a été résolu. Titre : Sol glissant zone bassin | Description : Glissade mineure près du bassin d''échauffement, zone sécurisée immédiatement.', '2026-03-18 17:10:00', '[Incident résolu] Sol glissant zone bassin', 'INCIDENT', 11001, 8214),
(12029, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8001),
(12030, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8002),
(12031, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8101),
(12032, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8102),
(12033, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8103),
(12034, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8201),
(12035, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8202),
(12036, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8203),
(12037, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8204),
(12038, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8205),
(12039, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8206),
(12040, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8207),
(12041, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8208),
(12042, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8209),
(12043, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8210),
(12044, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8211),
(12045, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8212),
(12046, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8213),
(12047, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8214),
(12048, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8301),
(12049, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8302),
(12050, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Retard logistique sur relais | Description : Retard logistique sur la préparation des couloirs pour le relais mixte.', '2026-04-12 10:25:00', '[Incident] Retard logistique sur relais', 'INCIDENT', 11002, 8303),
(12051, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8001),
(12052, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8002),
(12053, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8101),
(12054, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8102),
(12055, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8103),
(12056, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8201),
(12057, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8202),
(12058, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8203),
(12059, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8204),
(12060, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8205),
(12061, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8206),
(12062, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8207),
(12063, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8208),
(12064, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8209),
(12065, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8210),
(12066, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8211),
(12067, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8212),
(12068, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8213),
(12069, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8214),
(12070, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8301),
(12071, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8302),
(12072, 'EN_COURS', false, 'http://localhost:3000/#/login?next=/notifications', 'Un nouvel incident a été déclaré. Titre : Alerte circulation accès principal | Description : Circulation fortement ralentie aux abords du site principal, merci d''anticiper vos déplacements.', '2026-04-22 08:20:00', '[Incident] Alerte circulation accès principal', 'INCIDENT', 11003, 8303);


SELECT setval(pg_get_serial_sequence('events','id'), COALESCE((SELECT MAX(id) FROM events), 1), true);
SELECT setval(pg_get_serial_sequence('competition','id'), COALESCE((SELECT MAX(id) FROM competition), 1), true);
SELECT setval(pg_get_serial_sequence('round','id'), COALESCE((SELECT MAX(id) FROM round), 1), true);
SELECT setval(pg_get_serial_sequence('site','id'), COALESCE((SELECT MAX(id) FROM site), 1), true);
SELECT setval(pg_get_serial_sequence('document','id'), COALESCE((SELECT MAX(id) FROM document), 1), true);
SELECT setval(pg_get_serial_sequence('team','id'), COALESCE((SELECT MAX(id) FROM team), 1), true);
SELECT setval(pg_get_serial_sequence('trial','id'), COALESCE((SELECT MAX(id) FROM trial), 1), true);
SELECT setval(pg_get_serial_sequence('participation','id'), COALESCE((SELECT MAX(id) FROM participation), 1), true);
SELECT setval(pg_get_serial_sequence('trial_participant','id'), COALESCE((SELECT MAX(id) FROM trial_participant), 1), true);
SELECT setval(pg_get_serial_sequence('result','id'), COALESCE((SELECT MAX(id) FROM result), 1), true);
SELECT setval(pg_get_serial_sequence('incident','id'), COALESCE((SELECT MAX(id) FROM incident), 1), true);
SELECT setval(pg_get_serial_sequence('notification','id'), COALESCE((SELECT MAX(id) FROM notification), 1), true);
SELECT setval(pg_get_serial_sequence('volonteer_assignments','id'), COALESCE((SELECT MAX(id) FROM volonteer_assignments), 1), true);
SELECT setval(pg_get_serial_sequence('schedule_item','id'), COALESCE((SELECT MAX(id) FROM schedule_item), 1), true);

COMMIT;
