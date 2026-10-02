import os
import sys
import glob
import re
from datetime import datetime
import pymupdf
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r"c:\Dev\shibutzplus\Schedules\בן גוריון רמת גן"
TEACHERS_DIR = os.path.join(BASE_DIR, "מורים")
CLASS_PDF = os.path.join(BASE_DIR, "כיתות.pdf")
TEACHER_PDF = os.path.join(BASE_DIR, "מורים.pdf")
CLASS_DOCX = os.path.join(BASE_DIR, "כיתות.docx")
TEACHER_DOCX = os.path.join(BASE_DIR, "מורים.docx")

SCHOOL_ID = "gp651ekzhub38ib6tfgid4tg"
SCHOOL_NAME = "בן גוריון"
META_TIMESTAMP = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

HOUR_LABELS = {
    1: "שעה 1 (08:00-08:50)",
    2: "שעה 2 (08:50-09:40)",
    3: "שעה 3 (10:10-11:00)",
    4: "שעה 4 (11:00-11:45)",
    5: "שעה 5 (12:00-12:45)",
    6: "שעה 6 (12:45-13:30)",
    7: "שעה 7 (13:35-14:15)",
    8: "שעה 8 (14:15-15:00)",
    9: "שעה 9 (15:00-16:00)"
}

DAYS_ORDER = [
    (1, "יום ראשון"),
    (2, "יום שני"),
    (3, "יום שלישי"),
    (4, "יום רביעי"),
    (5, "יום חמישי"),
    (6, "יום שישי")
]

COL_TO_DAY = {
    5: 1,  # ראשון
    4: 2,  # שני
    3: 3,  # שלישי
    2: 4,  # רביעי
    1: 5,  # חמישי
    0: 6   # שישי
}

