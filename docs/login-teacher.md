# Teacher Sign-In Logic

1. **URL without parameters** OR **URL with a wrong school parameter**
   - **Action**: Go to `ContactAdminError` and display a message.

2. **URL with `school_id` only**
   e.g. http://shibutzplus.com/teacher-sign-in/[school_id]
   - **Scenario A**: Teacher `localStorage` exists
     - **Action**: Auto-login to portal.
   - **Scenario B**: Teacher `localStorage` does not exist
     - **Action**: Show regular teacher list for that school.

3. **URL with `school_id` + `teacher_id`** (should not be in use but still supported)
   e.g. http://shibutzplus.com/teacher-material/[school_id]/[teacher_id]
   - **Action**: Auto-login to the teacher’s portal.

4. **URL with `auth=logout`**
   - **Scenario A**: Teacher is **SUBSTITUTE**
     - **Action**: Show "Welcome [Name]" (No dropdown) AND Clear localStorage.
   - **Scenario B**: Teacher is **REGULAR**
     - **Action**: Show School Regular Teachers Dropdown List.

## Portal Routing Decision

When logging in (cases 2A, 3, or form submit), the system determines which portal to open:
- If `displayAltSchedule` is **enabled** AND the daily schedule is **not published** for the current date:
  → Route to `/teacher-material-alt/[school_id]/[teacher_id]`
- Otherwise:
  → Route to `/teacher-material/[school_id]/[teacher_id]`

Note: if a teacher enters directly to http://shibutzplus.com/teacher-material/<school_id>/<teacher_id> the system will still go to teacher-material instead of teacher-material-alt/ even if the alt schedule is enabled and the daily schedule is not published.