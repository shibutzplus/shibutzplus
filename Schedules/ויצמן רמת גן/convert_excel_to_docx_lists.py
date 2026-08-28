import os
import sys
import re
from datetime import datetime
import openpyxl

# התאמת קידוד פלט ל-UTF-8 בסביבת Windows
if sys.stdout:
    sys.stdout.reconfigure(encoding='utf-8')

from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

DAYS_ORDER = [
    ('ראשון', 'יום ראשון'),
    ('שני', 'יום שני'),
    ('שלישי', 'יום שלישי'),
    ('רביעי', 'יום רביעי'),
    ('חמישי', 'יום חמישי'),
    ('שישי', 'יום שישי'),
]

WORKGROUP_KEYWORDS = [
    "שילוב", "שהייה", "פרטני", "צוות", "ישיב", "ריכוז", "השתלמות", "ניהול", "תפקיד", "חלון", "הדרכה", "הכלה", "מליאה"
]


def set_cell_margins(cell, top=5, bottom=5, left=50, right=50):
    """הגדרת שוליים לתא בטבלה"""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)


def set_cell_shading(cell, color_hex):
    """הגדרת צבע רקע לתא"""
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._element.get_or_add_tcPr().append(shd)


def set_rtl(paragraph_or_cell):
    """הגדרת כיווניות RTL"""
    pPr = paragraph_or_cell._element.get_or_add_pPr() if hasattr(paragraph_or_cell, '_element') else paragraph_or_cell
    if pPr.find(qn('w:bidi')) is None:
        pPr.append(OxmlElement('w:bidi'))


def format_hour_label(raw_hour):
    """עיצוב תווית השעה בפורמט קורצאק"""
    if not raw_hour:
        return ""
    
    text = str(raw_hour).strip()
    
    # בדיקת שעות מיוחדות כמו "בוקר מה נשמע"
    if "בוקר" in text or "08:00-08:15" in text:
        return "שעה 0 (08:00-08:15)"
    
    # בדיקת תבנית שעה + טווח שעות (למשל: "1\n08:15-09:00" או "1")
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if len(lines) >= 2 and re.match(r'^\d+$', lines[0]) and '-' in lines[1]:
        return f"שעה {lines[0]} ({lines[1]})"
    
    match = re.match(r'^(\d+)\s*\((.*?)\)$', text)
    if match:
        return f"שעה {match.group(1)} ({match.group(2)})"
    
    # שעה שהיא מספר בודד
    if text.isdigit():
        return f"שעה {text}"
    
    return f"שעה {text}"


def format_class_lesson_cell(cell_value):
    """עיצוב תא שיעור במערכת כיתות"""
    if not cell_value:
        return ""
    
    text = str(cell_value).strip()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if not lines:
        return ""
    
    # אם כבר מופרד בפסיקים
    if len(lines) == 1:
        val = lines[0]
        if any(kw in val for kw in WORKGROUP_KEYWORDS):
            return val
        return f"{val}, הוראה" if "הוראה" not in val else val
    
    # במידה ויש שורה 1 מקצוע ושורה 2 מורה
    # למשל: חשבון \n מריאן זוהר -> חשבון, מריאן זוהר, הוראה
    joined = ', '.join(lines)
    if not any(kw in joined for kw in WORKGROUP_KEYWORDS) and "הוראה" not in joined:
        joined += ", הוראה"
    return joined


def format_teacher_lesson_cell(cell_value):
    """עיצוב תא שיעור במערכת מורים"""
    if not cell_value:
        return ""
    
    text = str(cell_value).strip()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if not lines:
        return ""
    
    joined = ', '.join(lines)
    
    # אם מכיל שהייה, פרטני, ישיבה וכו'
    if any(kw in joined for kw in WORKGROUP_KEYWORDS):
        return joined
    
    # אם זה שיעור רגיל (מקצוע + כיתה)
    if "הוראה" not in joined:
        joined += ", הוראה"
    return joined


