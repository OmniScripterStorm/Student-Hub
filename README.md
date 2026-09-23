# Taguig Science High School (TagSci) — Grade 11 Student Hub
> *"Leading the Road to Excellence"*

A unified, offline-first, single-file study web application and OTA distribution system designed for the Grade 11 STEM cohort at Taguig Science High School.

---

## 🌟 Overview & Features

- **100% Offline Single-File WebApp**: Runs on any phone, tablet, or PC without needing an internet connection.
- **Academic Calendar & Deadlines**: Offline-computed monthly calendar highlighting quizzes, problem set submissions, and lab practicals.
- **STEM Reviewer Vault**: Dedicated reviewer decks for **Pre-Calculus, General Physics 1, General Chemistry 1, General Biology 1, and Research 1**.
- **Over-The-Air (OTA) Cloud Sync**: 1-click sync button in the navigation header that fetches fresh reviewers and calendar updates from this repository (`updates.json`) directly into browser cache without erasing personal notes.
- **Personal Task Checklist**: Ticked tasks and personal study to-dos persist across updates via browser `localStorage`.

---

## 📁 Repository Structure

```
├── content/                     # Markdown source files for study materials
│   ├── reviewers/               # Curated subject reviewer decks (.md)
│   ├── study_materials/         # Lecture notes & formula sheets (.md)
│   ├── problem_sets/            # Practice drills & problem sets (.md)
│   ├── quiz_sets/               # Self-test quiz collections (.md)
│   └── calendar/                # Calendar schedule entries (.md)
├── src/                         # Modular web app source code (Dev Mode)
│   ├── index.html               # Modular development HTML
│   ├── app.js                   # Application bootstrap
│   ├── data/                    # Data store & cache engine
│   └── components/              # Calendar, Reviewers, Tasks, Math, & Nav modules
├── build/
│   ├── build.py                 # Single-file HTML bundler
│   └── compile_markdown.py      # Markdown-to-JSON OTA compiler
├── updates.json                 # Hosted OTA payload for live in-app updates
├── hompage_test.html            # Production standalone single-file WebApp
└── tagsci logo.png              # Official school logo asset
```

---

## ✍️ How to Publish New Reviewers (For Editorial Council)

1. **Write or Edit Notes in Markdown**:
   Drop or create `.md` files inside `content/reviewers/`, `content/study_materials/`, or `content/calendar/`:
   ```markdown
   ---
   id: physics_projectile_2d
   subject: General Physics 1
   tag: Physics
   title: 2D Kinematics & Projectile Motion
   summary: Trajectory equations and horizontal/vertical component derivations.
   badge: Quarter 1
   ---

   ### Key Formulas:
   - Maximum Range: $$ R = \frac{v_0^2 \cdot \sin(2\theta)}{g} $$
   ```

2. **Compile to OTA Update Package**:
   ```bash
   python build/compile_markdown.py
   ```

3. **Re-bundle Production Single-File HTML** *(Optional, if core code changed)*:
   ```bash
   python build/build.py
   ```

4. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Q1 Physics Reviewer & Lab schedule"
   git push origin main
   ```

5. **Students Sync**:
   Students click **`⚡ Check Updates`** inside their web app, and the new materials are cached offline immediately!

---

## 🎓 Credits

- **Project Lead**: JV REJUSO, G11 REPRESENTATIVE
- **Curators & Content Writers**: TagSci G11 Editorial Council
- **Institution**: Taguig Science High School
