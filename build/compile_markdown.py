import os
import json
import re

def parse_frontmatter(content):
    frontmatter = {}
    body = content
    pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        header_text = match.group(1)
        body = match.group(2)
        for line in header_text.split('\n'):
            if ':' in line:
                key, val = line.split(':', 1)
                frontmatter[key.strip()] = val.strip()
    return frontmatter, body

def markdown_to_html(md):
    lines = md.strip().split('\n')
    html_lines = []
    in_list = False

    for line in lines:
        stripped = line.strip()
        if stripped.startswith('#### '):
            if in_list: html_lines.append('</ul>'); in_list = False
            html_lines.append(f'<h5 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1">{stripped[5:]}</h5>')
        elif stripped.startswith('### '):
            if in_list: html_lines.append('</ul>'); in_list = False
            html_lines.append(f'<h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5">{stripped[4:]}</h4>')
        elif stripped.startswith('## '):
            if in_list: html_lines.append('</ul>'); in_list = False
            html_lines.append(f'<h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">{stripped[3:]}</h3>')
        elif stripped.startswith('# '):
            if in_list: html_lines.append('</ul>'); in_list = False
            html_lines.append(f'<h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">{stripped[2:]}</h2>')
        elif stripped.startswith('- ') or stripped.startswith('* '):
            if not in_list:
                html_lines.append('<ul class="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">')
                in_list = True
            item_text = stripped[2:]
            item_text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', item_text)
            html_lines.append(f'<li>{item_text}</li>')
        elif stripped == '':
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            html_lines.append('<div class="h-1.5"></div>')
        else:
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            p_text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', line)
            html_lines.append(f'<p class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed my-1">{p_text}</p>')

    if in_list:
        html_lines.append('</ul>')

    return '\n'.join(html_lines)

