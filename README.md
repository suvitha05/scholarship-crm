# Scholarship CRM Demo (K12 Hunar Frontend Assessment)

A small frontend-only dashboard to manage scholarships. No backend, no login.

## Run it
Open `index.html` in any modern browser. No install or build step.
(Optional: `python3 -m http.server` in this folder, then visit http://localhost:8000)
Live Demo Link : https://drive.google.com/file/d/1vvH_tZ5gsN8uLlZtHGguVxKIZt3zEPP-/view?usp=sharing

## Features
- Four summary cards: Total, Published, Draft, Expired (follow the selected state)
- Filter by Bihar, Haryana, Jharkhand (plus an extra status filter)
- Table of scholarships, which becomes stacked cards on mobile
- Change status (Published / Draft / Expired) from a dropdown in each row
- Add / Edit form with all nine fields and validation (required fields, valid http(s) link; deadline optional)
- Preview button showing how a scholarship appears to students

## Tech stack
Plain HTML, CSS and vanilla JavaScript. No libraries or build tools.

## Code layout
- `index.html`: page structure, two `<dialog>` modals (form, preview)
- `style.css`: theme variables, layout, mobile table-to-cards, dark mode
- `data.js`: the nine sample records (provider, eligibility, benefit and link are placeholders)
- `app.js`: logic

## How it works
- **State:** one `scholarships` array plus `stateFilter` / `statusFilter` variables.
- **Filter:** `render()` filters the array by state (cards count this set), then by status (table shows this set).
- **Status change:** the row dropdown updates that record's `status`, then calls `render()`, so cards update instantly.
- **Form:** `openForm(id)` fills the dialog (blank for Add); `validate()` checks fields; `save()` updates or pushes a record.
- **Preview:** `openPreview(id)` builds a student-facing card, with a banner for Draft and Expired.

## Notes
Data resets on refresh by design (no backend).