GRADE_ORDER = {'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10}

def class_sort_key(code):
    m = re.match(r'([א-ת]+)(\d+)', code)
    if m:
        grade = m.group(1)
        num = int(m.group(2))
        return (GRADE_ORDER.get(grade, 99), num)
    return (99, code)

CLASS_HOMEROOM = {
    'א1': 'נטע בר חיים',
    'א2': 'ליאור כהן',
    'א3': 'שרון ברלב',
    'ב1': 'אילנית שמש',
    'ב2': 'מיכל שושטרי',
    'ג1': 'סופי חן',
    'ג2': 'בילי כהן',
    'ד1': 'ויקטוריה גורדון',
    'ד2': 'מיכל רובין',
    'ד3': 'יעל מנור בכר',
    'ה1': 'לאה ארונס',
    'ה2': 'עדה שטרסברג',
    'ו1': 'דבי גל',
    'ו2': 'אלה שאולוב',
    'ז1': 'שגית שניר',
    'ז2': 'ריקי חתוקה',
    'ז3': 'אורלי וינקלר',
    'ח1': 'טלי הלוי',
    'ח2': 'מורן פיומי',
    'ח3': 'עירית אנגלר',
    'ח4': 'דנה גרוספלד'
}

TEACHER_NAME_MAP = {
    "איריס מנדלביץ": "איריס מנדלביץ",
    "**'איריס מנדלביץ": "איריס מנדלביץ",
    "און-דבי גל": "דבי גל",
    "דבי גל": "דבי גל",
    "דבי גל-און": "דבי גל",
    "דרמה-טל שובל": "טל שובל",
    "טל שובל": "טל שובל",
    "רובוטיק-אלכס גולוד": "אלכס גולוד",
    "רובוטיקה- אלכס גולוד": "אלכס גולוד",
    "רובוטיקה-אלכס גולוד": "אלכס גולוד",
    "אלכס גולוד": "אלכס גולוד",
    "אורן בן יוסף חנ''ג": "אורן בן יוסף",
    "אורן בן יוסף חנג": "אורן בן יוסף",
    "אורן בן יוסף": "אורן בן יוסף",
    "בתאל דודקביץ": "בת אל דודקביץ",
    "בת אל דודקביץ": "בת אל דודקביץ",
    "סלי זילביגר שפה": "סאלי זילביגר",
    "סאלי זילביגר": "סאלי זילביגר",
    "עדי ברל מחול": "עדי ברל",
    "עדי ברל": "עדי ברל",
    "עננים בינה": "עננים",
    "נטלי אורגנית": "נמרוד אורגנית",
    "נמרוד אורגנית": "נמרוד אורגנית",
    "מורה כלי מיתר": "כלי מיתר",
    "מורה שחמט": "שחמט",
    "משה מוריס": "מוריס",
    "מוריס": "מוריס",
    "ניצנים של בינה": "ניצנים של בינה",
    "צוות מוביל אחרי": "צוות מוביל",
    "הילה לוי מתי\"א": "הילה לוי מתיא",
    "הילה לוי מתיא": "הילה לוי מתיא",
    "וואקה טוקה": "טד טוק",
    "טד טוק": "טד טוק",
    "ליאור ברייאב": "ליאור ברייאב",
}

SUBJECT_CANONICAL_MAP = {
    "'סקראץ": "סקראץ",
    "אשכול בשבילי מורש": "בשבילי מורשת",
    "מגמות ג ד": "מגמות",
    "מגמות ה ו": "מגמות",
    "תנך": 'תנ"ך',
    "חשבון": "מתמטיקה",
}

def clean_teacher_name(name):
    clean = re.sub(r'^[*\s\'"\d]+', '', name).strip(' -_:,')
    clean = clean.replace('דרמה-', '').replace('רובוטיקה-', '').replace('רובוטיק-', '').replace('און-', '').strip(' -_:,')
    return TEACHER_NAME_MAP.get(clean, clean)

def clean_subject_name(subject):
    clean = subject.strip()
    return SUBJECT_CANONICAL_MAP.get(clean, clean)

def extract_class_code_from_title(title):
    num_m = re.search(r'(\d+)', title)
    num = num_m.group(1) if num_m else ''
    grade_m = re.search(r'(?:כיתה|כתה)\s*([א-ת])', title)
    grade = grade_m.group(1) if grade_m else ''
    return f"{grade}{num}"

def extract_teacher_name_from_title(title):
    clean = re.sub(r'^[*\s\'"\d]+', '', title)
    clean = clean.replace('מערכת שעות למורה', '').replace('מערכת שעות מורה', '').replace('מערכת שעות', '').strip()
    return clean_teacher_name(clean)

def normalize_class_code(raw):
    if not raw:
        return ""
    m = re.search(r'([1-9])\s*([א-ת])', raw)
    if m:
        return f"{m.group(2)}{m.group(1)}"
    m2 = re.search(r'([א-ת])\s*([1-9])', raw)
    if m2:
        return f"{m2.group(1)}{m2.group(2)}"
    return raw.strip()

def format_class_reference(code):
    code_norm = normalize_class_code(code)
    hr = CLASS_HOMEROOM.get(code_norm, "")
    return f"{code_norm} {hr}".strip() if hr else code_norm

def format_classes_string(raw_classes_str):
    s = raw_classes_str.strip()
    if s == '2,ד1,ד2,ג1ג':
        return f"{format_class_reference('ג1')},{format_class_reference('ג2')},{format_class_reference('ד1')},{format_class_reference('ד2')}"
    elif s == '2,ו1,ו2,ה1ה':
        return f"{format_class_reference('ה1')},{format_class_reference('ה2')},{format_class_reference('ו1')},{format_class_reference('ו2')}"
    elif s == '2,ד1ד':
        return f"{format_class_reference('ד1')},{format_class_reference('ד2')}"
    elif s == '2,ז1ז':
        return f"{format_class_reference('ז1')},{format_class_reference('ז2')}"

    return format_class_reference(s)

def set_cell_rtl(cell):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(r'<w:tcMar %s><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>' % nsdecls('w'))
    tcPr.append(tcMar)
    for p in cell.paragraphs:
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        pPr = p._p.get_or_add_pPr()
        pPr.append(parse_xml(r'<w:bidi %s/>' % nsdecls('w')))
        for r in p.runs:
            rPr = r._r.get_or_add_rPr()
            rPr.append(parse_xml(r'<w:rtl %s/>' % nsdecls('w')))

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_table_borders(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>'
        f'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D1D5DB"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E5E7EB"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def parse_class_cell_lessons(cell_text):
    lines = [l.strip() for l in cell_text.split('\n') if l.strip()]
    if len(lines) < 3:
        return []

    act = lines[0]
    raw_teacher = lines[1]
    raw_subj = lines[2]

    # Megamot (5 teachers)
    if 'יגא,דנה,שני,טל ,מש' in raw_teacher or 'מגמות' in raw_subj:
        megamot_teachers = ['יגאל מרכוס', 'דנה שיר', 'שנית יהודיין', 'טל שובל', 'מוריס']
        return [f"מגמות, {t}, הוראה" for t in megamot_teachers]

    # Multi-teacher split: אומנות + תיאטרון
    if 'אומנות,תיאטרון' in raw_subj or 'גל חיים ש,שנית יהודי' in raw_teacher:
        return [
            "אומנות, גל חיים שפילמן, הוראה",
            "תיאטרון, שנית יהודיין, הוראה"
        ]

    # Multi-teacher split: ניצנים של בינה
    if 'ניצנים של בינה' in raw_subj and ',' in raw_teacher:
        if 'אילנית' in raw_teacher:
            return [
                "ניצנים של בינה, אילנית שמש, הוראה",
                "ניצנים של בינה, ניצנים של בינה, הוראה"
            ]
        elif 'בילי' in raw_teacher:
            return [
                "ניצנים של בינה, בילי כהן, הוראה",
                "ניצנים של בינה, ניצנים של בינה, הוראה"
            ]
        elif 'סופי' in raw_teacher:
            return [
                "ניצנים של בינה, סופי חן, הוראה",
                "ניצנים של בינה, ניצנים של בינה, הוראה"
            ]

    # Multi-teacher split: אורגנית
    if 'אורגנית,עברית' in raw_subj or ('נמרוד' in raw_teacher and 'ליאור' in raw_teacher and 'עברית' in raw_subj):
        return [
            "אורגנית, נמרוד אורגנית, הוראה",
            "עברית, ליאור כהן, הוראה"
        ]
    if 'אורגנית,מוסיקה' in raw_subj or ('נמרוד' in raw_teacher and 'יגאל' in raw_teacher):
        return [
            "אורגנית, נמרוד אורגנית, הוראה",
            "מוסיקה, יגאל מרכוס, הוראה"
        ]
    if 'מדעים,אורגנית' in raw_subj or ('נמרוד' in raw_teacher and 'ליאור' in raw_teacher and 'מדעים' in raw_subj):
        return [
            "מדעים, ליאור כהן, הוראה",
            "אורגנית, נמרוד אורגנית, הוראה"
        ]

    # Team teaching: מתמטיקה (ז1, ז2)
    if 'מתמטיקה' in raw_subj and 'בילי כהן' in raw_teacher:
        if 'אלה שאולוב' in raw_teacher:
            return [
                "מתמטיקה, אלה שאולוב, הוראה",
                "מתמטיקה, בילי כהן, הוראה"
            ]
        elif 'סופי חן' in raw_teacher:
            return [
                "מתמטיקה, סופי חן, הוראה",
                "מתמטיקה, בילי כהן, הוראה"
            ]

    # כישורי חיים (מיכל רובין + מורן פיומי)
    if 'מיכל רובין,מורן פיומי' in raw_teacher:
        return [
            "כישורי חיים, מיכל רובין, הוראה",
            "כישורי חיים, מורן פיומי, הוראה"
        ]

    # Standard single teacher lesson
    teacher = clean_teacher_name(raw_teacher)
    subject = clean_subject_name(raw_subj)
    return [f"{subject}, {teacher}, {act}"]

def parse_teacher_cell_lessons(cell_text):
    lines = [l.strip() for l in cell_text.split('\n') if l.strip()]
    if not lines:
        return []

    if len(lines) == 1:
        if 'תפקיד' in lines[0]:
            return ["תפקיד, תפקיד"]
        return [f"{lines[0]}, {lines[0]}"]

    if len(lines) == 2:
        act, desc = lines[0], lines[1]
        if act == 'פרטני' and desc == 'פרטני':
            return ["פרטני, פרטני"]
        if act == 'שהייה' and desc == 'שהייה':
            return ["שהייה, שהייה"]
        if act == 'שהייה':
            return [f"{desc}, שהייה"]
        if act == 'תפקיד':
            return [f"{desc}, תפקיד"]
        return [f"{desc}, {act}"]

    act = lines[0]
    raw_cls = lines[1]
    raw_subj = lines[2]

    subject = clean_subject_name(raw_subj)
    cls_formatted = format_classes_string(raw_cls)

    return [f"{subject}, {cls_formatted}, {act}"]

def render_schedule_section(doc_out, title_text, day_lessons, is_last_page):
    # 1. Meta Header Table
    meta_table = doc_out.add_table(rows=1, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_cell_left = meta_table.cell(0, 0)
    meta_cell_right = meta_table.cell(0, 1)

    meta_cell_left.width = Inches(3.5)
    meta_cell_right.width = Inches(3.5)

    p_left = meta_cell_left.paragraphs[0]
    p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_left = p_left.add_run(META_TIMESTAMP)
    r_left.font.name = 'Calibri'
    r_left.font.size = Pt(8.5)
    r_left.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)

    p_right = meta_cell_right.paragraphs[0]
    p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_right = p_right.add_run(SCHOOL_NAME)
    r_right.font.name = 'Calibri'
    r_right.font.size = Pt(8.5)
    r_right.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)
    r_right.font.bold = True

    # 2. Title Paragraph
    p_title = doc_out.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pPr = p_title._p.get_or_add_pPr()
    pPr.append(parse_xml(r'<w:bidi %s/>' % nsdecls('w')))

    r_title = p_title.add_run(title_text)
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(14)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    # 3. Schedule Table
    sched_table = doc_out.add_table(rows=0, cols=2)
    sched_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(sched_table)

    for day_num, day_name in DAYS_ORDER:
        lessons = day_lessons.get(day_num, [])
        if not lessons:
            continue

        lessons.sort(key=lambda x: x[0])

        hdr_row = sched_table.add_row()
        c_left = hdr_row.cells[0]
        c_right = hdr_row.cells[1]

        c_left.width = Inches(5.2)
        c_right.width = Inches(2.0)

        set_cell_background(c_left, "28486B")
        set_cell_background(c_right, "28486B")

        p_rh = c_right.paragraphs[0]
        p_rh.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_rh = p_rh.add_run(day_name)
        r_rh.font.name = 'Calibri'
        r_rh.font.size = Pt(10.5)
        r_rh.font.bold = True
        r_rh.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        set_cell_rtl(c_left)
        set_cell_rtl(c_right)

        for hour_num, content in lessons:
            l_row = sched_table.add_row()
            lc_left = l_row.cells[0]
            lc_right = l_row.cells[1]

            lc_left.width = Inches(5.2)
            lc_right.width = Inches(2.0)

            p_l = lc_left.paragraphs[0]
            p_l.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r_l = p_l.add_run(content)
            r_l.font.name = 'Calibri'
            r_l.font.size = Pt(9.5)
            r_l.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

            p_r = lc_right.paragraphs[0]
            p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            lbl = HOUR_LABELS.get(hour_num, f"שעה {hour_num}")
            r_r = p_r.add_run(lbl)
            r_r.font.name = 'Calibri'
            r_r.font.size = Pt(9.0)
            r_r.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

            set_cell_rtl(lc_left)
            set_cell_rtl(lc_right)

    if not is_last_page:
        p_break = doc_out.add_paragraph()
        p_break.add_run().add_break(WD_BREAK.PAGE)

def process_classes():
    print(f"=== Processing Classes ===")
    doc_out = Document()
    for section in doc_out.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.6)
        section.right_margin = Inches(0.6)

    class_pages = {}

    if os.path.exists(TEACHERS_DIR):
        print(f"Reading class schedules from individual files in {TEACHERS_DIR}...")
        files = glob.glob(os.path.join(TEACHERS_DIR, "*.pdf"))
        for f in files:
            if " (1)" in f:
                continue
            doc = pymupdf.open(f)
            for p_num in range(len(doc)):
                page = doc[p_num]
                header_raw = page.get_text('text', clip=(0, 0, page.rect.width, 100)).strip()
                lines = [l.strip() for l in header_raw.split('\n') if l.strip()]
                title_line = lines[1] if len(lines) > 1 else (lines[0] if lines else "")
                if "כיתה" in title_line or "כתה" in title_line:
                    code = extract_class_code_from_title(title_line)
                    tabs = page.find_tables()
                    schedule_tabs = [t for t in tabs.tables if len(t.header.names) == 7]
                    if schedule_tabs:
                        class_pages[code] = {
                            'code': code,
                            'title': title_line,
                            'table': schedule_tabs[0],
                            'page': page,
                            'file': os.path.basename(f)
                        }

    # Fallback to CLASS_PDF if needed
    if not class_pages and os.path.exists(CLASS_PDF):
        print(f"Fallback: Reading class schedules from {CLASS_PDF}...")
        doc_pdf = pymupdf.open(CLASS_PDF)
        for p_num in range(len(doc_pdf)):
            page = doc_pdf[p_num]
            tabs = page.find_tables()
            schedule_tabs = [t for t in tabs.tables if len(t.header.names) == 7]
            if not schedule_tabs:
                continue
            header_raw = page.get_text('text', clip=(0, 0, page.rect.width, 100)).strip()
            lines = [l.strip() for l in header_raw.split('\n') if l.strip()]
            title_line = lines[1] if len(lines) > 1 else lines[0]
            code = extract_class_code_from_title(title_line)
            class_pages[code] = {
                'code': code,
                'title': title_line,
                'table': schedule_tabs[0],
                'page': page
            }

    sorted_codes = sorted(class_pages.keys(), key=class_sort_key)
    print(f"Total classes found to convert: {len(sorted_codes)}")

    for idx, code in enumerate(sorted_codes):
        cp = class_pages[code]
        page = cp['page']
        t = cp['table']
        hr_teacher = CLASS_HOMEROOM.get(code, "")
        title_text = f"מערכת שעות כיתה {code} {hr_teacher}".strip()

        day_lessons = {d_num: [] for d_num in range(1, 7)}
        for r_idx in range(2, len(t.rows)):
            row = t.rows[r_idx]
            hour_cell = row.cells[6] if len(row.cells) > 6 else None
            hour_text = page.get_text('text', clip=hour_cell).strip() if hour_cell else str(r_idx - 1)
            m_h = re.search(r'(\d+)', hour_text)
            hour_num = int(m_h.group(1)) if m_h else (r_idx - 1)

            for col_idx, day_num in COL_TO_DAY.items():
                if col_idx < len(row.cells) and row.cells[col_idx]:
                    raw_content = page.get_text('text', clip=row.cells[col_idx]).strip()
                    if raw_content:
                        fmt_lessons = parse_class_cell_lessons(raw_content)
                        if fmt_lessons:
                            day_lessons[day_num].append((hour_num, "\n".join(fmt_lessons)))

        is_last = (idx == len(sorted_codes) - 1)
        render_schedule_section(doc_out, title_text, day_lessons, is_last)

    doc_out.save(CLASS_DOCX)
    print(f"Successfully generated: {CLASS_DOCX} with {len(sorted_codes)} classes.")