def parse_quiz_markdown(file_content):
    fm, body = parse_frontmatter(file_content)
    blocks = body.split('---')
    questions = []

    for b in blocks:
        clean_b = b.strip()
        if not clean_b: continue

        q = {
            'type': 'mcq',
            'topic': 'STEM Drill',
            'prompt': '',
            'options': [],
            'answerIndex': 0,
            'correctValue': '',
            'tolerance': '0.05',
            'front': '',
            'back': '',
            'explanation': ''
        }

        # Check for type hint in title like ### Question 1 (numerical)
        if '(numerical)' in clean_b: q['type'] = 'numerical'
        elif '(true_false)' in clean_b: q['type'] = 'true_false'
        elif '(identification)' in clean_b: q['type'] = 'identification'
        elif '(multi_select)' in clean_b: q['type'] = 'multi_select'
        elif '(flashcard)' in clean_b: q['type'] = 'flashcard'
        else: q['type'] = 'mcq'

        # Parse explanation
        expl_match = re.search(r'>\s*\*\*Explanation:\*\*\s*(.*)', clean_b, re.DOTALL)
        if expl_match:
            q['explanation'] = expl_match.group(1).strip()
            clean_b = clean_b[:expl_match.start()].strip()

        # Parse true_false specifics
        if q['type'] == 'true_false':
            tf_m = re.search(r'answerBoolean:\s*([^\n]+)', clean_b, re.IGNORECASE)
            if tf_m:
                q['answerBoolean'] = tf_m.group(1).strip().lower() in ('true', '1', 'yes')
            clean_b = re.sub(r'answerBoolean:[^\n]+', '', clean_b)

        # Parse identification specifics
        if q['type'] == 'identification':
            txt_m = re.search(r'correctText:\s*([^\n]+)', clean_b)
            if txt_m: q['correctText'] = txt_m.group(1).strip()
            al_m = re.search(r'aliases:\s*([^\n]+)', clean_b)
            if al_m: q['aliases'] = al_m.group(1).strip()
            clean_b = re.sub(r'correctText:[^\n]+', '', clean_b)
            clean_b = re.sub(r'aliases:[^\n]+', '', clean_b)

        # Parse numerical specifics
        if q['type'] == 'numerical':
            val_m = re.search(r'correctValue:\s*([^\n]+)', clean_b)
            if val_m: q['correctValue'] = val_m.group(1).strip()
            tol_m = re.search(r'tolerance:\s*([^\n]+)', clean_b)
            if tol_m: q['tolerance'] = tol_m.group(1).strip()
            unit_m = re.search(r'unit:\s*([^\n]+)', clean_b)
            if unit_m: q['unit'] = unit_m.group(1).strip()
            clean_b = re.sub(r'correctValue:[^\n]+', '', clean_b)
            clean_b = re.sub(r'tolerance:[^\n]+', '', clean_b)
            clean_b = re.sub(r'unit:[^\n]+', '', clean_b)

        # Parse flashcard specifics
        if q['type'] == 'flashcard':
            front_m = re.search(r'front:\s*([^\n]+)', clean_b)
            if front_m: q['front'] = front_m.group(1).strip()
            back_m = re.search(r'back:\s*(.*)', clean_b, re.DOTALL)
            if back_m: q['back'] = back_m.group(1).strip()

        # Parse MCQ / Multi-select checkboxes
        lines = clean_b.split('\n')
        prompt_lines = []
        q['answerIndices'] = []
        for line in lines:
            if line.strip().startswith('### '):
                q['topic'] = line.strip().replace('### ', '').split('(')[0].strip()
            elif line.strip().startswith('- [x]'):
                q['options'].append(line.strip().replace('- [x]', '').strip())
                idx = len(q['options']) - 1
                q['answerIndex'] = idx
                q['answerIndices'].append(idx)
            elif line.strip().startswith('- [ ]'):
                q['options'].append(line.strip().replace('- [ ]', '').strip())
            else:
                prompt_lines.append(line)

        if not q['front']:
            q['prompt'] = '\n'.join(prompt_lines).strip()
        else:
            q['prompt'] = q['front']

        questions.append(q)

    return {
        'id': fm.get('id', 'quiz_set'),
        'subject': fm.get('subject', 'STEM'),
        'tag': fm.get('tag', 'Quiz'),
        'title': fm.get('title', 'STEM Quiz Set'),
        'desc': fm.get('desc', ''),
        'timeLimitMinutes': int(fm.get('timeLimitMinutes', 15)),
        'questions': questions
    }

