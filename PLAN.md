# Calendar / Task Manager Project Plan

## Project Overview
A minimal, boxy, monochrome task and goal manager built with Next.js and Supabase. Designed for both desktop and mobile as a Progressive Web App (PWA). Access will be managed via Cloudflare Tunnel (no built-in authentication required).

## Technical Stack
- **Framework:** Next.js (App Router)
- **Backend:** Supabase (PostgreSQL)
- **PWA:** `@ducanh2912/next-pwa`
- **Styling:** Vanilla CSS / CSS Modules (Boxy, Light Mode, Monochrome)

---

## 1. Time Horizons & Hierarchical Structure

The application is centered around nested time horizons, moving from broad intentions to daily actions.
There are goals which are just text fields to remind and keep on track. Years, seasons, and months can only have goals.
Then there are tasks which can be checked-off and rescheduled, tasks can be scheduled to a specific day or a week.
Weeks can have goals and tasks. Days can only have tasks. 

**Logic Rules:**
- **Week Start:** Sunday.
- **Monthly View:** Shows any week that has at least one day in that month.

### Yearly View
- **Purpose:** Set a "North Star" goal for the entire year and an overview of the seasons you want to break the year up into.
- **Customization:** Editable season names and date ranges (e.g. season 1 jan-apr, season 2 may-aug, season 3 sep-dec).
- **Purpose:** Set goals for specific seasons of the year.

### Monthly View
- **Purpose:** Broad monthly planning and seasonal context.
- **Content:**
    - View seasonal goal(s).
    - Set monthly goals (non-checkable text).
    - Set weekly goals (non-checkable text) for each week in the month (any week touching the month).
    - View/Manage tasks assigned to specific days or specific weeks.

### Weekly View
- **Purpose:** Focus on the current week's objectives.
- **Content:**
    - Set weekly goals (non-checkable text).
    - Manage "Weekly Tasks" (checkable tasks not tied to a specific day).
    - View/Create tasks for each individual day in the week.
    - Reschedule tasks (move between days or move from a day to the "week" level).

### Daily View
- **Purpose:** Execute the day's tasks.
- **Content:**
    - View weekly goals and "Weekly Tasks".
    - View/Create/Manage tasks for the specific day.
    - Reschedule tasks (move to another day or back to the "week" level).

---

## 2. Database Schema (Supabase)
*Note: RLS is disabled as access is managed via Cloudflare Tunnel.*

### `app_config`
- `id`: primary key
- `seasonal_structure`: JSONB (stores user-defined season names and month ranges)
- `created_at`: timestamp

### `time_blocks`
- `id`: primary key
- `type`: enum ('yearly', 'seasonal', 'monthly', 'weekly')
- `year`: integer
- `period_index`: integer (month number, week number, or season index)
- `content`: text (the theme/goal)
- `updated_at`: timestamp

### `tasks`
- `id`: primary key
- `type`: enum ('day', 'week')
- `date`: date (represents the specific day for 'day' tasks, or the start of the week for 'week' tasks)
- `content`: text
- `is_completed`: boolean
- `created_at`: timestamp
- `updated_at`: timestamp

---

## 3. Design Principles
- **Aesthetic:** Minimalist, boxy, light mode..
    - **Hierarchy:** Defined by line styles:
        - `solid`: High-level containers or active elements (e.g., Year/Season borders).
        - `faded` (light grey): Secondary boundaries or background elements.
        - `dashed`: Placeholders, lower-level boundaries, or "Add Task" areas.
- **Corners:** Small and subtle rounded edges (e.g., `4px` border-radius).
- **Palette:** Mostly monochrome (Black/White/Grey).
- **Accents:** Minimal use of color (e.g., soft blue/green) only for critical status or priority info.
- **Layout:** "Horizon bar" navigation at the top: `YEAR | SEASON | MONTH | WEEK | DAY`.

---

## 4. Implementation Roadmap
1. [x] **Scaffold Project:** Initialize Next.js, install `@supabase/supabase-js` and `@ducanh2912/next-pwa`.
2. [x] **PWA Configuration:** Setup manifest and service worker.
3. [x] **Configuration Engine:** Build the logic for defining seasons and saving/loading themes.
4. [x] **Horizon UI:** Build the responsive, boxy layouts for each time horizon.
5. [ ] **Task System:** Implement CRUD for checkable tasks in Weekly/Daily views.
6. [ ] **Data Sync:** Connect all views to Supabase.
