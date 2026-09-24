# Content Studio Interface Design Concepts

This directory contains two interactive GUI design prototypes exploring different UI/UX paradigms for the **TagSci Content Studio**.

---

## 🎨 Overview of the Two Concepts

### [Concept 1: Workspace & Document Hub Model (`concept_1_homepage_hub.html`)](file:///C:/Projects/SSLG/G11%20Study%20WebApp/draft/concept_1_homepage_hub.html)
> **Inspiration**: Notion, Linear, Canva, Google Docs / Drive Workspace Portal

* **Architecture**: 
  - **Hub / Overview Dashboard**: Serves as the landing homepage. Displays workspace statistics (total published modules, question bank counts, upcoming deadlines), quick "+ New Reviewer" / "+ New Exam Bank" action cards, Subject Portals (General Math, Oral Comm, Earth & Life Science), and a recent documents table with filter chips.
  - **Focused Document Editor**: Clicking any module or "+ New" card opens a clean, focused editing environment with breadcrumb navigation (`Home > General Mathematics > Functions Reviewer`) and a "← Back to Hub" button.
* **Best For**: 
  - Writers and editorial contributors who prefer high-level organization, clean document browsing, and distraction-free writing.
  - Easy scaling when many subjects and quarterly modules are added.

---

### [Concept 2: Desktop Productivity & Ribbon GUI (`concept_2_ribbon_office.html`)](file:///C:/Projects/SSLG/G11%20Study%20WebApp/draft/concept_2_ribbon_office.html)
> **Inspiration**: Microsoft Excel / Office Fluent Ribbon, VS Code & Google Sheets

* **Architecture**:
  - **Top Quick-Access Titlebar**: App brand, active file indicator (`updates.json • [Gen Math]*`), Quick Save (`Ctrl+S`), Undo/Redo, Search bar, and Git OTA Sync status.
  - **Dynamic Ribbon Command Bar**: Menu tabs (`File`, `Reviewer & Notes`, `Quiz & Drill Bank`, `Deadlines & Calendar`, `Math & Tools`, `View & Simulation`) with categorized toolbars that switch tools dynamically.
  - **Curriculum Tree Explorer (Left Panel)**: Hierarchical outline of subjects → modules → sections and question items.
  - **Formula & Context Bar (`fx`)**: Shows current JSON path and auto-save state.
  - **Sheet Tabs at Bottom**: Multi-tab switcher (`[ 📄 Reviewer: Functions ] [ 🧠 Quiz: Summative Exam ] [ 📅 Calendar ] [ ⚙️ Metadata ]`).
* **Best For**:
  - Power users and editors who want all authoring tools (KaTeX, callout boxes, formatting, question generators, schema linters) accessible with one click without changing pages.
  - Fast multi-tasking between reviewers, quiz questions, and subject metadata.

---

## 🖥️ How to Preview

You can open either HTML file directly in your browser:
- Open [`concept_1_homepage_hub.html`](file:///C:/Projects/SSLG/G11%20Study%20WebApp/draft/concept_1_homepage_hub.html) in your browser.
- Open [`concept_2_ribbon_office.html`](file:///C:/Projects/SSLG/G11%20Study%20WebApp/draft/concept_2_ribbon_office.html) in your browser.
