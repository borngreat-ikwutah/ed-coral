# Feature Implementation Matrix - EduCoral AI Student Planner Agent

This document tracks completed features and planned future milestones for the EduCoral AI academic tracking platform.

## 📋 Done Matrix

| Feature ID | Feature Component | Priority | Status | Description |
| :--- | :--- | :---: | :---: | :--- |
| **F-01** | Strict `src/` Layout restructures | High | 🟢 Done | Relocated all `app/` files, including RealFaviconGenerator assets, to standard `src/app/` folder. |
| **F-02** | TypeScript Typing Bindings | High | 🟢 Done | Added strict definitions for `AssignmentRow` and `AgentServerResponse` in `src/types/index.ts`. |
| **F-03** | Strict ESLint Configurations | High | 🟢 Done | Configured rigid build and formatting rules inside flat `eslint.config.mjs`. |
| **F-04** | Seed Academic Local Dataset | High | 🟢 Done | Seeded comprehensive `data/assignments.json` representing courses, due dates, statuses, and GitHub issue states. |
| **F-05** | Coral Data Source Specs | High | 🟢 Done | Configured and successfully linted `config/academic_tracker.yaml` using custom `dsl_version: 3` and `backend: file` definitions. |
| **F-06** | Dual-Viewport Workspace | High | 🟢 Done | Implemented dual-pane client interface displaying `ChatViewport` side-by-side with live `SqlConsole`. |
| **F-07** | Local SQL Executions API | High | 🟢 Done | Created secure route backend `src/app/api/agent/route.ts` which spawns the local `/home/borngreat/.local/bin/coral sql` binary securely. |
| **F-08** | Academic Coach Briefings | High | 🟢 Done | Programmed dual-pass parser compiling raw JSON rows into encouraging academic advisor reviews using Markdown rules. |
| **F-09** | Notion Workspace Connector | Medium | 🟢 Done | Built connection widgets allowing users to prompt and simulate token sync links for Notion pages. |

---

## 🔮 Roadmap Milestones (Planned)

- [ ] **F-10: Live GitHub Webhook Integrations** — Real-time event notifications for actual issue state transitions.
- [ ] **F-11: Actual Notion API Syncing** — Fetch active syllabus items dynamically using the connected token.
- [ ] **F-12: SQLite Backup Backend** — Persist student inquiries and local settings database via sqlite3 source configurations.
- [ ] **F-13: Interactive Cal-Dav Export** — Generate `.ics` files enabling direct imports to Google Calendar or Apple Calendar.