def parse_excel_schedules(excel_path, is_teacher_file=False):
    """חילוץ כל מערכות השעות מקובץ אקסל (כיתות או מורים)"""
    wb = openpyxl.load_workbook(excel_path)
    ws = wb.active
    
    schedules = []
    r = 1
    
    while r <= ws.max_row:
        first_cell = ws.cell(row=r, column=1).value
        
        # חיפוש תחילת מערכת שעות חדשה
        if first_cell and str(first_cell).strip().startswith("מערכת שעות"):
            title_text = str(first_cell).strip()
            r += 1
            
            # שורת כותרות הימים
            header_row_vals = [ws.cell(row=r, column=c).value for c in range(1, 8)]
            day_col_map = {}
            for c_idx, val in enumerate(header_row_vals, start=1):
                if val:
                    val_str = str(val).strip()
                    for day_key, _ in DAYS_ORDER:
                        if day_key in val_str:
                            day_col_map[day_key] = c_idx
            
            r += 1
            day_schedule = {day_key: [] for day_key, _ in DAYS_ORDER}
            
            # קריאת שורות השעות
            while r <= ws.max_row:
                hour_cell = ws.cell(row=r, column=1).value
                # אם הגענו לכותרת חדשה הבאה או שורה ריקה לחלוטין שמסמנת סיום
                if hour_cell and str(hour_cell).strip().startswith("מערכת שעות"):
                    break
                
                row_vals = [ws.cell(row=r, column=c).value for c in range(1, 8)]
                if not any(v is not None for v in row_vals):
                    # בדיקה אם השורה הבאה היא כותרת
                    next_first = ws.cell(row=r+1, column=1).value if r+1 <= ws.max_row else None
                    if next_first and str(next_first).strip().startswith("מערכת שעות"):
                        r += 1
                        break
                    r += 1
                    continue
                
                if hour_cell:
                    hour_label = format_hour_label(hour_cell)
                    for day_key, _ in DAYS_ORDER:
                        if day_key in day_col_map:
                            col_idx = day_col_map[day_key]
                            cell_v = ws.cell(row=r, column=col_idx).value
                            if cell_v and str(cell_v).strip():
                                if is_teacher_file:
                                    formatted_text = format_teacher_lesson_cell(cell_v)
                                else:
                                    formatted_text = format_class_lesson_cell(cell_v)
                                
                                if formatted_text:
                                    day_schedule[day_key].append((hour_label, formatted_text))
                r += 1
            
            schedules.append({
                'title_text': title_text,
                'schedule': day_schedule
            })
        else:
            r += 1
            
    return schedules


