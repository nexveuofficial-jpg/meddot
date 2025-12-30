# Meddot Ecosystem Implementation Plan

This plan documents the step-by-step expansion of Meddot into a daily-use medical student ecosystem.

## Phase 1: Foundation & Admin Control (High Priority)
**Goal**: Establish the control systems (Feature Flags) and communication channels (Announcements) driven by the Admin Panel.

### Feature 13: Feature Flags System [DONE]
- [x] **Context**: `FeatureFlagContext` already exists.
- [x] **Database**: SQL schema generated in `supabase/schema_phase1.sql`.
- [x] **Admin UI**: Visual toggle board in `AdminFeatures.jsx` updated with all 5 flags.
- [x] **RLS**: Policies defined in SQL.

### Feature 9: Announcements System [DONE]
- [x] **Database**: SQL schema defined for `announcements`.
- [x] **Admin UI**: "Post Announcement" form updated with Priority selection (`AdminAnnouncements.jsx`).
- [x] **Reader UI**: `DashboardPage.js` connected to context and priority styles.

## Phase 2: Core Value (Content & Community)
**Goal**: Enable user-generated content and expert guidance.

### Feature 1: Student Publish Notes [DONE]
- [x] **Database**: SQL schema (Table + RLS) in `supabase/schema_phase2.sql`.
- [x] **Storage**: Supabase Storage bucket logic planned (needs manual creation or SQL extension execution).
- [x] **Student UI**: `/notes/upload` page ready with PDF validation.
- [x] **Admin UI**: "Review Queue" in `AdminNotes.jsx` updated to handle 'published' status.
- [x] **RLS**: Policies defined for Insert/Select.

### Feature 2: Ask Senior [DONE]
- [x] **Database**: `questions` and `answers` tables with upvotes support (SQL in `supabase/schema_feature_ask_senior.sql`).
- [x] **UI**: `/ask-senior` (Feed), `/ask-senior/ask` (Form), `/ask-senior/[id]` (Detail).
- [x] **Logic**: Only Senior/Admin role can answer (RLS Policy: `Allow senior/admin answer`).

## Phase 3: Engagement & Retention
**Goal**: Daily habits, social proof, and stickiness.

### Feature 3 & 4: Chat Systems [DONE]
- [x] **Database**: `chat_rooms`, `chat_messages` (Schema in `supabase/schema_phase3_chat.sql`).
- [x] **UI - Room List**: `/chat` page displaying active rooms.
- [x] **UI - Chat Room**: `/chat/[roomId]` with Realtime Subscription.
- [x] **Logic**: Auto-scroll to bottom, optimistic UI, Role Badges.
- [x] **Safety**: Admin toggle (Feature Flag `enable_chat`).

### Feature: User Profile Settings [DONE]
- [x] **Database**: `profiles` table extension (Schema in `supabase/schema_profile_updates.sql`).
- [x] **CRITICAL FIX**: Vercel Build Hang (Cleanup Realtime Subscriptions)
- [x] **UI**: `/settings` page for Avatar and Bio.

### Feature 5 & 10: Gamification (Streaks & Leaderboard) [PENDING]
- [ ] **Database**: `user_streaks` (current_streak, longest_streak, last_activity_date).
- [ ] **Logic**: Middleware/Effect to track daily login.
- [ ] **UI**: Flame icon in header + Leaderboard page.

## Execution Order
1. **Foundation**: Feature Flags & Announcements (Verify Admin Control).
2. **Content**: Student Uploads (Verify RLS & Approval Flow).
3. **Community**: Ask Senior (Verify Role-based answers).
4. **Engagement**: Chat & Profile Settings.
5. **Gamification**: Streaks & Leaderboard.

## Verification Checklist (Per Feature)
- [ ] Database Schema applied (supabase/migrations or direct SQL).
- [ ] RLS Policies enforced.
- [ ] Admin Control verified (Toggle/Approve/Delete).
- [ ] User UI verified (Responsive/Glassmorphic).
