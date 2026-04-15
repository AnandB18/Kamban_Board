# Final Deliverable Template

Use this as the source for your assessment PDF/DOCX.

## 1) Solution Overview

Built a dark-themed Kanban board with Supabase-backed persistence and row-level access controls. The app supports guest sessions, task creation/edit/delete, drag-and-drop status changes, due-date urgency indicators, and top-bar search/filtering.

## 2) Design Decisions

- Dark corporate visual style with tinted panels and fixed-width columns.
- Column headers are color-coded by status while cards stay neutral for readability.
- Horizontal board scrolling for responsive behavior on smaller screens.
- Task details/editing handled in a side drawer to preserve board context.

## 3) Live App URL

- Replace with deployed URL: `<LIVE_URL>`

## 4) GitHub Repository

- Replace with repository URL: `<GITHUB_REPO_URL>`

## 5) Database Schema

- Include SQL from `supabase/schema.sql`.

## 6) Local Setup Instructions

1. `npm install`
2. Create `.env` with:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run `npm run dev`
4. Ensure Supabase anonymous auth is enabled and run schema SQL.

## 7) Advanced Features Implemented

- Due-date urgency indicators with relative labels and full-date tooltip.
- Search and filtering from top bar.

## 8) Tradeoffs and Future Improvements

- Added client-side filtering for speed and simplicity; server-side filtering can be added for very large datasets.
- Current board reorders by status only; in-column custom sort ordering can be added next.
- Light mode toggle can be added via CSS variable theme switch.
- Activity history/comments could be layered in a task detail extension.
