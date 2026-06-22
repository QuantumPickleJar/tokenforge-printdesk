-- Harden the v0.1 request-models upload policy without relying on MIME type or nonessential storage helpers.

drop policy if exists "Public upload exact request STL path" on storage.objects;

create policy "Public upload exact request STL path" on storage.objects
for insert to anon, authenticated
with check (
  bucket_id = 'request-models'
  and storage.filename(name) = 'model.stl'
  and lower(name) like 'requests/%/model.stl'
  and (storage.foldername(name))[1] = 'requests'
  and public.request_exists_for_upload(((storage.foldername(name))[2])::uuid)
);
