# Teacher Sign-In Logic

1. **URL without parameters** OR **URL with a wrong school parameter**
   - **Action**: Go to `ContactAdminError` and display a message.

2. **URL with `school_id` only**
   e.g. http://shibutzplus.com/teacher-sign-in/[school_id]
   - **Scenario A**: Teacher `localStorage` exists
     - **Action**: Auto-login to portal.
   - **Scenario B**: Teacher `localStorage` does not exist
     - **Action**: Show regular teacher list for that school.

3. **URL with `school_id` + `teacher_id`**
   e.g. http://shibutzplus.com/teacher-material/[school_id]/[teacher_id]
   - **Action**: Auto-login to the teacher’s portal.

4. **URL with `auth=logout`**
   - **Scenario A**: Teacher is **SUBSTITUTE**
     - **Action**: Show "Welcome [Name]" (No dropdown) AND Clear localStorage.
   - **Scenario B**: Teacher is **REGULAR**
     - **Action**: Show School Regular Teachers Dropdown List.