def create_docx_from_schedules(output_docx_path, schedules, school_name="ויצמן"):
    """יצירת קובץ DOCX בפורמט רשימות קורצאק"""
    out_doc = Document()

    # הגדרת שוליים
    for section in out_doc.sections:
        section.top_margin = Pt(11)
        section.bottom_margin = Pt(22)
        section.left_margin = Pt(22)
        section.right_margin = Pt(22)

    now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    for idx, item in enumerate(schedules):
        # 1. טבלת מטא (תאריך ושם בית ספר)
        meta_table = out_doc.add_table(rows=1, cols=2)
        meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        c0 = meta_table.rows[0].cells[0]
        c0.text = now_str
        p0 = c0.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p0.runs[0].font.name = 'Arial'
        p0.runs[0].font.size = Pt(10)
        
        c1 = meta_table.rows[0].cells[1]
        c1.text = school_name
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p1.runs[0].font.name = 'Arial'
        p1.runs[0].font.size = Pt(10)

        # 2. כותרת המערכת (ממורכזת, מודגשת, 14pt)
        title_p = out_doc.add_paragraph()
        title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        t_run = title_p.add_run(item['title_text'])
        t_run.font.name = 'Arial'
        t_run.font.size = Pt(14)
        t_run.font.bold = True
        t_run.font.color.rgb = RGBColor(0, 0, 0)
        set_rtl(title_p)

        # 3. טבלת רשימת השיעורים (2 עמודות)
        day_schedule = item['schedule']
        total_rows = 0
        active_days = []
        for day_key, day_title in DAYS_ORDER:
            lessons = day_schedule.get(day_key, [])
            if lessons:
                active_days.append((day_title, lessons))
                total_rows += 1 + len(lessons)

        if total_rows > 0:
            list_table = out_doc.add_table(rows=total_rows, cols=2)
            list_table.alignment = WD_TABLE_ALIGNMENT.CENTER
            
            tblGrid = parse_xml(f'<w:tblGrid {nsdecls("w")}><w:gridCol w:w="6000"/><w:gridCol w:w="2000"/></w:tblGrid>')
            list_table._element.insert(1, tblGrid)

            curr_row_idx = 0
            for day_title, lessons in active_days:
                # שורת כותרת יום (רקע כחול כהה #28486B, טקסט לבן מודגש)
                day_row = list_table.rows[curr_row_idx]
                
                c_left = day_row.cells[0]
                set_cell_shading(c_left, '28486B')
                set_cell_margins(c_left)
                set_rtl(c_left.paragraphs[0])
                
                c_right = day_row.cells[1]
                set_cell_shading(c_right, '28486B')
                set_cell_margins(c_right)
                p_r = c_right.paragraphs[0]
                p_r.alignment = WD_ALIGN_PARAGRAPH.LEFT
                r_day = p_r.add_run(day_title)
                r_day.font.name = 'Arial'
                r_day.font.size = Pt(9)
                r_day.font.bold = True
                r_day.font.color.rgb = RGBColor(255, 255, 255)
                set_rtl(p_r)
                
                curr_row_idx += 1

                # שורות השיעורים
                for hour_label, lesson_content in lessons:
                    lesson_row = list_table.rows[curr_row_idx]
                    
                    # תא שמאל - פרטי השיעור
                    c_lesson = lesson_row.cells[0]
                    set_cell_shading(c_lesson, 'FFFFFF')
                    set_cell_margins(c_lesson)
                    p_les = c_lesson.paragraphs[0]
                    p_les.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    r_les = p_les.add_run(lesson_content)
                    r_les.font.name = 'Arial'
                    r_les.font.size = Pt(9)
                    r_les.font.color.rgb = RGBColor(0, 0, 0)
                    set_rtl(p_les)

                    # תא ימין - שעה
                    c_hour = lesson_row.cells[1]
                    set_cell_shading(c_hour, 'FFFFFF')
                    set_cell_margins(c_hour)
                    p_hr = c_hour.paragraphs[0]
                    p_hr.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    r_hr = p_hr.add_run(hour_label)
                    r_hr.font.name = 'Arial'
                    r_hr.font.size = Pt(9)
                    r_hr.font.color.rgb = RGBColor(0, 0, 0)
                    set_rtl(p_hr)

                    curr_row_idx += 1

        # מעבר עמוד בין מערכות
        if idx < len(schedules) - 1:
            p_break = out_doc.add_paragraph()
            p_break.add_run().add_break(WD_BREAK.PAGE)

    out_doc.save(output_docx_path)
    print(f"נוצר בהצלחה: {output_docx_path}")


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. המרת כיתות.xlsx -> כיתות.docx
    classes_excel = os.path.join(base_dir, "כיתות.xlsx")
    classes_docx = os.path.join(base_dir, "כיתות.docx")
    if os.path.exists(classes_excel):
        print(f"ממיר קובץ כיתות: {classes_excel}...")
        classes_schedules = parse_excel_schedules(classes_excel, is_teacher_file=False)
        print(f"נמצאו {len(classes_schedules)} מערכות שעות של כיתות.")
        create_docx_from_schedules(classes_docx, classes_schedules, school_name="ויצמן")
    
    # 2. המרת מורים.xlsx -> מורים.docx
    teachers_excel = os.path.join(base_dir, "מורים.xlsx")
    teachers_docx = os.path.join(base_dir, "מורים.docx")
    if os.path.exists(teachers_excel):
        print(f"\nממיר קובץ מורים: {teachers_excel}...")
        teachers_schedules = parse_excel_schedules(teachers_excel, is_teacher_file=True)
        print(f"נמצאו {len(teachers_schedules)} מערכות שעות של מורים.")
        create_docx_from_schedules(teachers_docx, teachers_schedules, school_name="ויצמן")


if __name__ == "__main__":
    main()
