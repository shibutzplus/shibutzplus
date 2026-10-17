# Autonomous School Schedule Update Workflow

## Scope
This rule applies whenever the user requests to update, import, convert, or process a school schedule (e.g., in `Schedules/` or for a specific school).

## Core Principle: End-to-End Autonomy
- **Do not ask for intermediate approvals or confirmations.** Do not ask "should I run the script?", "should I update this file?", or "do you want me to proceed with step X?".
- **Execute the entire pipeline autonomously from start to finish.**
- Only stop to ask a question if there is a blocking ambiguity or critical missing information that cannot be resolved or deduced from any file in the workspace.

## Processing Protocol

1. **Inspect Raw Input**:
   - Check the school's folder under `Schedules/<school_name>/`.
   - Identify the source files (Excel `.xlsx`, Word `.docx`, PDF `.pdf`).
   - Identify the structure (format of hours, days, classes, teacher abbreviations).

2. **Adapt / Create the School's Conversion Script**:
   - Inspect the existing script in that directory (e.g., `convert_excel_to_docx.py`, `convert_schedule_to_lists.py`) or use the pattern from established schools (such as `Schedules/שיא ראש העין/convert_excel_to_docx.py`).
   - Autonomously update all necessary mappings:
     - `TEACHER_LASTNAME_MAP`: Map any truncated/last-name mentions to full teacher names found in the school's teacher list or schedule.
     - `SUBJECT_MAP`: Normalize abbreviated subjects.
     - `HOUR_LABELS` & `DAYS_MAP`: Align with the specific school's bell schedule and days.

3. **Run & Self-Correct**:
   - Run the script.
   - If the script reports missing mappings, warnings, or errors, do not ask the user. Autonomously inspect the warning output, update the script's dictionary mappings, and re-run until clean.

4. **Final Summary**:
   - Only when the entire process is complete, output a clear and concise summary:
     - School processed
     - Files generated / updated
     - Summary of teachers and classes processed
     - Any notable findings or discrepancies
