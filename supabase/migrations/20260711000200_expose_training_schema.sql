-- Expose the training schema to Supabase's Data API without moving or exposing
-- any existing call-center or finance tables.
grant usage on schema training to anon, authenticated;
alter role authenticator set pgrst.db_schemas = 'public, storage, graphql_public, training';
notify pgrst, 'reload config';
