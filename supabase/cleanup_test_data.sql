/*
  CLEANUP TEST DATA SCRIPT
  ------------------------
  Run this script in the Supabase SQL Editor to wipe all user-generated content
  (Chats, DMs, Notes, Q&A) before going live.

  WARNING: This action is irreversible. All messages, notes, and questions will be deleted.
*/

BEGIN;

-- 1. Wipe Group Chat Messages
TRUNCATE TABLE public.chat_messages RESTART IDENTITY CASCADE;

-- 2. Wipe Direct Messages
TRUNCATE TABLE public.direct_messages RESTART IDENTITY CASCADE;

-- 3. Wipe Uploaded Notes
TRUNCATE TABLE public.notes RESTART IDENTITY CASCADE;

-- 4. Wipe Ask Senior Questions & Answers
-- (Answers cascade delete from Questions usually, but explicit truncate is safer/cleaner)
TRUNCATE TABLE public.questions RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.answers RESTART IDENTITY CASCADE;

COMMIT;

-- optional: Verify counts are 0
SELECT 'chat_messages' as table_name, count(*) as row_count FROM public.chat_messages
UNION ALL
SELECT 'direct_messages' as table_name, count(*) as row_count FROM public.direct_messages
UNION ALL
SELECT 'notes' as table_name, count(*) as row_count FROM public.notes
UNION ALL
SELECT 'questions' as table_name, count(*) as row_count FROM public.questions
UNION ALL
SELECT 'answers' as table_name, count(*) as row_count FROM public.answers;
