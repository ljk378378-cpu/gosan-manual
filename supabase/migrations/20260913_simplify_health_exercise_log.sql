alter table public.health_events
  add column if not exists detail text;

alter table public.health_events
  drop constraint if exists health_events_event_type_check;

alter table public.health_events
  add constraint health_events_event_type_check check (event_type in (
    'health_a',
    'health_b',
    'water',
    'medicine_morning',
    'medicine_night',
    'sleep',
    'neck_pain',
    'back_pain',
    'weight',
    'exercise',
    'symptom'
  ));