def process_teachers():
    print(f"\n=== Processing Teachers ===")
    doc_out = Document()
    for section in doc_out.sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.6)
        section.right_margin = Inches(0.6)

    teacher_schedules = {}

    # 1. Read from individual files in TEACHERS_DIR
    if os.path.exists(TEACHERS_DIR):
        print(f"Reading teacher schedules from individual files in {TEACHERS_DIR}...")
        files = glob.glob(os.path.join(TEACHERS_DIR, "*.pdf"))
        for f in files:
            if " (1)" in f:
                continue
            doc = pymupdf.open(f)
            t_page = None
            t_title = None
            for p in range(len(doc)):
                header_raw = doc[p].get_text('text', clip=(0, 0, doc[p].rect.width, 100)).strip()
                lines = [l.strip() for l in header_raw.split('\n') if l.strip()]
                title_line = lines[1] if len(lines) > 1 else (lines[0] if lines else "")
                if "כיתה" not in title_line and "כתה" not in title_line:
                    t_page = doc[p]
                    t_title = title_line
                    break

            if not t_page:
                continue

            clean_name = extract_teacher_name_from_title(t_title)
            tabs = t_page.find_tables()
            schedule_tabs = [t for t in tabs.tables if len(t.header.names) == 7]
            if schedule_tabs:
                teacher_schedules[clean_name] = {
                    'name': clean_name,
                    'title': t_title,
                    'table': schedule_tabs[0],
                    'page': t_page,
                    'source': os.path.basename(f)
                }

    # 2. Read institutional entities from TEACHER_PDF if not present in individual files
    if os.path.exists(TEACHER_PDF):
        print(f"Checking for institutional entities in {TEACHER_PDF}...")
        doc_orig = pymupdf.open(TEACHER_PDF)
        for p_num in range(len(doc_orig)):
            page = doc_orig[p_num]
            header_raw = page.get_text('text', clip=(0, 0, page.rect.width, 100)).strip()
            lines = [l.strip() for l in header_raw.split('\n') if l.strip()]
            title_line = lines[1] if len(lines) > 1 else lines[0]
            clean_name = extract_teacher_name_from_title(title_line)

            # Skip replaced teachers
            if clean_name in ['נטלי אורגנית', 'וואקה טוקה']:
                continue

            if clean_name not in teacher_schedules:
                tabs = page.find_tables()
                schedule_tabs = [t for t in tabs.tables if len(t.header.names) == 7]
                if schedule_tabs:
                    teacher_schedules[clean_name] = {
                        'name': clean_name,
                        'title': title_line,
                        'table': schedule_tabs[0],
                        'page': page,
                        'source': 'מורים.pdf'
                    }
                    print(f"  Added institutional entity: {clean_name}")

    sorted_teachers = sorted(teacher_schedules.keys())
    print(f"Total teachers found to convert: {len(sorted_teachers)}")

    for idx, name in enumerate(sorted_teachers):
        ts = teacher_schedules[name]
        page = ts['page']
        t = ts['table']
        title_text = f"מערכת שעות מורה {name}".strip()

        day_lessons = {d_num: [] for d_num in range(1, 7)}
        for r_idx in range(2, len(t.rows)):
            row = t.rows[r_idx]
            hour_cell = row.cells[6] if len(row.cells) > 6 else None
            hour_text = page.get_text('text', clip=hour_cell).strip() if hour_cell else str(r_idx - 1)
            m_h = re.search(r'(\d+)', hour_text)
            hour_num = int(m_h.group(1)) if m_h else (r_idx - 1)

            for col_idx, day_num in COL_TO_DAY.items():
                if col_idx < len(row.cells) and row.cells[col_idx]:
                    raw_content = page.get_text('text', clip=row.cells[col_idx]).strip()
                    if raw_content:
                        fmt_lessons = parse_teacher_cell_lessons(raw_content)
                        if fmt_lessons:
                            day_lessons[day_num].append((hour_num, "\n".join(fmt_lessons)))

        is_last = (idx == len(sorted_teachers) - 1)
        render_schedule_section(doc_out, title_text, day_lessons, is_last)

    doc_out.save(TEACHER_DOCX)
    print(f"Successfully generated: {TEACHER_DOCX} with {len(sorted_teachers)} teachers.")

if __name__ == '__main__':
    process_classes()
    process_teachers()
