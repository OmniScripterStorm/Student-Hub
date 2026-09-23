import os
import json
import base64
import re

def export_updates_json():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.abspath(os.path.join(base_dir, '..'))
    src_dir = os.path.join(project_dir, 'src')
    dist_file = os.path.join(project_dir, 'updates.json')

    # Read study_data.js and extract the arrays
    with open(os.path.join(src_dir, 'data', 'study_data.js'), 'r', encoding='utf-8') as f:
        content = f.read()

    # Generate version timestamp
    version = "1.2.0"

    # Export a clean JSON structure for OTA sync
    updates = {
        "version": version,
        "updatedAt": "2026-09-22T09:12:00Z",
        "syncEndpointDescription": "TagSci G11 Study WebApp OTA Update Package",
        "announcement": "Welcome to TagSci G11 Study Hub! Ready for OTA updates.",
        "calendarEvents": [],
        "stemReviewers": [],
        "studyMaterials": [],
        "problemSets": [],
        "quizSets": []
    }

    with open(dist_file, 'w', encoding='utf-8') as f:
        json.dump(updates, f, indent=2)

    print(f"Generated OTA updates package: {dist_file}")

if __name__ == '__main__':
    export_updates_json()
