
-- Enable pg_cron and pg_net extensions required for scheduled tasks and HTTP requests
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Grant necessary permissions for the cron job to execute
grant usage on schema cron to postgres;
grant all on all tables in schema cron to postgres;
grant usage on schema net to postgres;

-- Schedule a cron job to invoke the 'send-reminders' function daily at 9 AM UTC
select
cron.schedule(
  'daily-tax-reminders',
  '0 9 * * *', -- Runs every day at 9:00 AM Coordinated Universal Time (UTC)
  $$
  select
    net.http_post(
        url:='https://ymouskawbdwajvqytqqr.supabase.co/functions/v1/send-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltb3Vza2F3YmR3YWp2cXl0cXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTExNTEsImV4cCI6MjA2NTU4NzE1MX0.5_sojnYd5ODLoROKoMzcRJPXk6y27UlCgVwVb8yQpaI"}'::jsonb
    ) as request_id;
  $$
);
