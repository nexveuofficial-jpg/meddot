# Backend Integration Plan

## Overview
Currently, Meddot uses `localStorage` for simulating data persistence. This document outlines the strategy for migrating to a production-ready backend.

## Recommended Tech Stack
**Option 1: Supabase (Recommended)**
- **PostgreSQL Database**: Relational structure matches our data model (Users, Notes).
- **Auth**: Built-in support for Row Level Security (RLS) is perfect for our Admin vs. Student roles.
- **Storage**: Good for storing PDF notes.

**Option 2: Firebase**
- **Firestore**: Flexible NoSQL document store.
- **Auth**: Easy to set up Google/Email auth.
- **Storage**: Robust file storage.

## Data Schema (Proposed)

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary Key |
| email | text | Unique email |
| role | text | 'admin' or 'student' |
| created_at | timestamp | Account creation date |

### Notes Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary Key |
| title | text | Note title |
| subject | text | e.g. "Anatomy" |
| year | text | e.g. "1st Year" |
| file_url | text | URL to PDF in storage |
| author_id | uuid | FK to Users table |
| created_at | timestamp | Upload date |

## Migration Strategy

### Phase 1: Authentication
1. Replace `AuthContext` logic with Supabase `supabase.auth.signInWithPassword`.
2. Create `profiles` table to store user roles upon signup.

### Phase 2: Database Connection
1. Replace `localStorage.getItem("meddot_admin_notes")` with `supabase.from('notes').select('*')`.
2. Replace `localStorage.setItem` with `supabase.from('notes').insert()` in `AdminPage`.

### Phase 3: File Storage
1. Update `UploadForm` to utilize `supabase.storage.from('notes').upload()`.
2. Store the returned public URL in the `notes` table.