def compile_markdown_content():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.abspath(os.path.join(base_dir, '..'))
    content_dir = os.path.join(project_dir, 'content')
    updates_file = os.path.join(project_dir, 'updates.json')

    subject_metadata = {
        'TagSci': {'type': 'Institutional', 'color': 'border-l-4 border-tagsci-700'},
        'DepEd': {'type': 'DepEd', 'color': 'border-l-4 border-blue-600'},
        'Effective Communications': {'type': 'Main', 'color': 'border-l-4 border-blue-500'},
        'Mabisang Komunikasyon': {'type': 'Main', 'color': 'border-l-4 border-amber-500'},
        'Life and Career Skills': {'type': 'Main', 'color': 'border-l-4 border-emerald-500'},
        'General Math': {'type': 'Main', 'color': 'border-l-4 border-g11pink-500'},
        'General Science': {'type': 'Main', 'color': 'border-l-4 border-teal-500'},
        'Finite Math': {'type': 'Elective', 'color': 'border-l-4 border-purple-500'},
        'Physics': {'type': 'Elective', 'color': 'border-l-4 border-tagsci-600'},
        'Chemistry': {'type': 'Elective', 'color': 'border-l-4 border-indigo-500'},
        'Biology': {'type': 'Elective', 'color': 'border-l-4 border-green-600'}
    }

    # 1. Reviewers
    reviewers = []
    rev_dir = os.path.join(content_dir, 'reviewers')
    if os.path.exists(rev_dir):
        for fname in sorted(os.listdir(rev_dir)):
            if fname.endswith('.md'):
                with open(os.path.join(rev_dir, fname), 'r', encoding='utf-8') as f:
                    fm, body = parse_frontmatter(f.read())
                    subj = fm.get('subject', 'General Science')
                    meta = subject_metadata.get(subj, {'type': 'Main', 'color': 'border-l-4 border-tagsci-600'})
                    tag = fm.get('tag', meta['type'])
                    reviewers.append({
                        'id': fm.get('id', fname.replace('.md', '')),
                        'subject': subj,
                        'tag': tag,
                        'color': meta['color'],
                        'title': fm.get('title', 'Untitled Reviewer'),
                        'summary': fm.get('summary', ''),
                        'content': markdown_to_html(body)
                    })

    # 2. Study Materials
    materials = []
    mat_dir = os.path.join(content_dir, 'study_materials')
    if os.path.exists(mat_dir):
        for fname in sorted(os.listdir(mat_dir)):
            if fname.endswith('.md'):
                with open(os.path.join(mat_dir, fname), 'r', encoding='utf-8') as f:
                    fm, body = parse_frontmatter(f.read())
                    tag = fm.get('tag', 'General')
                    materials.append({
                        'id': fm.get('id', fname.replace('.md', '')),
                        'subject': fm.get('subject', 'Core'),
                        'tag': tag,
                        'color': tag_colors.get(tag, 'border-l-4 border-tagsci-600'),
                        'title': fm.get('title', 'Study Note'),
                        'summary': fm.get('summary', ''),
                        'content': markdown_to_html(body)
                    })

    # 3. Calendar Events
    calendar_events = []
    cal_dir = os.path.join(content_dir, 'calendar')
    if os.path.exists(cal_dir):
        for fname in os.listdir(cal_dir):
            if fname.endswith('.md'):
                with open(os.path.join(cal_dir, fname), 'r', encoding='utf-8') as f:
                    blocks = f.read().split('---')
                    for block in blocks:
                        clean_block = block.strip()
                        if not clean_block: continue
                        fm = {}
                        for line in clean_block.split('\n'):
                            if ':' in line:
                                k, v = line.split(':', 1)
                                fm[k.strip()] = v.strip()
                        if 'date' in fm and 'title' in fm:
                            calendar_events.append({
                                'id': int(fm.get('id', len(calendar_events) + 1)),
                                'date': fm.get('date', ''),
                                'subject': fm.get('subject', 'STEM'),
                                'title': fm.get('title', ''),
                                'type': fm.get('type', 'event'),
                                'badge': fm.get('badge', 'Reminder'),
                                'desc': fm.get('desc', '')
                            })

    # 4. Quiz Sets
    quiz_sets = []
    quiz_dir = os.path.join(content_dir, 'quiz_sets')
    if os.path.exists(quiz_dir):
        for fname in sorted(os.listdir(quiz_dir)):
            if fname.endswith('.md'):
                with open(os.path.join(quiz_dir, fname), 'r', encoding='utf-8') as f:
                    quiz_obj = parse_quiz_markdown(f.read())
                    quiz_sets.append(quiz_obj)

    # 5. Payload
    payload = {
        "version": "1.4.0",
        "updatedAt": "2026-09-22T22:00:00Z",
        "announcement": f"Refreshed {len(reviewers)} Reviewers, {len(calendar_events)} Deadlines, and {len(quiz_sets)} Quiz Banks.",
        "calendarEvents": calendar_events,
        "stemReviewers": reviewers,
        "studyMaterials": materials,
        "problemSets": [],
        "quizSets": quiz_sets
    }

    with open(updates_file, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print(f"Compiled {len(reviewers)} reviewers, {len(calendar_events)} events, and {len(quiz_sets)} quiz sets into {updates_file}")

if __name__ == '__main__':
    compile_markdown_content()
