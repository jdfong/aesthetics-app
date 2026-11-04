-- Placeholder content for testing the endpoints before real content exists.
-- Labels here are dummies ("type-a", ...), not real style answers (D16).
-- Phase 4 replaces this with the real 40 buildings.

insert into public.items (slug, profile) values
  ('placeholder-1', '{"name": "Placeholder One", "age": 54, "tagline": "Test card"}'),
  ('placeholder-2', '{"name": "Placeholder Two", "age": 121, "tagline": "Test card"}'),
  ('placeholder-3', '{"name": "Placeholder Three", "age": 9, "tagline": "Test card"}')
on conflict (slug) do nothing;

insert into public.item_photos (item_id, position, storage_path, alt_text)
select id, 0, 'placeholder/' || id || '.webp', 'Placeholder photo'
from public.items where slug like 'placeholder-%'
on conflict (item_id, position) do nothing;

insert into public.item_attributes (item_id, key, value, source)
select id, 'style', 'type-' || right(slug, 1), 'placeholder'
from public.items where slug like 'placeholder-%'
on conflict (item_id, key) do nothing;

insert into public.decks (name, config, is_active)
select 'default', '{"order": "shuffle", "size": 20, "balance_by": "style"}', true
where not exists (select 1 from public.decks where is_active);
